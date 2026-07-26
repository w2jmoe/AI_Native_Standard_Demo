import { track } from "@vercel/analytics";

export type AnsEventName =
  | "page_view"
  | "start_assessment"
  | "submit_assessment"
  | "evaluation_completed"
  | "share_clicked";

/**
 * Anonymous funnel events only.
 * Never send answers, names, emails, or other PII.
 */
export function trackEvent(
  name: AnsEventName,
  properties?: Record<string, string | number | boolean>,
) {
  try {
    track(name, properties);
  } catch {
    // Analytics must never block the product flow.
  }
}
