from django.contrib import admin
from .models import (
    ServiceCategory, ServiceSubcategory, Booking, UserRegisteredService,
    ProviderRating, ProviderAvailability, ProviderOffDay
)

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
            'fields': ('booking_date', 'service_date', 'notes', 'address')
        }),
        ('Payment Info', {
            'fields': ('total_price', 'payment_status', 'payment_method')
        }),
        ('Cancellation Info', {
            'fields': ('cancelled_by', 'cancellation_reason'),
            'classes': ('collapse',)
        }),
        ('Advanced', {
            'fields': ('declined_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ('created_at', 'updated_at')

    # Make it easier to find related objects
    autocomplete_fields = ['subcategory']

@admin.register(UserRegisteredService)
class UserRegisteredServiceAdmin(admin.ModelAdmin):
    list_display = ('user', 'service', 'provider_price', 'is_available', 'registered_at')
    list_filter = ('service__category', 'is_available', 'registered_at')
    search_fields = ('user__username', 'service__name', 'description')
    ordering = ('-registered_at',)

    # Show user and service details
    autocomplete_fields = ['user', 'service']

@admin.register(ProviderRating)
class ProviderRatingAdmin(admin.ModelAdmin):
    list_display = ('provider', 'customer', 'rating', 'booking', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('provider__username', 'customer__username', 'review')
    ordering = ('-created_at',)

    # Show related details
    autocomplete_fields = ['provider', 'customer', 'booking']


@admin.register(ProviderAvailability)
class ProviderAvailabilityAdmin(admin.ModelAdmin):
    list_display = ('provider', 'date', 'start_time', 'end_time', 'is_available', 'created_at')
    list_filter = ('is_available', 'date', 'created_at')
    search_fields = ('provider__username',)
    ordering = ('-date', 'start_time')

    autocomplete_fields = ['provider']

    fieldsets = (
        ('Availability Details', {
            'fields': ('provider', 'date', 'start_time', 'end_time', 'is_available')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ('created_at', 'updated_at')


@admin.register(ProviderOffDay)
class ProviderOffDayAdmin(admin.ModelAdmin):
    list_display = ('provider', 'date', 'reason', 'created_at')
    list_filter = ('date', 'created_at')
    search_fields = ('provider__username', 'reason')
    ordering = ('-date',)

    autocomplete_fields = ['provider']

    fieldsets = (
        ('Off Day Details', {
            'fields': ('provider', 'date', 'reason')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ('created_at',)
