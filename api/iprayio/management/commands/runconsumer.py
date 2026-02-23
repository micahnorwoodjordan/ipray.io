import sys
import signal
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

from django.core.management.base import BaseCommand
from iprayio.services.queue.queue_service import QueueService


class HealthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"ok")

    def log_message(self, format, *args):
        return  # silence logs


def start_health_server():
    try:
        server = HTTPServer(("0.0.0.0", 8080), HealthHandler)
        server.serve_forever()
    except Exception as e:
        print(f"Health server failed: {e}")


class Command(BaseCommand):
    help = "Run the RabbitMQ notification consumer with health check endpoint"

    def handle(self, *args, **options):
        queue_service = QueueService()
        queue_service.register_consumer()

        threading.Thread(target=start_health_server, daemon=True).start()

        def shutdown(signum, frame):
            self.stdout.write("Shutting down gracefully...")
            queue_service.stop()
            sys.exit(0)

        signal.signal(signal.SIGINT, shutdown)
        signal.signal(signal.SIGTERM, shutdown)
        self.stdout.write(self.style.SUCCESS("Worker started. Waiting for messages..."))

        queue_service.start()  # remember, blocks main thread!
