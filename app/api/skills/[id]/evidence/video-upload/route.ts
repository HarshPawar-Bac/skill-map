import { createClient } from "@/lib/supabase/server";
import {
  generateVideoKey,
  getPresignedUploadUrl,
  validateFileSize,
} from "@/lib/s3/client";
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

  // Verify skill ownership
  const { data: skill } = await supabase
    .from("skills")
    .select("id")
    .eq("id", skillId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  const { content_type, file_size } = await request.json();

  if (!content_type || !file_size) {
    return NextResponse.json(
      { error: "Content type and file size are required" },
      { status: 400 }
    );
  }

  if (!validateFileSize(file_size)) {
    return NextResponse.json(
      { error: "File size exceeds 50MB limit" },
      { status: 400 }
    );
  }

  const s3Key = generateVideoKey(user.id, skillId);

  const { url, error } = await getPresignedUploadUrl(s3Key, content_type);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({
    data: {
      upload_url: url,
      s3_key: s3Key,
    },
  });
}
