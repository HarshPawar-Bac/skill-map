import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: skillId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }


  const { data: skill } = await supabase
    .from("skills")
    .select("id")
    .eq("id", skillId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  const { url } = await request.json();

  if (!url) {
    return NextResponse.json(
      { error: "URL is required" },
      { status: 400 }
    );
  }

  try {
    new URL(url);

    const response = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(10000),
    });

    const isValid = response.ok && response.status === 200;

    return NextResponse.json({
      data: {
        valid: isValid,
        status: response.status,
        statusText: response.statusText,
      },
    });
  } catch (error) {
    console.error("[verify-url] Error:", error);
    return NextResponse.json({
      data: {
        valid: false,
        status: 0,
        statusText: "Failed to reach URL",
      },
    });
  }
}
