import logging

from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ObjectDoesNotExist

from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes, authentication_classes


from iprayio.utilities import logging_utilities
from iprayio.utilities import request_utilities
from iprayio.services.prayer.prayer_service import PrayerService, PrayerServiceRateLimitException, SuspiciousSubmissionException
from iprayio.services.queue.queue_service import QueueService, NotificationEvent
from iprayio.serializers import PrayerCreateSerializer, PrayerDetailSerializer, PrayerAgreementSerializer
from iprayio.services.notification.notification_service import NotificationMethod


logger = logging.getLogger(__name__)


PRAYER_REQUEST_CREATE_4XX_ERROR_MSG = 'an error occurred saving prayer'
PRAYER_REQUEST_CREATE_5XX_ERROR_MSG = 'an unknown error occurred saving prayer'

PRAYER_REQUEST_READ_5XX_ERROR_MSG = 'could not fetch prayer'


@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
@logging_utilities.logged_method_call(logger)
def ping(request):
    return Response({"status": "ok"}, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
@logging_utilities.logged_method_call(logger)
def get_prayer_request(request):
    prayer_id = request.query_params.get("id")
    service = PrayerService()

    try:
        if prayer_id:
            prayer = service.get_prayer_request(prayer_id)
        else:
            prayer = service.get_random_prayer_request()

        return Response(PrayerAgreementSerializer(prayer).data, status=status.HTTP_200_OK)

    except ObjectDoesNotExist as e:
        logging_utilities.log_typed_error(logger, e, 'Prayer object does not exist')
        return Response({"detail": PRAYER_REQUEST_READ_5XX_ERROR_MSG}, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        logging_utilities.log_typed_error(logger, e, 'error occurred fetching Prayer object')
        return Response({"detail": PRAYER_REQUEST_READ_5XX_ERROR_MSG}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
@logging_utilities.logged_method_call(logger)
def create_prayer_request(request):
    serializer = PrayerCreateSerializer(data=request.data)

    try:
        serializer.is_valid(raise_exception=True)
        ip_address = request_utilities.get_client_ip(request)
        text = serializer.validated_data["text"]
        is_public = serializer.validated_data["is_public"]
        user_name = serializer.validated_data.get("user_name")
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
        logger.error(PRAYER_REQUEST_CREATE_5XX_ERROR_MSG)
        return Response({"detail": "there was an unexpected server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
