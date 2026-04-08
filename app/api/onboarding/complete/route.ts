import { createClient } from "@/lib/supabase/server";
import { updateUserProfile } from "@/services/user.service";
import {
  onboardingSchema,
  type OnboardingFormData,
} from "@/validations/onboarding";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const ROLE_DESTINATION: Record<string, string> = {
  developer: "/dashboard/developer/skills",
  endorser: "/dashboard/endorser/endorsements",
  employer: "/dashboard/employer/shortlists",
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: OnboardingFormData = await request.json();
  const result = onboardingSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { username, headline, bio, location, availability } = result.data;

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const { error } = await updateUserProfile(supabase, user.id, {
    username,
    headline,
    bio: bio ?? null,
    location: location ?? null,
    availability,
    onboarding_complete: true,
  });

  if (error) {
    console.error("[onboarding] Profile update failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  revalidatePath(`/u/${username}`);

  const destination =
    ROLE_DESTINATION[profile?.role ?? "developer"] ??
    "/dashboard/developer/skills";

  return NextResponse.json({ data: { destination } }, { status: 200 });
}
