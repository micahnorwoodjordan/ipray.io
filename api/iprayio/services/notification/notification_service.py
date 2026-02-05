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
    email_error: str
    sms_error: str
    


class NotificationService:
    def __init__(self):
        self._mailgun_domain = settings.MAILGUN_DOMAIN
        self._mailgun_api_key = settings.MAILGUN_API_KEY
        self._mailgun_from = settings.MAILGUN_FROM
        self._admin_notification_email = settings.ADMIN_NOTIFICATION_EMAIL

    def notify_admin(self, methods: list[NotificationMethod], prayer: Prayer) -> NotificationSummary:
        summary = NotificationSummary(False, False, None, None)

        if NotificationMethod.EMAIL in methods:
            try:
                send_prayer_notification_email(prayer)
                summary.email_sent = True
                print(f'sent email for prayer {prayer.id}')
            except Exception as e:
                print(f'failed to send email: {e}')
                summary.email_error = str(e)

        if NotificationMethod.SMS in methods:
            try:
                # send_prayer_notification_sms(prayer)  # TODO: recent A2P regulations make simple SMS rigorous to get off the ground
                summary.sms_sent = False  # TODO: flip once SMS is figured out
                print(f'sent sms for prayer {prayer.id}')
            except Exception as e:
                print(f'failed to send sms: {e}')
                summary.sms_error = str(e)

        return summary
