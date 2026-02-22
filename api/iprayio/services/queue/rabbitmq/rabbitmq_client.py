import os
import signal
import sys
import pika


class RabbitMQClient:
    def __init__(self, queue_url=None, queue_name=None, exchange=None, exchange_type="direct"):
        self._queue_url = queue_url or os.environ["QUEUE_URL"]
        self._queue_name = queue_name or os.environ["QUEUE_NAME"]
        self._exchange = exchange or os.environ["QUEUE_EXCHANGE"]
        self._exchange_type = exchange_type
        self._connection = self._create_connection()
        self._channel = self._connection.channel()
        self._channel.exchange_declare(exchange=self._exchange, exchange_type=self._exchange_type, durable=True)
        self._channel.queue_declare(queue=self._queue_name, durable=True)
        self._channel.queue_bind(exchange=self._exchange, queue=self._queue_name)
        self._channel.basic_qos(prefetch_count=1)  # implement natural load balancing (not relevant now since there will only be one instance)

        # graceful shutdown handling
        signal.signal(signal.SIGINT, self._graceful_shutdown)
        signal.signal(signal.SIGTERM, self._graceful_shutdown)

    def _create_connection(self) -> pika.BlockingConnection:
        params = pika.URLParameters(self._queue_url)
        params.socket_timeout = 5
        params.heartbeat = 60
        return pika.BlockingConnection(params)

    def publish(self, message: str) -> None:
        props = pika.BasicProperties(delivery_mode=2)  # persist message to mq disk
        self._channel.basic_publish(exchange=self._exchange, routing_key=None, body=message, properties=props)
        print("Message published.")

    def consume(self, callback):
        def _wrapped_callback(ch, method, properties, body):
            try:
                callback(body)
                ch.basic_ack(delivery_tag=method.delivery_tag)
            except Exception as e:
                print(f"Error processing message: {e}")
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

        self._channel.basic_consume(queue=self._queue_name, on_message_callback=_wrapped_callback, auto_ack=False)
        print("Started consuming...")
        self._channel.start_consuming()

    def close(self):
        if self._channel and self._channel.is_open:
            self._channel.close()
        if self._connection and self._connection.is_open:
            self._connection.close()

    def _graceful_shutdown(self, signum, frame):
        print("Shutting down gracefully...")
        self.close()
        sys.exit(0)
