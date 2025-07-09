from django.core.management.base import BaseCommand
from bookings.models import ServiceCategory, ServiceSubcategory
from decimal import Decimal

class Command(BaseCommand):
    help = 'Populate database with service categories and subcategories'

    def handle(self, *args, **options):
        self.stdout.write('Starting to populate service categories and subcategories...')
        
        # Clear existing data
        ServiceCategory.objects.delete()
        ServiceSubcategory.objects.delete()
        
        # Create service categories
        categories_data = [
            {
                'name': 'Cleaning Services',
                'description': 'Professional home cleaning, deep cleaning, and maintenance services',
                'icon': '🧹',
                'gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'subcategories': [
                    {'name': 'Home Deep Cleaning', 'description': 'Full house sanitization, bathroom, kitchen', 'price': Decimal('48.00')},
                    {'name': 'Kitchen Cleaning', 'description': 'Degreasing, sink & chimney area', 'price': Decimal('17.00')},
                    {'name': 'Sofa/Carpet Shampooing', 'description': 'Wet vacuum cleaning, odor removal', 'price': Decimal('12.00')},
                    {'name': 'Bathroom Cleaning', 'description': 'Descaling, tile scrubbing, disinfectant', 'price': Decimal('8.00')},
                ]
            },
            {
                'name': 'Appliance Repair & Installation',
                'description': 'Repair and installation of home appliances and electronics',
                'icon': '🔧',
                'gradient': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                'subcategories': [
                    {'name': 'AC Installation/Repair', 'description': 'Split/Window AC, gas refill, servicing', 'price': Decimal('15.00')},
                    {'name': 'Washing Machine Repair', 'description': 'Front/top load, PCB or drum issues', 'price': Decimal('9.00')},
                    {'name': 'Refrigerator Repair', 'description': 'Cooling, gas leak, compressor repair', 'price': Decimal('11.50')},
                    {'name': 'Chimney Cleaning', 'description': 'Dismantling, oil and soot removal', 'price': Decimal('10.50')},
                ]
            },
            {
                'name': 'Electrician Services',
                'description': 'Electrical repairs, installations, and safety inspections',
                'icon': '⚡',
                'gradient': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                'subcategories': [
                    {'name': 'Fan/Light Installation', 'description': 'Ceiling/wall fan, LED panel', 'price': Decimal('3.50')},
                    {'name': 'Switch/Socket Repair', 'description': 'Replacement or rewiring', 'price': Decimal('2.50')},
                    {'name': 'MCB Installation', 'description': 'Mini circuit breaker & load panel fix', 'price': Decimal('7.00')},
                    {'name': 'Inverter Setup/Repair', 'description': 'Wiring, connection, maintenance', 'price': Decimal('8.50')},
                ]
            },
            {
                'name': 'Plumbing',
                'description': 'Plumbing repairs, installations, and maintenance services',
                'icon': '🚰',
                'gradient': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                'subcategories': [
                    {'name': 'Tap/Faucet Fix', 'description': 'Leakage, replacement', 'price': Decimal('3.00')},
                    {'name': 'Water Tank Cleaning', 'description': 'Manual or machine deep clean', 'price': Decimal('12.00')},
                    {'name': 'Bathroom Fitting Install', 'description': 'Shower, geyser, flush tank', 'price': Decimal('7.00')},
                    {'name': 'Drainage/Leakage Repair', 'description': 'Pipe blockage, leakage detection', 'price': Decimal('8.50')},
                ]
            },
            {
                'name': 'Carpentry',
                'description': 'Custom woodwork, repairs, and furniture assembly',
                'icon': '🔨',
                'gradient': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                'subcategories': [
                    {'name': 'Furniture Assembly', 'description': 'Bed, wardrobe, table assembly', 'price': Decimal('25.00')},
                    {'name': 'Door/Window Repair', 'description': 'Hinge fix, lock replacement', 'price': Decimal('15.00')},
                    {'name': 'Custom Woodwork', 'description': 'Shelf, cabinet, custom furniture', 'price': Decimal('45.00')},
                    {'name': 'Floor Repair', 'description': 'Wooden floor, laminate repair', 'price': Decimal('20.00')},
                ]
            },
            {
                'name': 'Home Renovation',
                'description': 'Complete home renovation and remodeling services',
                'icon': '🏠',
                'gradient': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                'subcategories': [
                    {'name': 'False Ceiling & POP Work', 'description': 'Gypsum board, cove lighting, etc.', 'price': Decimal('1.35')},
                    {'name': 'Painting & Wallpaper', 'description': 'Interior/exterior, emulsion/distemper', 'price': Decimal('0.21')},
                    {'name': 'Modular Kitchen Setup', 'description': 'Cabinets, shelves, countertop, chimney', 'price': Decimal('1800.00')},
                    {'name': 'Tile & Marble Work', 'description': 'Flooring, wall tiling, backsplash', 'price': Decimal('1.15')},
                ]
            }
        ]
        
        # Create categories and subcategories
        for cat_data in categories_data:
            subcategories_data = cat_data.pop('subcategories', [])
            
            # Create category
            category = ServiceCategory(**cat_data)
            category.save()
            self.stdout.write(f'Created category: {category.name}')
            
            # Create subcategories for this category
            for sub_data in subcategories_data:
                subcategory = ServiceSubcategory(
                    category=category,
                    **sub_data
                )
                subcategory.save()
                self.stdout.write(f'  - Created subcategory: {subcategory.name} (${subcategory.price})')
        
        self.stdout.write(
            self.style.SUCCESS('Successfully populated database with service categories and subcategories!')
        ) 