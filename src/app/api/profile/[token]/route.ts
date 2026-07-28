import { NextResponse } from "next/server";
import {
  isShareToken,
  loadSharedProfile,
} from "@/lib/supabase/saveAssessment";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { token } = await context.params;
    if (!token || !isShareToken(token)) {
      return NextResponse.json({ error: "Invalid share token." }, { status: 400 });
    }

    const profile = await loadSharedProfile(token);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load profile.";
    console.error("[api/profile]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
