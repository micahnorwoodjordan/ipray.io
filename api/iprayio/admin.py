from django.contrib import admin
from .models import Prayer


@admin.register(Prayer)
class PrayerAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user_name',
        'user_email',
        'is_public',
        'is_approved',
        'created_at',
        'fulfilled_at',
        'next_allowed_at',
    )

    list_filter = ('fulfilled_at', 'created_at')

    search_fields = ('text', 'content_hash', 'user_ip_address')

    readonly_fields = (
        'id',
        'created_at',
        'user_ip_address',
        'next_allowed_at',
        'text',
        'user_name',
        'content_hash',
        'email_sent',
        'sms_sent',
        'email_error',
        'sms_error',
        'processing_started_at',
        'processing_by',
        'attempt_count'
    )

    # Default ordering
    ordering = ('-created_at',)
