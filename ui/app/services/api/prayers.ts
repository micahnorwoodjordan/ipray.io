import { sendApiRequest } from './client';
import { PrayerSubmissionRequest, PrayerSubmissionResponse } from './types';

export async function submitPrayer(payload: PrayerSubmissionRequest): Promise<PrayerSubmissionResponse> {
  return sendApiRequest<PrayerSubmissionResponse>('api/prayers/create', {
    method: 'POST',
    body: payload,
  });
}
