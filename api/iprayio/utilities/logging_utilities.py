from logging import Logger


def log_typed_error(logger: Logger, error: Exception, msg: str):
    logger.error(
        msg,
        extra={
            'type': type(error).__name__,
            'raw': str(error)
        }
    )


def transform_and_log_exception(
        source_exception: Exception,  # exception instance
        target_exception: Exception,  # exception class name
        logger: Logger,
        msg: str | None = None,
        reraise: bool = False
):
    if msg is None:
        msg = 'there was an unexpected client error'

    target_exception = target_exception(str(source_exception))
    log_typed_error(logger, target_exception, msg)

    if reraise:
        raise target_exception
