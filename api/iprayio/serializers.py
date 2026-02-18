import unicodedata

from rest_framework import serializers
from .models import Prayer


class PrayerCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Prayer
        fields = ["text", "user_name", "is_public", "user_email"]
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
            },
        }

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

            if isinstance(field, serializers.CharField) and isinstance(value, str):
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
