export interface WeekData {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  status: 'past' | 'current' | 'future';
}

export interface CloudflareBindings {
  RESEND_API_KEY: string;
  EMAIL_RECIPIENTS: string; // JSON array string
  FROM_EMAIL: string;
  /** Optional. If set, request must include Authorization: Bearer <CRON_SECRET> or x-cron-secret header. */
  CRON_SECRET?: string;
}

export interface EmailData {
  weeksRemaining: number;
  currentWeek: number;
  totalWeeks: number;
  weeks: WeekData[];
}
