import uuid
from django.db import models


class Prayer(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    fulfilled_at = models.DateTimeField(null=True, blank=True, help_text="When this prayer has been prayed over")
    text = models.TextField()
    source_ip_address = models.GenericIPAddressField(protocol="both", unpack_ipv4=True)
    source_email = models.EmailField(null=True, blank=True)
    next_allowed_at = models.DateTimeField(help_text="Earliest time this source may submit another prayer")

    class Meta:
        indexes = [
            models.Index(fields=["source_ip_address"]),
            models.Index(fields=["source_email"]),
            models.Index(fields=["next_allowed_at"]),
            models.Index(fields=["fulfilled_at"]),
        ]
        ordering = ["-created_at"]
