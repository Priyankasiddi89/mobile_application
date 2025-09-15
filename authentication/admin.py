from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Permission, UserTypeRolePermission, UserPermissionOverride

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # Display these fields in the user list
    list_display = ('username', 'email', 'user_type', 'role', 'is_active', 'is_staff', 'is_superuser', 'date_joined')

    # Add filters in the right sidebar
    list_filter = ('user_type', 'role', 'is_active', 'is_staff', 'is_superuser', 'date_joined')

    # Add search functionality
    search_fields = ('username', 'email', 'user_type', 'role')

    # Fields to display when editing a user
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('App-specific info', {'fields': ('user_type', 'role')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    # Fields to display when adding a new user
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'user_type', 'role', 'password1', 'password2'),
        }),
    )

    # Order by username
    ordering = ('username',)

    # Enable search for autocomplete in other models
    search_fields = ('username', 'email', 'first_name', 'last_name')


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('name', 'codename', 'category', 'description')
    list_filter = ('category',)
    search_fields = ('name', 'codename', 'description')
    ordering = ('category', 'name')

    fieldsets = (
        ('Permission Details', {
            'fields': ('name', 'codename', 'description', 'category')
        }),
    )


@admin.register(UserTypeRolePermission)
class UserTypeRolePermissionAdmin(admin.ModelAdmin):
    list_display = ('user_type', 'role', 'permission', 'is_granted')
    list_filter = ('user_type', 'role', 'is_granted', 'permission__category')
    search_fields = ('user_type', 'role', 'permission__name', 'permission__codename')
    ordering = ('user_type', 'role', 'permission__category', 'permission__name')

    autocomplete_fields = ['permission']

    fieldsets = (
        ('Role Permission Assignment', {
            'fields': ('user_type', 'role', 'permission', 'is_granted')
        }),
    )


@admin.register(UserPermissionOverride)
class UserPermissionOverrideAdmin(admin.ModelAdmin):
    list_display = ('user', 'permission', 'is_granted', 'granted_at', 'granted_by')
    list_filter = ('is_granted', 'granted_at', 'permission__category')
    search_fields = ('user__username', 'permission__name', 'permission__codename')
    ordering = ('-granted_at',)

    autocomplete_fields = ['user', 'permission', 'granted_by']

    fieldsets = (
        ('User Permission Override', {
            'fields': ('user', 'permission', 'is_granted')
        }),
        ('Grant Details', {
            'fields': ('granted_by', 'granted_at'),
            'classes': ('collapse',)
        }),
    )
