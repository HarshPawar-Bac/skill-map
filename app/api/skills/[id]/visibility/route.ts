import { createClient } from "@/lib/supabase/server";
import { updateSkillVisibility } from "@/services/skill.service";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
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

  const { visibility } = await request.json();

  if (!visibility || !["public", "private"].includes(visibility)) {
    return NextResponse.json(
      { error: "Invalid visibility value. Must be 'public' or 'private'" },
      { status: 400 }
    );
  }

  const { data, error } = await updateSkillVisibility(
    supabase,
    skillId,
    user.id,
    visibility
  );

  if (error) {
    console.error("[visibility] Failed to update visibility:", error);
    return NextResponse.json(
      { error: "Failed to update visibility" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}
