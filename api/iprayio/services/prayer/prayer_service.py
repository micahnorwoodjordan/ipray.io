import random
import logging
import hashlib
from datetime import timedelta

from django.conf import settings
from django.utils.timezone import now
from django.core.exceptions import ObjectDoesNotExist

from iprayio.models import Prayer
from iprayio.utilities import logging_utilities


logger = logging.getLogger(__name__)


class PrayerServiceException(Exception):
    pass


class PrayerServiceRateLimitException(PrayerServiceException):
    pass


class SuspiciousSubmissionException(PrayerServiceException):
    pass


class PrayerService:

    @staticmethod
    def to_dict(prayer: Prayer):
        return dict(
            prayer_id=prayer.id,
            created_at=prayer.created_at,
            next_allowed_at=prayer.next_allowed_at,
            is_public=prayer.is_public
        )

    @staticmethod
    def hash_prayer_text(text):
        normalized_text = " ".join(text.split())  # Normalize whitespace before hashing
        return hashlib.sha256(normalized_text.encode("utf-8")).hexdigest()

    # TODO: use redis
    @staticmethod
    def is_rate_limited(ip_address: str, content_hash: str):
        qs = Prayer.objects.filter(user_ip_address=ip_address, content_hash=content_hash)
        latest = qs.order_by("-created_at").first()

        if not latest:
            return False
        return now() < latest.next_allowed_at

    @staticmethod
    def create_new_prayer_request(prayer_text, ip_address, user_name, user_email, is_public):
        prayer_content_hash = PrayerService.hash_prayer_text(prayer_text)

        if PrayerService.is_rate_limited(ip_address, prayer_content_hash):
            raise PrayerServiceRateLimitException('prayer request submission rate limit exceeded')

        prayer = Prayer.objects.create(
            text=prayer_text,
            content_hash=prayer_content_hash,
            user_ip_address=ip_address,
            next_allowed_at=now() + timedelta(minutes=settings.RATE_LIMIT_MINUTES),
            user_name=user_name,
            user_email=user_email,
            is_public=is_public
        )

        logger.info('new Prayer object created', extra=PrayerService.to_dict(prayer))
        return prayer

    def get_prayer_request(self, prayer_id):
        try:
            return Prayer.objects.get(id=prayer_id)
        except ObjectDoesNotExist as e:
            logging_utilities.log_typed_error(logger, e, 'Prayer object does not exist')

    # for the "stand in agreement" feature
    def get_random_prayer_request(self):
        """fetch a shareable prayer at random, taking into account possible non-sequential id's in the target table"""
        try:
            prayers = list(Prayer.objects.filter(is_public=True, is_approved=True))
            ids = [p.id for p in prayers]
            idx = random.randint(0, len(ids) - 1)
            return prayers[idx]
        except ObjectDoesNotExist as e:
            logging_utilities.log_typed_error(logger, e, 'Prayer object does not exist')
