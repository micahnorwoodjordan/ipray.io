import time
import socket
import threading
from enum import Enum
from datetime import timedelta
from dataclasses import dataclass

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from http.server import BaseHTTPRequestHandler, HTTPServer

from iprayio.models import Prayer
from iprayio.services.mailgun.mailgun_service import send_prayer_notification_email


class NotificationMethod(Enum):
    EMAIL = 1
    SMS = 2


@dataclass
class NotificationSummary:
    email_sent: bool
    sms_sent: bool
    error: str


WORKER_ID = socket.gethostname()
POLL_INTERVAL_SECONDS = 2
LEASE_TIMEOUT = timedelta(minutes=5)


def start_health_server():
    try:
        class Handler(BaseHTTPRequestHandler):
            def do_GET(self):
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b"ok")

            def log_message(self, format, *args):
                return  # silence logs

        server = HTTPServer(("0.0.0.0", 8080), Handler)
        server.serve_forever()
    except Exception as e:
        print(f"Health server failed: {e}")


class Command(BaseCommand):
    help = "Runs the background worker that processes prayer notifications."

    def handle(self, *args, **options):
        threading.Thread(target=start_health_server, daemon=True).start()
        self.stdout.write(self.style.SUCCESS("Prayer worker ready for health checks"))
        self.stdout.write(self.style.SUCCESS(f"Prayer worker started (worker_id={WORKER_ID})"))

        while True:
            try:
                self.reclaim_stuck_prayers()

                prayer = self.claim_prayer()

                if not prayer:
                    time.sleep(POLL_INTERVAL_SECONDS)
                    continue

                # self.mark_prayer_complete(prayer)

            except KeyboardInterrupt:
                self.stdout.write(self.style.WARNING("Worker shutting down"))
                return

            except Exception as e:
                self.stderr.write(self.style.ERROR(str(e)))
                time.sleep(5)
    
    def notify_admin(self, method: NotificationMethod, prayer: Prayer) -> NotificationSummary:
        try:
            if method == NotificationMethod.EMAIL:
                send_prayer_notification_email(prayer)
                print(f'sent email for prayer {prayer.id}')
                return NotificationSummary(True, False, None)
            elif method == NotificationMethod.SMS:
                # send_prayer_notification_sms(prayer)
                print(f'sent sms for prayer {prayer.id}')
                return NotificationSummary(False, True, None)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'failed to send notification {method.name.lower()}: {e}'))
            return NotificationSummary(False, False, str(e))

    def reclaim_stuck_prayers(self) -> None:
        cutoff = timezone.now() - LEASE_TIMEOUT

        with transaction.atomic():
            reclaimed = (
                Prayer.objects.filter(
                    prayer_status=Prayer.Status.PROCESSING, processing_started_at__lt=cutoff
                ).update(prayer_status=Prayer.Status.INCOMPLETE, processing_started_at=None, processing_by=None)
            )

        if reclaimed:
            self.stdout.write(f"Reclaimed {reclaimed} stuck prayer(s)")

    def claim_prayer(self) -> Prayer | None:
        with transaction.atomic():
            prayer = (
                Prayer.objects
                .select_for_update(skip_locked=True)
                .filter(prayer_status=Prayer.Status.INCOMPLETE)
                .order_by("created_at")
                .first()
            )

            if not prayer:
                return None

            email_summary = self.notify_admin(NotificationMethod.EMAIL, prayer)
            sms_summary = self.notify_admin(NotificationMethod.SMS, prayer)

            prayer.prayer_status = Prayer.Status.RECEIVED
            prayer.processing_started_at = timezone.now()
            prayer.processing_by = WORKER_ID
            prayer.attempt_count += 1
            prayer.email_sent = email_summary.email_sent
            prayer.email_error = email_summary.error
            prayer.sms_sent = sms_summary.sms_sent
            prayer.sms_error = sms_summary.error

            prayer.save(
                update_fields=[
                    "prayer_status",
                    "processing_started_at",
                    "processing_by",
                    "attempt_count",
                ]
            )

            return prayer

    # def mark_prayer_complete(self, prayer: Prayer) -> None:
    #     try:
    #         prayer.prayer_status = Prayer.Status.COMPLETE
    #         prayer.fulfilled_at = timezone.now()
    #         prayer.save(update_fields=["prayer_status", "fulfilled_at"])

    #         self.stdout.write(f"Completed prayer {prayer.id}")

    #     except Exception as e:
    #         prayer.prayer_status = Prayer.Status.FAILED
    #         prayer.save(update_fields=["prayer_status"])

    #         self.stderr.write(self.style.ERROR(f"Failed prayer {prayer.id}: {e}"))
    #         raise
