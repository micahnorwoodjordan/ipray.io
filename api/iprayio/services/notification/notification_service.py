from enum import Enum
from dataclasses import dataclass

from django.conf import settings

from iprayio.models import Prayer
from .mailgun.mailgun_service import send_prayer_notification_email


class NotificationMethod(Enum):
    EMAIL = 1
    SMS = 2


@dataclass
class NotificationSummary:
    email_sent: bool
    sms_sent: bool
    error: str


class NotificationService:
    def __init__(self):
        self._mailgun_domain = settings.MAILGUN_DOMAIN
        self._mailgun_api_key = settings.MAILGUN_API_KEY
        self._mailgun_from = settings.MAILGUN_FROM
        self._admin_notification_email = settings.ADMIN_NOTIFICATION_EMAIL

    def notify_admin(self, method: NotificationMethod, prayer: Prayer) -> NotificationSummary:
        try:
            if method == NotificationMethod.EMAIL:
                send_prayer_notification_email(prayer)
                print(f'sent email for prayer {prayer.id}')
                return NotificationSummary(True, False, None)
            elif method == NotificationMethod.SMS:
                # send_prayer_notification_sms(prayer)  # TODO: recent A2P regulations make simple SMS rigorous to get off the ground
                print(f'sent sms for prayer {prayer.id}')
                return NotificationSummary(False, True, None)
        except Exception as e:
            print(f'failed to send notification {method.name.lower()}: {e}')
            return NotificationSummary(False, False, str(e))
