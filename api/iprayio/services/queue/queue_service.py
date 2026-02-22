from iprayio.models import Prayer
from .rabbitmq.rabbitmq_client import RabbitMQClient


class QueueService:
    def __init__(self):
        self._client = RabbitMQClient()

    def _publish(self, payload: dict) -> None:
        self._client.publish(payload)

    def publish_prayer_request_email_event(self, prayer: Prayer) -> None:
        payload = {'id': prayer.id}
        self._publish(payload)

    def consume(self, handler):
        self._client.consume(handler)
