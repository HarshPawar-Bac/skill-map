import { SupabaseClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";

export async function getRequestsByUser(
  supabase: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from("endorsement_requests")
    .select("*")
    .eq("requester_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return { data, error };
  }

  const requestsWithSkills = await Promise.all(
    data.map(async (request) => {
      const { data: skill } = await supabase
        .from("skills")
        .select("id, name, category")
        .eq("id", request.skill_id)
        .single();

      return {
        ...request,
        skills: skill || null,
      };
    })
  );

  return { data: requestsWithSkills, error: null };
}

export async function getRequestsBySkillId(
  supabase: SupabaseClient,
  skillId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from("endorsement_requests")
    .select("*")
    .eq("skill_id", skillId)
    .eq("requester_id", userId)
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function createEndorsementRequest(
  supabase: SupabaseClient,
  skillId: string,
  requesterId: string,
  endorserEmail: string
) {
  const token = nanoid(32);

  const { data, error } = await supabase
    .from("endorsement_requests")
    .insert({
      skill_id: skillId,
      requester_id: requesterId,
      endorser_email: endorserEmail,
      endorser_id: null, 
      token,
    })
    .select()
    .single();

  return { data, error, token };
}

export async function resendEndorsementRequest(
  supabase: SupabaseClient,
  requestId: string,
  userId: string
) {
  const newToken = nanoid(32);
  const newExpiresAt = new Date();
  newExpiresAt.setDate(newExpiresAt.getDate() + 7);

  const { data, error } = await supabase
    .from("endorsement_requests")
    .update({
      token: newToken,
      expires_at: newExpiresAt.toISOString(),
      status: "pending",
    })
    .eq("id", requestId)
    .eq("requester_id", userId)
    .select()
    .single();

  return { data, error, token: newToken };
}

export async function cancelEndorsementRequest(
  supabase: SupabaseClient,
  requestId: string,
  userId: string
) {
  const { error } = await supabase
    .from("endorsement_requests")
    .update({ status: "cancelled" })
    .eq("id", requestId)
    .eq("requester_id", userId);

  return { error };
}

export async function searchEndorsers(
  supabase: SupabaseClient,
  query: string
) {
  const { data, error } = await supabase
    .from("users")
    .select("id, username, headline, avatar_url")
    .or(`username.ilike.%${query}%,headline.ilike.%${query}%`)
    .eq("status", "active")
    .limit(10);

  return { data, error };
}
