import threading

from http.server import BaseHTTPRequestHandler, HTTPServer

from django.core.management.base import BaseCommand


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
    help = "Run a simple and lightweight http server to respond to health checks"

    def handle(self, *args, **options):
        threading.Thread(target=start_health_server, daemon=True).start()
