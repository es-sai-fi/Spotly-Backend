import { supabase } from "../config/database";
import bcrypt from "bcrypt";

export async function createBusiness(
  email: string,
  name: string,
  busi_username: string,
  category: string,
  rating: number,
  description: string,
  address: string,
  password: string,
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("businesses")
    .insert([
      {
        email,
        name,
        busi_username,
        category,
        rating,
        description,
        address,
        password: hashedPassword,
      },
    ])
    .select();

  if (error) throw new Error(error.message);
  return data[0];
}

export async function getBusinessByEmail(email: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data; 
}

export async function getBusinessByUsername(busi_username: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("busi_username", busi_username)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data; 
}
export async function getBusinessById(id: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (data) delete data.password;
  return data; 
}
export async function getBusinessByIdPassword(id: string) : Promise<string | null>{
  const { data, error } = await supabase
    .from("businesses")
    .select("password")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? data.password : null;
}


export async function editBusiness(business_id:string,updates: Record<string,unknown>){
  const {data , error} = await supabase
  .from("businesses")
  .update(updates)
  .eq("id",business_id)
  .select()
  .maybeSingle();
  if(error){
    throw new Error(error.message);
  }
  return data;
}
export async function deleteBusiness(business_id:string){
  const {data , error} = await supabase
  .from("businesses")
  .delete()
  .eq("id",business_id)
  .select();
  if (error) { throw new Error(error.message)}
  return data && data.length > 0 ? data[0] : null;
}

export async function changePassword(id: string,newPassword: string){
  try{
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { data, error } = await supabase
      .from("businesses")
      .update({ password: hashedPassword })
      .eq("id", id)
      .select();
    if (error) throw new Error(error.message);
    return data[0];}
  catch(err){
    throw new Error((err as Error).message);
  }
}
