export type PrayerSubmissionRequest = {
  user_name?: string;
  text: string;
};

export type PrayerSubmissionResponse = {
  id: string;
  received_at: string;
};
