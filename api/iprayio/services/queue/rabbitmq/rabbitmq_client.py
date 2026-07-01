import os
import json
import logging

from pika import BlockingConnection, URLParameters, BasicProperties

from iprayio.utilities import logging_utilities


logger = logging.getLogger(__name__)


class RabbitMQClientException(Exception):
    pass


EXCHANGE = ''
EXCHANGE_TYPE = 'direct'


class RabbitMQClient:
    def __init__(self, queue_url=None, queue_name=None):
        try:
            self._queue_url = queue_url or os.environ['QUEUE_URL']
            self._queue_name = queue_name or os.environ['QUEUE_NAME']
            self._exchange = EXCHANGE  # jsut use default exchange for now
            self._exchange_type = EXCHANGE_TYPE
            self._connection = self._create_connection()
            self._channel = self._connection.channel()
            self._channel.confirm_delivery()
            self._channel.queue_declare(queue=self._queue_name, durable=True, auto_delete=True)
            self._channel.basic_qos(prefetch_count=1)
            self._channel.add_on_return_callback(self._on_return)
        except Exception as e:
            logging_utilities.transform_and_log_exception(e, RabbitMQClientException, logger, f'there was an error initializing RabbitMqClient: {str(e)}')

    def _create_connection(self) -> BlockingConnection:
        params = URLParameters(self._queue_url)
        params.socket_timeout = 5
        params.heartbeat = 60
        return BlockingConnection(params)

    def _on_return(self, ch, method, properties, body):
        raise RuntimeError('Message was returned as unroutable')

    def publish(self, payload: dict) -> None:
        encoded = json.dumps(payload).encode('utf-8')
        props = BasicProperties(delivery_mode=2, content_type='application/json')
        try:
            self._channel.basic_publish(exchange=self._exchange, routing_key=self._queue_name, body=encoded, properties=props, mandatory=True)
        except Exception as e:
            logging_utilities.transform_and_log_exception(e, RabbitMQClientException, logger, None, reraise=True)

    def consume(self, callback):
        def _wrapped_callback(ch, method, properties, body):
            try:
                callback(body)
                ch.basic_ack(delivery_tag=method.delivery_tag)
            except Exception as e:
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
                logging_utilities.transform_and_log_exception(e, RabbitMQClientException, logger, None)

        self._channel.basic_consume(queue=self._queue_name, on_message_callback=_wrapped_callback, auto_ack=False)

    def start_consuming(self):
        self._channel.start_consuming()

    def stop_consuming(self):
        if self._channel.is_open:
            self._channel.stop_consuming()

    def close(self):
        if self._channel and self._channel.is_open:
            self._channel.close()
        if self._connection and self._connection.is_open:
            self._connection.close()
