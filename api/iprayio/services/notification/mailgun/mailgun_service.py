"""
this isn't the most graceful looking client, but there is no graceful abstraction for the Mailgun client.
the Python SDK code would look almost identical to the below
"""

import requests
from django.conf import settings


def send_prayer_notification_email(prayer):
    subject = "New prayer request!"
    text = f'New prayer request from {prayer.user_name or "Anonymous"} ({prayer.user_email or "Anonymous"})\nPrayer: {prayer.text}'
    response = requests.post(
        f"https://api.mailgun.net/v3/{settings.MAILGUN_DOMAIN}/messages",
        auth=("api", settings.MAILGUN_API_KEY),
        data={
            "from": settings.MAILGUN_FROM,
            "to": [settings.ADMIN_NOTIFICATION_EMAIL],
            "subject": subject,
            "text": text,
        },
        timeout=10,
    )

    response.raise_for_status()
