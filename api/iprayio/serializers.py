from rest_framework import serializers
from .models import Prayer


class PrayerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prayer
        fields = ["text", "source_email"]
        extra_kwargs = {
            "text": {
                "required": True,
                "allow_blank": False,
                "max_length": 2000
            },
            "source_email": {
                "required": False,
                "allow_blank": True
            },
        }


class PrayerDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prayer
        fields = [
            "id",
            "text",
            "source_email",
            "source_ip_address",
            "created_at",
            "fulfilled_at",
            "next_allowed_at",
        ]
        read_only_fields = fields
