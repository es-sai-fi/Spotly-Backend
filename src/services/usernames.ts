import { supabase } from "../config/database";

export async function addUsername(username: string) {
  const { data, error } = await supabase
    .from("usernames")
    .insert([{ username: username }])
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  return data;
}

export async function getUsernamebyId(username_id: string) {
  const { data, error } = await supabase
    .from("usernames")
    .select("*")
    .eq("id", username_id)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data;
}

export async function getUsernameByName(username: string) {
  const { data, error } = await supabase
    .from("usernames")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data;
}

export async function updateUsername(username_id: string, username: string) {
  const { data, error } = await supabase
    .from("usernames")
    .update({ username: username })
    .eq("id", username_id)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data;
}
