import { supabase } from "../config/database";
import bcrypt from "bcrypt";

export async function createUser(
  username_id: string,
  email: string,
  name: string,
  surname: string,
  age: number,
  password: string,
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        username_id,
        email,
        name,
        surname,
        age,
        password: hashedPassword,
      },
    ])
    .select();

  if (error) throw new Error(error.message);

  return data[0];
}

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email);

  if (error) throw new Error(error.message);

  return data[0];
}
export async function getUserById(id: string) {
  const { data, error } = await supabase.from("users").select("*").eq("id", id);

  if (error) throw new Error(error.message);

  return data[0];
}

export async function getUserByUsername(username: string) {
  const { data: usernameData, error: usernameError } = await supabase
    .from("usernames")
    .select("*")
    .eq("username", username);

  if (usernameError) throw new Error(usernameError.message);

  if (!usernameData || usernameData.length === 0) return null;

  const username_id = usernameData[0].id;

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("username_id", username_id);

  if (userError) throw new Error(userError.message);

  return userData;
}

export async function updateUser(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data;
}

export async function deleteUser(user_id: string) {
  const { data, error } = await supabase
    .from("users")
    .delete()
    .eq("id", user_id)
    .select();

  if (error) throw new Error(error.message);

  if (!data || data.length === 0) return null;

  const deletedUser = data[0];

  if (deletedUser.username_id) {
    await supabase.from("usernames").delete().eq("id", deletedUser.username_id);
  }

  return data[0];
}

export async function changeUserPassword(
  userId: string,
  newUserPassword: string,
) {
  try {
    const hashedUserPassword = await bcrypt.hash(newUserPassword, 10);
    const { data, error } = await supabase
      .from("users")
      .update({ password: hashedUserPassword })
      .eq("id", userId)
      .select();

    if (error) throw new Error(error.message);

    return data[0];
  } catch (err) {
    throw new Error((err as Error).message);
  }
}
