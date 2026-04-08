import { SupabaseClient } from "@supabase/supabase-js";
import { SkillFormData, UpdateSkillData } from "@/validations/skill";

export async function getSkillsByUser(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function getSkillById(
  supabase: SupabaseClient,
  skillId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("id", skillId)
    .eq("user_id", userId)
    .single();

  return { data, error };
}

export async function createSkill(
  supabase: SupabaseClient,
  userId: string,
  skillData: SkillFormData
) {
  const { data, error } = await supabase
    .from("skills")
    .insert({
      user_id: userId,
      ...skillData,
    })
    .select()
    .single();

  return { data, error };
}

export async function updateSkill(
  supabase: SupabaseClient,
  skillId: string,
  userId: string,
  updates: UpdateSkillData
) {
  const { data, error } = await supabase
    .from("skills")
    .update(updates)
    .eq("id", skillId)
    .eq("user_id", userId)
    .select()
    .single();

  return { data, error };
}

export async function deleteSkill(
  supabase: SupabaseClient,
  skillId: string,
  userId: string
) {
  const { error } = await supabase
    .from("skills")
    .delete()
    .eq("id", skillId)
    .eq("user_id", userId);

  return { error };
}

export async function updateSkillVisibility(
  supabase: SupabaseClient,
  skillId: string,
  userId: string,
  visibility: "public" | "private"
) {
  const { data, error } = await supabase
    .from("skills")
    .update({ visibility })
    .eq("id", skillId)
    .eq("user_id", userId)
    .select()
    .single();

  return { data, error };
}
