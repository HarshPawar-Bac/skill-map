import { createClient } from "@/lib/supabase/server";
import { searchEndorsers } from "@/services/endorsement-request.service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await searchEndorsers(supabase, query);

  if (error) {
    console.error("[search] Failed to search users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }

  const filtered = data?.filter((u) => u.id !== user.id) || [];

  return NextResponse.json({ data: filtered });
}
