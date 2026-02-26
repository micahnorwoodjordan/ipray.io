from logging import Logger


def log_typed_error(logger: Logger, error: Exception, msg: str):
    logger.error(
        msg,
        extra={
            'type': type(error).__name__,
            'raw': str(error)
        }
    )
