// Analytics adapter, disabled by default. No events leave the device in the demo.
// Enable only after a consent/data review; then send pseudonymous IDs and minimal fields.

export type AnalyticsEvent =
  | 'path_selected'
  | 'lesson_started'
  | 'stage_completed'
  | 'hint_requested'
  | 'assessment_submitted'
  | 'lesson_completed'
  | 'review_completed';

export interface AnalyticsAdapter {
  enabled: boolean;
  track(event: AnalyticsEvent, fields: Record<string, string | number | boolean>): void;
}

export const analytics: AnalyticsAdapter = {
  enabled: false,
  track() {
    /* intentionally a no-op in the demo */
  },
};
