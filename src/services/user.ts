import { supabase } from "../config/database";
import bcrypt from "bcrypt";

export async function createUser(
  email: string,
  name: string,
  username: string,
  surname: string,
  age: number,
  password: string,
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert([{ email, name, surname, username, age, password: hashedPassword }])
    .select();

  if (error) throw new Error(error.message);
  return data[0];
}

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data; 
}
export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data; 
}

export async function getUserByUsername(username: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data; 
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

export async function deleteUser(user_id:string) {
  const {data , error} = await supabase
    .from("users")
    .delete()
    .eq("id",user_id)

  if (error) throw new Error(error.message);
 
  }


