import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get("redirect_to") || "/dashboard/developer/settings";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?action=connect_github&user_id=${user.id}&redirect_to=${encodeURIComponent(redirectTo)}`,
      scopes: "read:user user:email repo",
    },
  });

  if (error) {
    console.error("[github-connect] OAuth initiation failed:", error);
    return NextResponse.json(
      { error: "Failed to initiate GitHub connection" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: data.url });
}
