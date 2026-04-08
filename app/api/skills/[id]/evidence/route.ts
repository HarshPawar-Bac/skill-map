import { createClient } from "@/lib/supabase/server";
import {
  createEvidence,
  deleteEvidence,
  getEvidenceBySkillId,
} from "@/services/evidence.service";
import { evidenceSchema, type EvidenceFormData } from "@/validations/evidence";
import { NextResponse } from "next/server";

export async function GET(
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

  const { data, error } = await getEvidenceBySkillId(supabase, skillId, user.id);

  if (error) {
    console.error("[evidence] Failed to fetch evidence:", error);
    return NextResponse.json(
      { error: "Failed to fetch evidence" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

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
    .select("id, status")
    .eq("id", skillId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  const body: EvidenceFormData = await request.json();
  const result = evidenceSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { data, error } = await createEvidence(
    supabase,
    skillId,
    user.id,
    result.data
  );

  if (error) {
    console.error("[evidence] Failed to create evidence:", error);
    return NextResponse.json(
      { error: "Failed to save evidence" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}

export async function DELETE(
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

  const { error } = await deleteEvidence(supabase, skillId, user.id);

  if (error) {
    console.error("[evidence] Failed to delete evidence:", error);
    return NextResponse.json(
      { error: "Failed to delete evidence" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { success: true } });
}
