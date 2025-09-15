#!/usr/bin/env python
"""
Database Schema Documentation Generator
Generates comprehensive documentation of PostgreSQL database tables, relationships, and constraints
"""
import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection
from django.apps import apps

def get_table_schema():
    """Get detailed table schema information"""
    print("🗄️  PostgreSQL Database Schema Documentation")
    print("=" * 80)
    
    with connection.cursor() as cursor:
        # Get all tables in the database
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """)
        
        tables = [row[0] for row in cursor.fetchall()]
        
        print(f"📊 Total Tables: {len(tables)}")
        print()
        
        # Focus on application tables
        app_tables = [t for t in tables if not t.startswith('django_') and not t.startswith('auth_')]
        
        for table_name in app_tables:
            print(f"📋 Table: {table_name}")
            print("-" * 60)
            
            # Get column information
            cursor.execute("""
                SELECT 
                    column_name,
                    data_type,
                    is_nullable,
                    column_default,
                    character_maximum_length
                FROM information_schema.columns 
                WHERE table_name = %s 
                AND table_schema = 'public'
                ORDER BY ordinal_position;
            """, [table_name])
            
            columns = cursor.fetchall()
            
            print("Columns:")
            for col in columns:
                col_name, data_type, nullable, default, max_length = col
                nullable_str = "NULL" if nullable == "YES" else "NOT NULL"
                length_str = f"({max_length})" if max_length else ""
                default_str = f" DEFAULT {default}" if default else ""
                print(f"  • {col_name:<25} {data_type}{length_str:<15} {nullable_str}{default_str}")
            
            # Get foreign key constraints
            cursor.execute("""
                SELECT
                    kcu.column_name,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                    ON ccu.constraint_name = tc.constraint_name
                    AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_name = %s;
            """, [table_name])
            
            foreign_keys = cursor.fetchall()
            
            if foreign_keys:
                print("\nForeign Keys:")
                for fk in foreign_keys:
                    col_name, ref_table, ref_col = fk
                    print(f"  • {col_name} → {ref_table}.{ref_col}")
            
            # Get unique constraints
            cursor.execute("""
                SELECT
                    tc.constraint_name,
                    string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                WHERE tc.constraint_type = 'UNIQUE'
                AND tc.table_name = %s
                GROUP BY tc.constraint_name;
            """, [table_name])
            
            unique_constraints = cursor.fetchall()
            
            if unique_constraints:
                print("\nUnique Constraints:")
                for constraint in unique_constraints:
                    constraint_name, columns = constraint
                    print(f"  • {constraint_name}: ({columns})")
            
            print("\n")

def get_django_models_mapping():
    """Show Django models to database tables mapping"""
    print("🐍 Django Models → Database Tables Mapping")
    print("=" * 80)
    
    for app_config in apps.get_app_configs():
        if app_config.name.startswith('django.'):
            continue
            
        models = app_config.get_models()
        if models:
            print(f"\n📂 App: {app_config.name}")
            print("-" * 40)
            
            for model in models:
                table_name = model._meta.db_table
                field_count = len(model._meta.fields)
                print(f"  🏷️  {model.__name__} → {table_name} ({field_count} fields)")
                
                # Show relationships
                for field in model._meta.fields:
                    if hasattr(field, 'related_model') and field.related_model:
                        related_table = field.related_model._meta.db_table
                        print(f"      ↳ {field.name} → {related_table}")

def get_database_statistics():
    """Get database statistics"""
    print("📊 Database Statistics")
    print("=" * 80)
    
    with connection.cursor() as cursor:
        # Database size
        cursor.execute("SELECT pg_size_pretty(pg_database_size(current_database())) as db_size;")
        db_size = cursor.fetchone()[0]
        print(f"💾 Database Size: {db_size}")
        
        # Table row counts
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            AND table_name NOT LIKE 'django_%'
            AND table_name NOT LIKE 'auth_%'
            ORDER BY table_name;
        """)
        
        tables = cursor.fetchall()
        
        print(f"\n📋 Table Row Counts:")
        for (table_name,) in tables:
            try:
                cursor.execute(f'SELECT COUNT(*) FROM "{table_name}";')
                count = cursor.fetchone()[0]
                print(f"  • {table_name:<35} {count:>8} rows")
            except Exception as e:
                print(f"  • {table_name:<35} {'ERROR':>8}")

if __name__ == "__main__":
    try:
        get_table_schema()
        get_django_models_mapping()
        get_database_statistics()
        
        print("\n✅ Database schema documentation generated successfully!")
        print("\n🎯 Key Tables:")
        print("  • authentication_user - User accounts and authentication")
        print("  • bookings - Service booking requests and management")
        print("  • service_categories - Service category definitions")
        print("  • service_subcategories - Specific services offered")
        print("  • user_registered_services - Provider service registrations")
        print("  • provider_ratings - Customer ratings and reviews")
        print("  • provider_availability - Provider time slot management")
        print("  • provider_off_days - Provider unavailable days")
        print("  • authentication_permission - System permissions")
        print("  • authentication_usertyperolepermission - Role-based permissions")
        print("  • authentication_userpermissionoverride - User-specific permission overrides")
        
    except Exception as e:
        print(f"❌ Error generating documentation: {e}")
        sys.exit(1)
