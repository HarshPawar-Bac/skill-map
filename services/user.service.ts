import { SupabaseClient } from "@supabase/supabase-js";

export async function getUserProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  return { data, error };
}

export async function updateUserProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: Record<string, unknown>,
) {
  const { data, error } = await supabase
    .from("users")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();

  return { data, error };
}

export async function checkUserNameAvailable(
  supabase: SupabaseClient,
  username: string,
  excludeUserId: string,
) {
  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .neq("id", excludeUserId)
    .maybeSingle();

  return !data;
}
