import sys
import signal

from django.core.management.base import BaseCommand
from iprayio.services.queue.queue_service import QueueService


class Command(BaseCommand):
    help = "Run the RabbitMQ notification consumer"

    def handle(self, *args, **options):
        queue_service = QueueService()
        queue_service.register_consumer()

        def shutdown(signum, frame):
            self.stdout.write("Shutting down gracefully...")
            queue_service.stop()
            sys.exit(0)

        signal.signal(signal.SIGINT, shutdown)
        signal.signal(signal.SIGTERM, shutdown)

        self.stdout.write(self.style.SUCCESS("Worker started. Waiting for messages..."))

        queue_service.start()
