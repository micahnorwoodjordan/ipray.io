from django.db import models


class Prayer(models.Model):
    class PrayerStatus(models.TextChoices):
        INCOMPLETE = "incomplete"
        PROCESSING = "processing"
        COMPLETE = "complete"
        FAILED = "failed"

    created_at = models.DateTimeField(auto_now_add=True)
    fulfilled_at = models.DateTimeField(null=True, blank=True, help_text="When this prayer has been prayed over")
    text = models.TextField()
    user_ip_address = models.GenericIPAddressField(protocol="both", unpack_ipv4=True)
    user_email = models.EmailField(null=True, blank=True)
    next_allowed_at = models.DateTimeField(help_text="Earliest time this source may submit another prayer")
    user_name = models.CharField(default="Anonymous", max_length=100, help_text="Name of person submitting the prayer")
    email_sent = models.BooleanField(default=False)
    sms_sent = models.BooleanField(default=False)
    email_error = models.TextField(blank=True, null=True)
    sms_error = models.TextField(blank=True, null=True)
    prayer_status = models.CharField(max_length=20, choices=PrayerStatus.choices, default=PrayerStatus.INCOMPLETE, db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=["user_ip_address"]),
            models.Index(fields=["user_email"]),
            models.Index(fields=["next_allowed_at"]),
            models.Index(fields=["fulfilled_at"]),
        ]
        ordering = ["-created_at"]
