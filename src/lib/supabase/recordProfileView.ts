import { getSupabaseAdmin } from "./client";

/**
 * Fire-and-forget profile view for B2B share validation.
 * Never throws to callers — failures must not block report display.
 */
export async function recordProfileView(options: {
  assessmentId: string;
  profileId: string;
  userAgent?: string | null;
  referer?: string | null;
}): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return;

    const { error } = await supabase.from("profile_views").insert({
      assessment_id: options.assessmentId,
      profile_id: options.profileId,
      user_agent: options.userAgent?.slice(0, 512) || null,
      referer: options.referer?.slice(0, 1024) || null,
    });

    if (error) {
      console.error("[supabase] Failed to record profile view:", error.message);
    }
  } catch (err) {
    console.error(
      "[supabase] profile view error:",
      err instanceof Error ? err.message : err,
    );
  }
}
