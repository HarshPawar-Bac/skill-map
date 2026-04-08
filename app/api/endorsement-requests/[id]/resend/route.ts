import { createClient } from "@/lib/supabase/server";
import { resendEndorsementRequest } from "@/services/endorsement-request.service";
import { sendEndorsementRequestEmail } from "@/lib/email/resend";
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

  const { data: existingRequest } = await supabase
    .from("endorsement_requests")
    .select(`
      *,
      skills:skill_id (
        name,
        category
      )
    `)
    .eq("id", requestId)
    .eq("requester_id", user.id)
    .maybeSingle();

  if (!existingRequest) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (!["expired", "declined"].includes(existingRequest.status)) {
    return NextResponse.json(
      { error: "Only expired or declined requests can be resent" },
      { status: 400 }
    );
  }

  const { data, error, token } = await resendEndorsementRequest(
    supabase,
    requestId,
    user.id
  );

  if (error) {
    console.error("[resend] Failed to resend request:", error);
    return NextResponse.json(
      { error: "Failed to resend request" },
      { status: 500 }
    );
  }

  const { data: profile } = await supabase
    .from("users")
    .select("username")
    .eq("id", user.id)
    .single();

  const emailResult = await sendEndorsementRequestEmail({
    to: existingRequest.endorser_email,
    developerName: profile?.username || "A developer",
    skillName: existingRequest.skills.name,
    skillCategory: existingRequest.skills.category,
    token,
    expiresAt: data.expires_at,
  });

  if (!emailResult.success) {
    console.error("[resend] Failed to send email:", emailResult.error);
  }

  return NextResponse.json({ data });
}
