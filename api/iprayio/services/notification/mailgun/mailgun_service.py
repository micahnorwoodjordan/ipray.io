"""
this isn't the most graceful looking client, but there is no graceful abstraction for the Mailgun client.
the Python SDK code would look almost identical to the below
"""

import requests
from django.conf import settings

from iprayio.models import Prayer


def _send_email(to: list[str], subject: str, text: str) -> None:
    response = requests.post(
        f"https://api.mailgun.net/v3/{settings.MAILGUN_DOMAIN}/messages",
        auth=("api", settings.MAILGUN_API_KEY),
        data={
            "from": settings.MAILGUN_FROM,
            "to": to,
            "subject": subject,
            "text": text,
        },
        timeout=10,
    )
    response.raise_for_status()


def send_admin_prayer_submission_notification(prayer: Prayer) -> None:
    subject = f"ipray.io - Prayer Request: {prayer.id}"
    text = ...
    _send_email([settings.ADMIN_NOTIFICATION_EMAIL], subject, text)


def send_user_prayer_completed_notification(prayer: Prayer) -> None:
    subject = "ipray.io - Your Prayer Request Has Been Lifted Up"
    text = f'Hi friend,\nI just prayed over your prayer request:\n\n\n"{prayer.text}"'
    _send_email([prayer.user_email], subject, text)
