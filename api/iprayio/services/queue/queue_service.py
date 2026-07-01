import json
import enum
import logging

from iprayio.models import Prayer
from iprayio.utilities import logging_utilities
from iprayio.services.queue.rabbitmq.rabbitmq_client import RabbitMQClient
from iprayio.services.notification.notification_service import NotificationService, NotificationMethod


logger = logging.getLogger(__name__)


class QueueServiceException(Exception):
    pass


class InvalidNotificationEventException(Exception):
    pass


class NotificationEvent(enum.Enum):
    PRAYER_REQUEST_CREATION_EVENT = 0
    PRAYER_REQUEST_COMPLETION_EVENT = 1


class QueueService:
    def __init__(self):
        self._client = RabbitMQClient()
        self._notification_service = NotificationService()

    def publish_prayer_request_notification_event(self, prayer: Prayer, notification_methods: list[NotificationMethod], event_type: NotificationEvent) -> None:
        payload = {
            'id': prayer.id,
            'methods': notification_methods,
            'event_type': event_type
        }

        try:
            self._client.publish(payload)
        except Exception as e:
            logging_utilities.log_typed_error(logger, e, f'an error occurred publishing prayer notification event: {str(e)}')

    def register_consumer(self):
        def handle_prayer_request_notification_event(body: bytes):
            payload = json.loads(body.decode('utf-8'))
            prayer_id = payload['id']
            methods = payload['methods']
            event_type = payload['event_type']

            if event_type == NotificationEvent.PRAYER_REQUEST_CREATION_EVENT.value:
                summary = self._notification_service.notify_admin(methods, prayer_id)
                NotificationService.update_prayer_status(summary)

            elif event_type == NotificationEvent.PRAYER_REQUEST_COMPLETION_EVENT.value:
                self._notification_service.notify_user(prayer_id)

            else:
                raise InvalidNotificationEventException(f'unsupported event type: {event_type}')

        self._client.consume(handle_prayer_request_notification_event)

    def start(self):
        self._client.start_consuming()

    def stop(self):
        self._client.stop_consuming()
        self._client.close()
