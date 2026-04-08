import { createClient } from "@/lib/supabase/server";
import { fetchRepoSummary } from "@/lib/github/client";
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

  const { data: profile } = await supabase
    .from("users")
    .select("github_connected, github_token")
    .eq("id", user.id)
    .single();

  if (!profile?.github_connected || !profile.github_token) {
    return NextResponse.json(
      { error: "GitHub account not connected. Please connect GitHub from Settings." },
      { status: 400 }
    );
  }

  const { repo_url } = await request.json();

  if (!repo_url) {
    return NextResponse.json(
      { error: "Repository URL is required" },
      { status: 400 }
    );
  }

  const githubUrlPattern = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/;
  if (!githubUrlPattern.test(repo_url)) {
    return NextResponse.json(
      { error: "Invalid GitHub repository URL format" },
      { status: 400 }
    );
  }

  const { data, error } = await fetchRepoSummary(
    repo_url,
    profile.github_token,
    supabase
  );

  if (error) {
    if (error.includes("invalid") || error.includes("expired")) {
      await supabase
        .from("users")
        .update({ github_connected: false })
        .eq("id", user.id);

      return NextResponse.json(
        { error: "GitHub token expired. Please reconnect GitHub from Settings." },
        { status: 401 }
      );
    }

    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ data });
}
