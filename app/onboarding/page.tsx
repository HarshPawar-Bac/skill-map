import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OnboardingWizard from "./OnboardingWizard";

const ROLE_DASHBOARD: Record<string, string> = {
  developer: "/dashboard/developer/skills",
  endorser: "/dashboard/endorser/endorsements",
  employer: "/dashboard/employer/shortlists",
  admin: "/admin",
};

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("onboarding_complete, role")
    .eq("id", user.id)
    .single();

  if (profile?.onboarding_complete) {
    const destination =
      ROLE_DASHBOARD[profile.role] ?? "/dashboard/developer/skills";
    redirect(destination);
  }

  return <OnboardingWizard role={profile?.role ?? "developer"} />;
}
