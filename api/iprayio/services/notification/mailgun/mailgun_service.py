"""
this isn't the most graceful looking client, but there is no graceful abstraction for the Mailgun client.
the Python SDK code would look almost identical to the below
"""

import requests
import logging

from django.conf import settings

from iprayio.models import Prayer
from iprayio.utilities import logging_utilities


logger = logging.getLogger(__name__)


class MailgunServiceException(Exception):
    pass


IS_PRODUCTION = not settings.DEBUG


class MailgunService:
    def __init__(self):
        self.sender = settings.MAILGUN_FROM
        self._auth = ('api', settings.MAILGUN_API_KEY)
        self.domain = settings.MAILGUN_DOMAIN
        self.template_name = 'production' if IS_PRODUCTION else 'dev'
        self.admin_to_email = settings.ADMIN_NOTIFICATION_EMAIL
        self.url = 'https://api.mailgun.net/v3/' + self.domain + '/messages'

    def _send_email(self, to: list[str], subject: str, text=None, **kwargs) -> None:
        data = {
            **dict(kwargs),
            **{
                "from": self.sender,
                "to": to,
                "subject": subject,
                'text': text
            }
        }

        try:
            response = requests.post(self.url, auth=self._auth, data=data, timeout=10)
            response.raise_for_status()
        except Exception as e:
            logging_utilities.transform_and_log_exception(e, MailgunServiceException, logger, 'there was an unexpected MailGun client error', reraise=True)

    def send_admin_prayer_submission_notification(self, prayer: Prayer) -> None:
        subject = f"ipray.io - Prayer Request: {prayer.id}"
        text = prayer.text
        self._send_email([self.admin_to_email], subject, text)

    def send_user_prayer_completed_notification(self, prayer: Prayer) -> None:
        subject = 'ipray.io - Hi friend, Your Prayer Request Has Been Lifted Up'
        self._send_email([prayer.user_email], subject, template=self.template_name)
