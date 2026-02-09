export type PrayerSubmissionRequest = {
  user_name?: string;
  text: string;
  is_public: boolean;
  user_email?: string;
};

export type PrayerSubmissionResponse = {
  id: string;
  received_at: string;
};
