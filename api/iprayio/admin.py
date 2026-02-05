from django.contrib import admin
from .models import Prayer


@admin.register(Prayer)
class PrayerAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'created_at',
        'fulfilled_at',
        'user_email',
        'user_ip_address',
        'next_allowed_at',
    )

    list_filter = ('fulfilled_at', 'created_at')

    search_fields = ('text', 'user_email', 'user_ip_address')

    readonly_fields = (
        'id',
        'created_at',
        'user_ip_address',
        'next_allowed_at',
        'text',
        'user_name',
        'user_email',
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
