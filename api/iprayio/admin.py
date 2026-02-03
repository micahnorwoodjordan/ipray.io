from django.contrib import admin
from .models import Prayer


@admin.register(Prayer)
class PrayerAdmin(admin.ModelAdmin):
    # Columns to display in the list view
    list_display = (
        "id",
        "created_at",
        "fulfilled_at",
        "source_email",
        "source_ip_address",
        "next_allowed_at",
    )

    # Filters on the right-hand sidebar
    list_filter = (
        "fulfilled_at",
        "created_at",
    )

    # Searchable fields
    search_fields = (
        "text",
        "source_email",
        "source_ip_address",
    )

    # Fields that are read-only (can't be edited in admin)
    readonly_fields = (
        "id",
        "created_at",
        "source_ip_address",
        "next_allowed_at",
    )

    # Default ordering
    ordering = ("-created_at",)
