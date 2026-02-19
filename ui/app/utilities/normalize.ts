import { PrayerSubmissionRequest } from '../services/api/types';

const MAX_PRAYER_LENGTH = 2000;

export function normalizeText(value: string): string {
  if (typeof value !== "string") return value;

  return value.trim()
    .normalize("NFKC")              // no homoglyph & encoding weirdness
    .replace(/\r\n/g, "\n")         // hanlde line endings
    .replace(/\r/g, "\n")
    .replace(/\u0000/g, "");        // no null bytes
}

export function sanitizePrayerPayload(payload: PrayerSubmissionRequest): PrayerSubmissionRequest  {
  const normalized = {
    user_name: payload.user_name ? normalizeText(payload.user_name) : "",
    text: normalizeText(payload.text),
    user_email: payload.user_email ? normalizeText(payload.user_email) : "",
    is_public: payload.is_public,
    denomination: payload.denomination
  };

  if (!normalized.text || normalized.text.length === 0) {
    throw new Error("Prayer text cannot be empty.");
  }

  if (normalized.text.length > MAX_PRAYER_LENGTH) {
    throw new Error("Prayer exceeds 2000 character limit.");
  }

  return normalized;
}
