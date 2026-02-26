import random
import logging

from django.utils.timezone import now
from django.conf import settings
from django.http import HttpResponseForbidden
from django.views.decorators.csrf import csrf_exempt

from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes, authentication_classes


from iprayio.models import Prayer
from iprayio.utilities import logging_utilities
from iprayio.exceptions import SuspiciousSubmissionException
from iprayio.services.prayer.prayer_service import PrayerService, PrayerServiceRateLimitException
from iprayio.services.queue.queue_service import QueueService, NotificationEvent
from iprayio.serializers import PrayerCreateSerializer, PrayerDetailSerializer
from iprayio.services.notification.notification_service import NotificationMethod


logger = logging.getLogger(__name__)


PRAYER_REQUEST_CREATE_4XX_ERROR_MSG = 'an error occurred saving Prayer'
PRAYER_REQUEST_CREATE_5XX_ERROR_MSG = 'an unknown error occurred saving Prayer'

ADMIN_WHITELISTED_IPS = getattr(settings, "ADMIN_WHITELISTED_IPS", ["127.0.0.1"])


def get_client_ip(request):
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    if xff:
        return xff.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")



@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
def ping(request):
    return Response({"status": "ok"}, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
def get_prayer_request(request):
    pk = request.query_params.get("id")

    try:
        if pk:
            try:
                prayer = Prayer.objects.get(pk=pk)
            except Prayer.DoesNotExist:
                return Response({"detail": "Prayer not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            prayers = list(Prayer.objects.filter(is_public=True, is_approved=True))
            ids = [p.id for p in prayers]
            idx = random.randint(0, len(ids) - 1)
            prayer = prayers[idx]
        return Response(PrayerDetailSerializer(prayer).data, status=status.HTTP_200_OK)

    except Exception as e:
        print(e)
        return Response({"detail": "Unable to retrieve prayer."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def create_prayer_request(request):
    serializer = PrayerCreateSerializer(data=request.data)

    try:
        serializer.is_valid(raise_exception=True)
        ip_address = get_client_ip(request)
        text = serializer.validated_data["text"]
        is_public = serializer.validated_data["is_public"]
        user_name = serializer.validated_data.get("user_name") or "Anonymous"
        user_email = serializer.validated_data.get("user_email")

        prayer = PrayerService.create_new_prayer_request(text, ip_address, user_name, user_email, is_public)

        QueueService().publish_prayer_request_notification_event(
            prayer,
            [NotificationMethod.EMAIL.value],
            NotificationEvent.PRAYER_REQUEST_CREATION_EVENT.value
        )
        return Response(PrayerDetailSerializer(prayer).data, status=status.HTTP_201_CREATED)

    except PrayerServiceRateLimitException as e:
        logging_utilities.log_typed_error(logger, e, PRAYER_REQUEST_CREATE_4XX_ERROR_MSG)
        return Response({"detail": "Please wait before submitting another prayer."}, status=status.HTTP_429_TOO_MANY_REQUESTS)

    except SuspiciousSubmissionException as e:
        logging_utilities.log_typed_error(logger, e, PRAYER_REQUEST_CREATE_4XX_ERROR_MSG)
        return Response(status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logging_utilities.log_typed_error(logger, e, PRAYER_REQUEST_CREATE_5XX_ERROR_MSG)
        return Response({"detail": "there was an unexpected server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
