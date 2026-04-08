import { createClient } from "@/lib/supabase/server";
import { createSkill, getSkillsByUser } from "@/services/skill.service";
import { skillSchema, type SkillFormData } from "@/validations/skill";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await getSkillsByUser(supabase, user.id);

  if (error) {
    console.error("[skills] Failed to fetch skills:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: SkillFormData = await request.json();
  const result = skillSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { data, error } = await createSkill(supabase, user.id, result.data);

  if (error) {
    console.error("[skills] Failed to create skill:", error);
    return NextResponse.json(
      { error: "Failed to create skill" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}
