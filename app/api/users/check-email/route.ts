import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existingUser } = await supabase
    .from("users")
    .select("id, username, email")
    .eq("email", email)
    .eq("status", "active")
    .maybeSingle();

  if (existingUser) {
    if (existingUser.id === user.id) {
      return NextResponse.json({
        exists: false,
        message: "You cannot endorse your own skills",
        error: true,
      });
    }

    return NextResponse.json({
      exists: true,
      message: "User found on SkillMap",
      username: existingUser.username,
    });
  }

  return NextResponse.json({
    exists: false,
    message: "User will receive an invitation email",
  });
}
