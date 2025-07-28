from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

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
