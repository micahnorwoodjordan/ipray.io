import socket
import logging
from enum import Enum
from dataclasses import dataclass

from django.conf import settings
from django.utils import timezone

from iprayio.models import Prayer
from iprayio.utilities import logging_utilities
from iprayio.services.notification.mailgun.mailgun_service import MailgunService


logger = logging.getLogger(__name__)


class NotificationServiceException(Exception):
    pass


WORKER_ID = socket.gethostname()


class NotificationMethod(Enum):
    EMAIL = 1
    SMS = 2


@dataclass
class NotificationSummary:
    email_sent: bool
    sms_sent: bool
    email_error: str
    sms_error: str
    prayer: Prayer


class NotificationService:
    def __init__(self):
        self._mailgun_domain = settings.MAILGUN_DOMAIN
        self._mailgun_api_key = settings.MAILGUN_API_KEY
        self._mailgun_from = settings.MAILGUN_FROM
        self._admin_notification_email = settings.ADMIN_NOTIFICATION_EMAIL
        self._mailgun_service = MailgunService()

    def notify_admin(self, methods: list[NotificationMethod], prayer_id: int) -> NotificationSummary:
        prayer = Prayer.objects.get(id=prayer_id)
        summary = NotificationSummary(False, False, None, None, prayer)

        try:
            if NotificationMethod.EMAIL.value in methods:
                self._mailgun_service.send_admin_prayer_submission_notification(prayer)
                summary.email_sent = True

            if NotificationMethod.SMS.value in methods:
                # send_prayer_notification_sms(prayer)  # TODO: recent A2P regulations make simple SMS rigorous to get off the ground
                summary.sms_sent = False  # TODO: flip once SMS is figured out

        except Exception as e:
            logging_utilities.log_typed_error(logger, e, f'an error occurred while notifying admin of new prayer request: {prayer.id}')
            summary.sms_error = str(e)
            raise NotificationServiceException from e

        return summary

    def notify_user(self, prayer_id: int) -> None:
        try:
            prayer = Prayer.objects.get(id=prayer_id)

            if prayer.user_email is not None:
                self._mailgun_service.send_user_prayer_completed_notification(prayer)

        except Exception as e:
            logging_utilities.log_typed_error(logger, e, f'an error occurred while notifying user of prayer completion: {prayer.id}')
            raise NotificationServiceException from e

    @staticmethod
    def update_prayer_status(summary):
        prayer = summary.prayer
        prayer.prayer_status = Prayer.Status.RECEIVED
        prayer.processing_started_at = timezone.now()
        prayer.processing_by = WORKER_ID
        prayer.attempt_count += 1
        prayer.email_sent = summary.email_sent
        prayer.email_error = summary.email_error
        prayer.sms_sent = summary.sms_sent
        prayer.sms_error = summary.sms_error
        prayer.save()
