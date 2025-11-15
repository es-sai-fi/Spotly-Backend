import { supabase } from "../config/database";
import bcrypt from "bcrypt";

export async function createBusiness(
  username_id: string,
  email: string,
  name: string,
  category: string,
  rating: number | undefined,
  description: string,
  address: string,
  password: string,
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  // Preparar el objeto de inserción sin rating si no se proporciona
  const businessData: any = {
    username_id,
    email,
    name,
    category,
    description,
    address,
    password: hashedPassword,
  };

  // Solo agregar rating si existe en la tabla
  // if (rating !== undefined) {
  //   businessData.rating = rating;
  // }

  const { data, error } = await supabase
    .from("businesses")
    .insert([businessData])
    .select();

  if (error) throw new Error(error.message);
  return data[0];
}

export async function getBusinessByEmail(email: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("email", email);
  if (error) throw new Error(error.message);
  return data[0];
}

export async function getBusinessByUsername(username: string) {
  const { data: usernameData, error: usernameError } = await supabase
    .from("usernames")
    .select("*")
    .eq("username", username);
  if (usernameError) throw new Error(usernameError.message);
  if (!usernameData || usernameData.length === 0) return null;
  const username_id = usernameData[0].id;

  const { data: businessData, error: businessError } = await supabase
    .from("businesses")
    .select("*")
    .eq("username_id", username_id);
  if (businessError) throw new Error(businessError.message);
  return businessData;
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
export async function getBusinessByIdPassword(
  id: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("businesses")
    .select("password")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? data.password : null;
}

export async function editBusiness(
  business_id: string,
  updates: Record<string, unknown>,
) {
  const { data, error } = await supabase
    .from("businesses")
    .update(updates)
    .eq("id", business_id)
    .select()
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data;
}
export async function deleteBusiness(business_id: string) {
  const { data, error } = await supabase
    .from("businesses")
    .delete()
    .eq("id", business_id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) return null;

  const deletedBusiness = data[0];

  if (deletedBusiness.username_id) {
    await supabase
      .from("usernames")
      .delete()
      .eq("id", deletedBusiness.username_id);
  }
  return data[0];
}

export async function changePassword(id: string, newPassword: string) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { data, error } = await supabase
      .from("businesses")
      .update({ password: hashedPassword })
      .eq("id", id)
      .select();
    if (error) throw new Error(error.message);
    return data[0];
  } catch (err) {
    throw new Error((err as Error).message);
  }
}
