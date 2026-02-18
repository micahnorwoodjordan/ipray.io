import { sendApiRequest } from './client';
import { PrayerSubmissionRequest, PrayerSubmissionResponse, PrayerResponse } from './types';

export async function submitPrayer(payload: PrayerSubmissionRequest): Promise<PrayerSubmissionResponse> {
  return sendApiRequest<PrayerSubmissionResponse>('api/prayer/create', {
    method: 'POST',
    body: payload,
  });
}

export async function fetchPrayer(id?: string): Promise<PrayerResponse> {
  const path = 'api/prayer';
  return sendApiRequest<PrayerResponse>(path, { method: 'GET' });
}
