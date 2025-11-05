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
    .select();
  if (error) throw new Error(error.message);
  
  return data && data.length > 0 ? data[0] : null;
  }


export async function changePassword(id: string,newPassword: string){
  try{
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { data, error } = await supabase
      .from("users")
      .update({ password: hashedPassword })
      .eq("id", id)
      .select();
    if (error) throw new Error(error.message);
    return data[0];}
  catch(err){
    throw new Error((err as Error).message);
  }
}
