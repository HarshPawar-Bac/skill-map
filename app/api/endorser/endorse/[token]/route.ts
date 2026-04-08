import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getPresignedDownloadUrl } from "@/lib/s3/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: endorsementRequest, error: requestError } = await supabase
    .from("endorsement_requests")
    .select("*")
    .eq("token", token)
    .single();

  if (requestError || !endorsementRequest) {
    return NextResponse.json(
      { error: "Endorsement request not found" },
      { status: 404 }
    );
  }

  if (new Date(endorsementRequest.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "This endorsement request has expired" },
      { status: 410 }
    );
  }


  if (endorsementRequest.status !== "pending") {
    return NextResponse.json(
      { error: `This request has already been ${endorsementRequest.status}` },
      { status: 400 }
    );
  }

  const { data: skill, error: skillError } = await supabase
    .from("skills")
    .select("*")
    .eq("id", endorsementRequest.skill_id)
    .single();

  if (skillError || !skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  const { data: evidence, error: evidenceError } = await supabase
    .from("evidence")
    .select("*")
    .eq("skill_id", skill.id)
    .single();

  if (evidenceError || !evidence) {
    return NextResponse.json({ 
      error: "Evidence not found. The developer needs to upload evidence before this skill can be endorsed." 
    }, { status: 404 });
  }

  const { url: videoUrl } = await getPresignedDownloadUrl(evidence.video_s3_key);

  const { data: developer, error: developerError } = await supabase
    .from("users")
    .select("id, username, headline, bio, location, avatar_url")
    .eq("id", endorsementRequest.requester_id)
    .single();

  if (developerError || !developer) {
    return NextResponse.json(
      { error: "Developer not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    data: {
      request: endorsementRequest,
      skill,
      evidence: {
        ...evidence,
        video_url: videoUrl,
      },
      developer,
    },
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { 
    code_quality_rating, 
    problem_solving_rating, 
    proficiency_depth_rating,
    would_recommend,
    assessment,
    action,
    decline_reason
  } = body;

  const { data: endorsementRequest, error: requestError } = await supabase
    .from("endorsement_requests")
    .select("*")
    .eq("token", token)
    .single();

  if (requestError || !endorsementRequest) {
    return NextResponse.json(
      { error: "Endorsement request not found" },
      { status: 404 }
    );
  }

  if (action === "decline") {
    // Decline the request
    const { error: updateError } = await supabase
      .from("endorsement_requests")
      .update({
        status: "declined",
        decline_reason: decline_reason || "No reason provided",
        endorser_id: user.id
      })
      .eq("id", endorsementRequest.id);

    if (updateError) {
      console.error("Failed to decline request:", updateError);
      return NextResponse.json(
        { error: "Failed to decline request" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { success: true, action: "declined" } });
  }

  if (!code_quality_rating || code_quality_rating < 1 || code_quality_rating > 5) {
    return NextResponse.json(
      { error: "Code Quality rating must be between 1 and 5" },
      { status: 400 }
    );
  }
  if (!problem_solving_rating || problem_solving_rating < 1 || problem_solving_rating > 5) {
    return NextResponse.json(
      { error: "Problem Solving rating must be between 1 and 5" },
      { status: 400 }
    );
  }
  if (!proficiency_depth_rating || proficiency_depth_rating < 1 || proficiency_depth_rating > 5) {
    return NextResponse.json(
      { error: "Proficiency Depth rating must be between 1 and 5" },
      { status: 400 }
    );
  }
  if (!assessment || assessment.length < 50) {
    return NextResponse.json(
      { error: "Assessment must be at least 50 characters" },
      { status: 400 }
    );
  }

  const averageRating = Math.round(
    (code_quality_rating + problem_solving_rating + proficiency_depth_rating) / 3
  );

  const { data: endorsement, error: endorsementError } = await supabase
    .from("endorsements")
    .insert({
      request_id: endorsementRequest.id,
      skill_id: endorsementRequest.skill_id,
      endorser_id: user.id,
      developer_id: endorsementRequest.requester_id,
      rating: averageRating,
      code_quality_rating,
      problem_solving_rating,
      proficiency_depth_rating,
      would_recommend: would_recommend || false,
      assessment,
    })
    .select()
    .single();

  if (endorsementError) {
    console.error("Failed to create endorsement:", endorsementError);
    return NextResponse.json(
      { error: "Failed to create endorsement" },
      { status: 500 }
    );
  }

  const { data: updatedRequest, error: updateError } = await supabase
    .from("endorsement_requests")
    .update({ 
      status: "completed",
      endorser_id: user.id
    })
    .eq("id", endorsementRequest.id)
    .select()
    .single();

  if (updateError) {
    console.error("[endorse] Failed to update request status:", updateError);
  } else {
    console.log("[endorse] Request status updated to completed:", updatedRequest);
  }

  const { data: updatedSkill, error: skillError } = await supabase
    .from("skills")
    .update({ status: "verified" })
    .eq("id", endorsementRequest.skill_id)
    .select()
    .single();

  if (skillError) {
    console.error("[endorse] Failed to update skill status:", skillError);
  } else {
    console.log("[endorse] Skill status updated to verified:", updatedSkill);
  }

  return NextResponse.json({ data: endorsement }, { status: 201 });
}
