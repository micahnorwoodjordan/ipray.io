from datetime import timedelta
from django.utils.timezone import now
from django.conf import settings
from django.http import HttpResponseForbidden
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Prayer
from .serializers import PrayerCreateSerializer, PrayerDetailSerializer


RATE_LIMIT_HOURS = 6
ADMIN_WHITELISTED_IPS = getattr(settings, "ADMIN_WHITELISTED_IPS", ["127.0.0.1"])


def get_client_ip(request):
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    if xff:
        return xff.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def is_rate_limited(ip_address: str, email: str | None):
    """Return True if this IP/email is still within the cooldown window."""
    qs = Prayer.objects.filter(user_ip_address=ip_address)
    if email:
        qs = qs | Prayer.objects.filter(user_email=email)
    latest = qs.order_by("-created_at").first()
    if not latest:
        return False
    return now() < latest.next_allowed_at


class PrayerCreateView(APIView):
    """Public endpoint for submitting a prayer."""
    def post(self, request):
        serializer = PrayerCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ip_address = get_client_ip(request)
        email = serializer.validated_data.get("user_email")

        if is_rate_limited(ip_address, email):
            return Response({"detail": "Please wait before submitting another prayer."}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        prayer = Prayer.objects.create(
            text=serializer.validated_data["text"],
            user_email=email,
            user_ip_address=ip_address,
            next_allowed_at=now() + timedelta(hours=RATE_LIMIT_HOURS),
            user_name=serializer.validated_data.get('user_name') or 'Anonymous'
        )

        # TODO: enqueue notification worker here

        return Response(PrayerDetailSerializer(prayer).data, status=status.HTTP_201_CREATED)


class PrayerFulfillView(APIView):
    """Admin-only endpoint to mark a prayer as fulfilled."""
    def put(self, request, pk):
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
