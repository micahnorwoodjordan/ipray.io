from functools import wraps
from typing import Callable

from django.http import HttpRequest, HttpResponse

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


def logged_method_call(logger: Logger) -> Callable:
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(request: HttpRequest, *args, **kwargs) -> HttpResponse:
            logger.info(
                "INCOMING REQUEST",
                extra={
                    "method": request.method,
                    "path": request.path,
                }
            )

            response = func(request, *args, **kwargs)

            logger.info(
                "OUTGOING RESPONSE",
                extra={
                    "status_code": getattr(response, "status_code", None)
                }
            )

            return response

        return wrapper
    return decorator
