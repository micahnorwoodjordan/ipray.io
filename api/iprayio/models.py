from django.db import models


class Prayer(models.Model):
    class Status(models.TextChoices):
        INCOMPLETE = "incomplete"
        PROCESSING = "processing"
        RECEIVED = "received"
        COMPLETE = "complete"
        FAILED = "failed"

    created_at = models.DateTimeField(auto_now_add=True)
    fulfilled_at = models.DateTimeField(null=True, blank=True, help_text="When this prayer has been prayed over")
    text = models.TextField()
    user_ip_address = models.GenericIPAddressField(protocol="both", unpack_ipv4=True)
    content_hash = models.CharField(max_length=64, db_index=True)
    next_allowed_at = models.DateTimeField(help_text="Earliest time this source may submit another prayer")
    user_name = models.CharField(default="Anonymous", max_length=100, help_text="Name of person submitting the prayer")
    email_sent = models.BooleanField(default=False)
    sms_sent = models.BooleanField(default=False)
    email_error = models.TextField(blank=True, null=True)
    sms_error = models.TextField(blank=True, null=True)
    prayer_status = models.CharField(max_length=20, choices=Status.choices, default=Status.INCOMPLETE, db_index=True)
    processing_started_at = models.DateTimeField(null=True, blank=True)
    processing_by = models.CharField(max_length=64, null=True, blank=True)
    attempt_count = models.PositiveIntegerField(default=0)
    is_public = models.BooleanField(default=False, help_text="Whether the user has granted permission for this prayer to be shared publicly")
    user_email = models.EmailField(null=True, blank=True, help_text="Optional email address for users who wish to receive updates when their prayer is fulfilled.")
    is_approved = models.BooleanField(default=False, help_text="Whether this prayer has been reviewed and approved for public sharing.")

    class Meta:
        indexes = [
            models.Index(fields=["user_ip_address"]),
            models.Index(fields=["content_hash"]),
            models.Index(fields=["next_allowed_at"]),
            models.Index(fields=["fulfilled_at"]),
        ]
        ordering = ["-created_at"]
