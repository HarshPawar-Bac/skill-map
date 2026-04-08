import { createClient } from "@/lib/supabase/server";
import {
  createEndorsementRequest,
  getRequestsByUser,
} from "@/services/endorsement-request.service";
import {
  endorsementRequestSchema,
  type EndorsementRequestFormData,
} from "@/validations/endorsement-request";
import { sendEndorsementRequestEmail } from "@/lib/email/resend";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await getRequestsByUser(supabase, user.id);

  if (error) {
    console.error("[endorsement-requests] Failed to fetch requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: EndorsementRequestFormData = await request.json();
  const result = endorsementRequestSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { skill_id, endorser_email } = result.data;

  const { data: skill } = await supabase
    .from("skills")
    .select("id, name, category, status")
    .eq("id", skill_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  if (skill.status === "pending_evidence") {
    return NextResponse.json(
      { error: "Please upload evidence before sending endorsement requests" },
      { status: 400 }
    );
  }

  const { data: evidence } = await supabase
    .from("evidence")
    .select("id")
    .eq("skill_id", skill_id)
    .maybeSingle();

  if (!evidence) {
    return NextResponse.json(
      { error: "Evidence not found. Please upload evidence first." },
      { status: 400 }
    );
  }

  const { data: authUser } = await supabase.auth.getUser();
  const developerName = authUser.user?.user_metadata?.username || 
                        authUser.user?.email?.split('@')[0] || 
                        "A developer";

  const { data, error, token } = await createEndorsementRequest(
    supabase,
    skill_id,
    user.id,
    endorser_email
  );

  if (error) {
    console.error("[endorsement-requests] Failed to create request:", error);
    return NextResponse.json(
      { error: "Failed to create endorsement request" },
      { status: 500 }
    );
  }

  const emailResult = await sendEndorsementRequestEmail({
    to: endorser_email,
    developerName,
    skillName: skill.name,
    skillCategory: skill.category,
    token,
    expiresAt: data.expires_at,
  });

  if (!emailResult.success) {
    console.error("[endorsement-requests] Failed to send email:", emailResult.error);
    // Don't fail the request, just log the error
  }

  return NextResponse.json({ data }, { status: 201 });
}
