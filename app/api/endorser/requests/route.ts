import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userEmail = user.email;

  if (!userEmail) {
    return NextResponse.json({ error: "User email not found" }, { status: 400 });
  }

  console.log("[endorser/requests] Fetching requests for email:", userEmail, "and user ID:", user.id);

  const { data: requests, error: requestsError } = await supabase
    .from("endorsement_requests")
    .select("*")
    .or(`endorser_email.eq.${userEmail},endorser_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (requestsError) {
    console.error("[endorser/requests] Failed to fetch requests:", requestsError);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }

  console.log("[endorser/requests] Found requests:", requests?.length || 0);

  if (!requests || requests.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const requestsWithDetails = await Promise.all(
    requests.map(async (request) => {
      // Fetch skill details
      const { data: skill } = await supabase
        .from("skills")
        .select("id, name, category")
        .eq("id", request.skill_id)
        .single();

      const { data: requester } = await supabase
        .from("users")
        .select("id, username, headline")
        .eq("id", request.requester_id)
        .single();

      return {
        ...request,
        skills: skill || null,
        requester: requester || null,
      };
    })
  );

  return NextResponse.json({ data: requestsWithDetails });
}
