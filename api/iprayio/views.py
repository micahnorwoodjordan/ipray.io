import hashlib
from datetime import timedelta

from django.utils.timezone import now
from django.conf import settings
from django.http import HttpResponseForbidden
from django.views.decorators.csrf import csrf_exempt

from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes, authentication_classes


from iprayio.models import Prayer
from iprayio.serializers import PrayerCreateSerializer, PrayerDetailSerializer


ADMIN_WHITELISTED_IPS = getattr(settings, "ADMIN_WHITELISTED_IPS", ["127.0.0.1"])


def get_client_ip(request):
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    if xff:
        return xff.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def is_rate_limited(ip_address: str, content_hash: str):
    qs = Prayer.objects.filter(user_ip_address=ip_address, content_hash=content_hash)
    latest = qs.order_by("-created_at").first()

    if not latest:
        return False
    return now() < latest.next_allowed_at


@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
def ping(request):
    return Response({"status": "ok"}, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def create_prayer_request(request):
    serializer = PrayerCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    ip_address = get_client_ip(request)
    text = serializer.validated_data["text"]
    is_public = serializer.validated_data["is_public"]
    user_name = serializer.validated_data.get("user_name") or "Anonymous"
    user_email = serializer.validated_data.get("user_email")

    # Normalize whitespace before hashing
    normalized_text = " ".join(text.split())
    content_hash = hashlib.sha256(normalized_text.encode("utf-8")).hexdigest()

    if is_rate_limited(ip_address, content_hash):
        return Response(
            {"detail": "Please wait before submitting another prayer."},
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )

    prayer = Prayer.objects.create(
        text=text,
        content_hash=content_hash,
        user_ip_address=ip_address,
        next_allowed_at=now() + timedelta(minutes=settings.RATE_LIMIT_MINUTES),
        user_name=user_name,
        user_email=user_email,
        is_public=is_public
    )

    return Response(PrayerDetailSerializer(prayer).data, status=status.HTTP_201_CREATED)


@api_view(["PUT"])
def complete_prayer_request(request, pk):
    client_ip = get_client_ip(request)

    if client_ip not in ADMIN_WHITELISTED_IPS:
        return HttpResponseForbidden("IP not allowed")

    try:
        prayer = Prayer.objects.get(pk=pk)
    except Prayer.DoesNotExist:
        return Response({"detail": "Prayer not found"}, status=status.HTTP_404_NOT_FOUND)

    prayer.fulfilled_at = now()
    prayer.save(update_fields=["fulfilled_at"])

    return Response(PrayerDetailSerializer(prayer).data, status=status.HTTP_200_OK)
