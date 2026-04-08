import { createClient } from "@/lib/supabase/server";
import { getRequestsBySkillId } from "@/services/endorsement-request.service";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ skillId: string }> }
) {
  const { skillId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await getRequestsBySkillId(supabase, skillId, user.id);

  if (error) {
    console.error("[endorsement-requests] Failed to fetch requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}
