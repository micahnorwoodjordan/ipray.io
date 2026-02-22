import json

from iprayio.models import Prayer
from iprayio.services.queue.rabbitmq.rabbitmq_client import RabbitMQClient
from iprayio.services.notification.notification_service import NotificationService, NotificationMethod


class QueueService:
    def __init__(self):
        self._client = RabbitMQClient()
        self._notification_service = NotificationService()

    def publish_prayer_request_notification_event(self, prayer: Prayer) -> None:
        payload = {
            'id': prayer.id,
            'methods': [NotificationMethod.EMAIL.name]
            # 'methods': [NotificationMethod.EMAIL.name, NotificationMethod.SMS.name],  # TODO: handle once sms is figured out
        }
        self._client.publish(payload)

    def register_consumer(self):
        def consume_prayer_request_notification_event(body: bytes):
            payload = json.loads(body.decode('utf-8'))
            prayer_id = payload['id']
            methods = payload['methods']
            self._notification_service.notify_admin(methods, prayer_id)

        self._client.consume(consume_prayer_request_notification_event)

    def start(self):
        self._client.start_consuming()

    def stop(self):
        self._client.stop_consuming()
        self._client.close()
