from django.contrib import admin
from django.utils.timezone import now

from iprayio.models import Prayer
from iprayio.services.notification.mailgun.mailgun_service import send_user_prayer_completed_notification


@admin.register(Prayer)
class PrayerAdmin(admin.ModelAdmin):
    actions = ["mark_as_complete_and_notify"]

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

    def mark_as_complete_and_notify(self, request, queryset):

        for prayer in queryset:
            prayer.prayer_status = Prayer.Status.COMPLETE
            prayer.fulfilled_at = now()
            prayer.save(update_fields=["prayer_status", "fulfilled_at"])

            if prayer.user_email:
                send_user_prayer_completed_notification(prayer)

        self.message_user(request, "Selected prayers marked as completed and users notified.")

    mark_as_complete_and_notify.short_description = "Mark selected prayers as completed and notify user"
