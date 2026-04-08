import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("users")
    .update({
      github_connected: false,
      github_token: null,
    })
    .eq("id", user.id);

  if (error) {
    console.error("[github-disconnect] Failed to disconnect:", error);
    return NextResponse.json(
      { error: "Failed to disconnect GitHub" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { success: true } });
}
