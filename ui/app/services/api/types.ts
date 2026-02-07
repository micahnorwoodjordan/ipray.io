export type PrayerSubmissionRequest = {
  name?: string;
  prayer: string;
};

export type PrayerSubmissionResponse = {
  id: string;
  received_at: string;
};
