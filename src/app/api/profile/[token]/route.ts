import { NextResponse } from "next/server";
import {
  isShareToken,
  loadSharedProfile,
} from "@/lib/supabase/saveAssessment";
import { recordProfileView } from "@/lib/supabase/recordProfileView";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { token } = await context.params;
    if (!token || !isShareToken(token)) {
      return NextResponse.json({ error: "Invalid share token." }, { status: 400 });
    }

    const profile = await loadSharedProfile(token);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    // B2B validation: did this Candidate Profile Link get opened?
    // Non-blocking — never delay or fail the report response.
    void recordProfileView({
      assessmentId: profile.shareToken,
      profileId: profile.result.profileId,
      userAgent: request.headers.get("user-agent"),
      referer: request.headers.get("referer"),
    });

    return NextResponse.json(profile);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load profile.";
    console.error("[api/profile]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
