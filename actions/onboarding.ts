"use server";

import { createClient } from "@/lib/supabase/server";
import {
  onboardingSchema,
  type OnboardingFormData,
} from "@/validations/onboarding";
import {
  checkUserNameAvailable,
  updateUserProfile,
} from "@/services/user.service";
import { revalidatePath } from "next/cache";

const ROLE_DESTINATION: Record<string, string> = {
  developer: "/dashboard/developer/skills",
  endorser: "/dashboard/endorser/endorsements",
  employer: "/dashboard/employer/shortlists",
};

export async function checkUserName(
  username: string,
): Promise<{ available: boolean }> {
  if (username.length < 3) return { available: false };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { available: false };

  const available = await checkUserNameAvailable(supabase, username, user.id);
  return { available };
}

export async function completeOnboarding(
  formData: OnboardingFormData,
): Promise<{ error: string | Record<string, string[]> }> {
  const result = onboardingSchema.safeParse(formData);

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

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
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath(`/u/${username}`);

  const destination =
    ROLE_DESTINATION[profile?.role ?? "developer"] ??
    "/dashboard/developer/skills";

  return { error: "", destination };
}
