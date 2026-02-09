import hashlib
from datetime import timedelta
from django.utils.timezone import now
from django.conf import settings
from django.http import HttpResponseForbidden
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.authentication import BasicAuthentication
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .models import Prayer
from .serializers import PrayerCreateSerializer, PrayerDetailSerializer


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


@method_decorator(csrf_exempt, name='dispatch')
class PrayerCreateView(APIView):
    """Public endpoint for submitting a prayer."""
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PrayerCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ip_address = get_client_ip(request)
        text = serializer.validated_data["text"]
        is_public = serializer.validated_data["is_public"]
        content_hash = hashlib.sha256(" ".join(text.split()).encode("utf-8")).hexdigest()

        if is_rate_limited(ip_address, content_hash):
            return Response({"detail": "Please wait before submitting another prayer."}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        prayer = Prayer.objects.create(
            text=text,
            content_hash=content_hash,
            user_ip_address=ip_address,
            next_allowed_at=now() + timedelta(minutes=settings.RATE_LIMIT_MINUTES),
            user_name=serializer.validated_data.get('user_name') or 'Anonymous',
            is_public=is_public
        )

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


class PingView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        return Response({"status": "ok"}, status=status.HTTP_200_OK)
