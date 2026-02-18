export type PrayerSubmissionRequest = {
  user_name?: string;
  text: string;
  is_public: boolean;
  user_email?: string;
  denomination: string;
};

export type PrayerSubmissionResponse = {
  id: string;
  received_at: string;
};

export type PrayerResponse = {
  text: string;
  created_at: string;
  next_allowed_at: string;
};
