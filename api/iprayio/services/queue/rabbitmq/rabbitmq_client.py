import os
import pika


QUEUE_URL = os.environ['QUEUE_URL']
QUEUE_NAME = os.environ['QUEUE_NAME']
QUEUE_EXCHANGE = os.environ['QUEUE_EXCHANGE']


def publish():
    params = pika.URLParameters(QUEUE_URL)
    params.socket_timeout = 5
    connection = pika.BlockingConnection(params)  # Connect to CloudAMQP
    channel = connection.channel()
    channel.queue_declare(queue=QUEUE_NAME, durable=True)

    channel.basic_publish(exchange=QUEUE_EXCHANGE, routing_key='', body='test from micah macbook pro')
    connection.close()

    print("Message published. closing connection")


def consume(msg):
    params = pika.URLParameters(QUEUE_URL)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.queue_declare(queue=QUEUE_NAME)
    channel.basic_consume(QUEUE_NAME, print('sending email'), auto_ack=True)  # set up subscription on the queue
    channel.start_consuming()  # start consuming (blocks)
    connection.close()
