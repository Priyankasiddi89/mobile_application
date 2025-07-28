from django.contrib import admin
from .models import ServiceCategory, ServiceSubcategory, Booking, UserRegisteredService

# Customize admin site headers
admin.site.site_header = "Home Services Platform Administration"
admin.site.site_title = "Home Services Admin"
admin.site.index_title = "Welcome to Home Services Platform Administration"

@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'icon', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('name', 'description')
    ordering = ('name',)

@admin.register(ServiceSubcategory)
class ServiceSubcategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'created_at', 'updated_at')
    list_filter = ('category', 'created_at', 'updated_at')
    search_fields = ('name', 'description', 'category__name')
    ordering = ('category__name', 'name')

    # Show category details in the form
    autocomplete_fields = ['category']

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'provider', 'subcategory', 'status', 'payment_status', 'total_price', 'service_date', 'created_at')
    list_filter = ('status', 'payment_status', 'payment_method', 'subcategory__category', 'created_at', 'service_date')
    search_fields = ('customer', 'provider', 'subcategory__name', 'notes')
    ordering = ('-created_at',)

    # Group fields logically
    fieldsets = (
        ('Booking Info', {
            'fields': ('customer', 'provider', 'subcategory', 'status')
        }),
        ('Service Details', {
            'fields': ('booking_date', 'service_date', 'notes')
        }),
        ('Payment Info', {
            'fields': ('total_price', 'payment_status', 'payment_method')
        }),
        ('Advanced', {
            'fields': ('declined_by',),
            'classes': ('collapse',)
        }),
    )

    # Make it easier to find related objects
    autocomplete_fields = ['subcategory']

@admin.register(UserRegisteredService)
class UserRegisteredServiceAdmin(admin.ModelAdmin):
    list_display = ('user', 'service', 'registered_at')
    list_filter = ('service__category', 'registered_at')
    search_fields = ('user__username', 'service__name')
    ordering = ('-registered_at',)

    # Show user and service details
    autocomplete_fields = ['user', 'service']
