import requests
from django.conf import settings


def send_prayer_notification(prayer):
    subject = "New Prayer Request Submitted"
    text = f"""
A new prayer request has been submitted.

From: {prayer.user_name}
Email: {prayer.user_email or "Anonymous"}
IP: {prayer.user_ip_address}

Prayer:
{prayer.text}
"""

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
