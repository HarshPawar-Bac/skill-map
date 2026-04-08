import { createClient } from "@/lib/supabase/server";
import { cancelEndorsementRequest } from "@/services/endorsement-request.service";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: requestId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await cancelEndorsementRequest(supabase, requestId, user.id);

  if (error) {
    console.error("[cancel] Failed to cancel request:", error);
    return NextResponse.json(
      { error: "Failed to cancel request" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { success: true } });
}
