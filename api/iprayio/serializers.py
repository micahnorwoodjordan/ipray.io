import unicodedata

from django.utils.timezone import now

from rest_framework import serializers
from iprayio.models import Prayer
from iprayio.exceptions import SuspiciousSubmissionException


class PrayerCreateSerializer(serializers.ModelSerializer):
    denomination = serializers.CharField(required=True, allow_blank=True, trim_whitespace=False)

    class Meta:
        model = Prayer
        fields = ["text", "user_name", "is_public", "user_email", "denomination"]
        extra_kwargs = {
            "text": {
                "required": True,
                "allow_blank": False,
                "max_length": 2000,
            },
            "user_name": {
                "required": False,
                "allow_blank": True,
                "max_length": 100,
            },
            "is_public": {
                "required": True,
            },
            "user_email": {
                "required": False,
                "allow_blank": True,
            }
        }

    def validate(self, attrs):
        denomination = attrs.get("denomination", "")

        if denomination != "":
            print(f'honeypot triggered; potential bot: {now()}')
            raise SuspiciousSubmissionException("Invalid prayer request")

        return attrs

    def create(self, validated_data):
        validated_data.pop("denomination", None)
        return super().create(validated_data)

    @staticmethod
    def normalize(value: str) -> str:
        if not isinstance(value, str):
            return value

        value = value.strip()
        value = unicodedata.normalize("NFKC", value)  # no homoglyph & encoding weirdness
        value = value.replace("\r\n", "\n").replace("\r", "\n")  # handle line endings
        value = value.replace("\x00", "")  # no null bytes
        return value

    def to_internal_value(self, data):
        data = data.copy()

        for field_name, field in self.fields.items():
            if field_name not in data:
                continue

            if field.read_only:
                continue

            value = data[field_name]

            if isinstance(field, serializers.CharField) and field_name != "denomination" and isinstance(value, str):
                data[field_name] = self.normalize(value)

        return super().to_internal_value(data)


class PrayerDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prayer
        fields = [
            "text",
            "created_at",
            "next_allowed_at",
        ]
        read_only_fields = fields
