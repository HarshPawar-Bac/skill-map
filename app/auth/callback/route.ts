import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const roleFromQuery = searchParams.get("role");

  const supabase = await createClient();

  if (!code) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${origin}/login?error=no_session`);
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role, onboarding_complete")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.redirect(`${origin}/login?error=no_profile`);
    }

    return NextResponse.redirect(
      `${origin}${getDestination(profile.role, profile.onboarding_complete)}`,
    );
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    console.error("[auth/callback] Session exchange failed:", error?.message);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  const { user, session } = data;
  const provider = user.app_metadata?.provider;

  const { data: existingUser } = await supabase
    .from("users")
    .select("role, onboarding_complete")
    .eq("id", user.id)
    .single();

  if (existingUser) {
    if (provider === "github" && session.provider_token) {
      await supabase
        .from("users")
        .update({
          github_connected: true,
          github_username: user.user_metadata?.user_name ?? null,
          github_token: session.provider_token,
        })
        .eq("id", user.id);
    }

    return NextResponse.redirect(
      `${origin}${getDestination(existingUser.role, existingUser.onboarding_complete)}`,
    );
  }


  const assignedRole = roleFromQuery ?? user.user_metadata?.role ?? "developer";

  const { error: insertError } = await supabase.from("users").insert({
    id: user.id,
    role: assignedRole,
    avatar_url: user.user_metadata?.avatar_url ?? null,
    github_connected: provider === "github",
    github_username:
      provider === "github" ? (user.user_metadata?.user_name ?? null) : null,
    github_token:
      provider === "github" ? (session.provider_token ?? null) : null,
  });

  if (insertError) {
    console.error(
      "[auth/callback] Failed to create user row:",
      insertError.message,
    );
    return NextResponse.redirect(`${origin}/login?error=setup_failed`);
  }

  return NextResponse.redirect(`${origin}/onboarding`);
}


function getDestination(role: string, onboardingComplete: boolean): string {
  if (!onboardingComplete) return "/onboarding";

  const map: Record<string, string> = {
    developer: "/dashboard/developer/skills",
    endorser: "/dashboard/endorser/endorsements",
    employer: "/dashboard/employer/shortlists",
    admin: "/admin",
  };

  return map[role] ?? "/dashboard/developer/skills";
}