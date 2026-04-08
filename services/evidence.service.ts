import { SupabaseClient } from "@supabase/supabase-js";
import { EvidenceFormData } from "@/validations/evidence";

export async function getEvidenceBySkillId(
  supabase: SupabaseClient,
  skillId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from("evidence")
    .select("*")
    .eq("skill_id", skillId)
    .eq("user_id", userId)
    .single();

  return { data, error };
}

export async function createEvidence(
  supabase: SupabaseClient,
  skillId: string,
  userId: string,
  evidenceData: EvidenceFormData
) {
  const { data, error } = await supabase
    .from("evidence")
    .insert({
      skill_id: skillId,
      user_id: userId,
      ...evidenceData,
    })
    .select()
    .single();

  if (!error) {
    await supabase
      .from("skills")
      .update({ status: "pending_endorsement" })
      .eq("id", skillId)
      .eq("user_id", userId);
  }

  return { data, error };
}

export async function updateEvidence(
  supabase: SupabaseClient,
  skillId: string,
  userId: string,
  updates: Partial<EvidenceFormData>
) {
  const { data, error } = await supabase
    .from("evidence")
    .update(updates)
    .eq("skill_id", skillId)
    .eq("user_id", userId)
    .select()
    .single();

  return { data, error };
}

export async function deleteEvidence(
  supabase: SupabaseClient,
  skillId: string,
  userId: string
) {
  const { error } = await supabase
    .from("evidence")
    .delete()
    .eq("skill_id", skillId)
    .eq("user_id", userId);

  if (!error) {
    await supabase
      .from("skills")
      .update({ status: "pending_evidence" })
      .eq("id", skillId)
      .eq("user_id", userId);
  }

  return { error };
}
