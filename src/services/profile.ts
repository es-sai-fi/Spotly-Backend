import { supabase } from "../config/database";
import bcrypt from "bcrypt";

// Obtener perfil de usuario por ID
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select(`
      id,
      email,
      name,
      surname,
      age,
      username_id,
      created_at
    `)
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error en getUserProfile:", error);
    throw new Error(`Error al obtener perfil: ${error.message}`);
  }

  return data;
}

// Actualizar perfil de usuario
export async function updateUserProfile(
  userId: string,
  updates: {
    name?: string;
    surname?: string;
    age?: number;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }
) {
  // Si se quiere cambiar la contraseña, verificar la actual primero
  if (updates.newPassword) {
    if (!updates.currentPassword) {
      throw new Error("Debes proporcionar la contraseña actual para cambiarla");
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("password")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      throw new Error("Usuario no encontrado");
    }

    const validPassword = await bcrypt.compare(updates.currentPassword, user.password);
    if (!validPassword) {
      throw new Error("Contraseña actual incorrecta");
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(updates.newPassword, 10);
    
    const { error: passwordError } = await supabase
      .from("users")
      .update({ password: hashedPassword })
      .eq("id", userId);

    if (passwordError) {
      console.error("Error al actualizar contraseña:", passwordError);
      throw new Error(`Error al actualizar contraseña: ${passwordError.message}`);
    }
  }

  // Actualizar otros campos (excluir password de updates)
  const { currentPassword, newPassword, ...profileUpdates } = updates;
  
  if (Object.keys(profileUpdates).length > 0) {
    const { error: updateError } = await supabase
      .from("users")
      .update(profileUpdates)
      .eq("id", userId);

    if (updateError) {
      console.error("Error al actualizar perfil:", updateError);
      throw new Error(`Error al actualizar perfil: ${updateError.message}`);
    }
  }

  // Obtener el perfil actualizado
  return await getUserProfile(userId);
}

// Obtener perfil de negocio por ID
export async function getBusinessProfile(businessId: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select(`
      id,
      email,
      name,
      category,
      description,
      address,
      username_id,
      created_at
    `)
    .eq("id", businessId)
    .single();

  if (error) {
    console.error("Error en getBusinessProfile:", error);
    throw new Error(`Error al obtener perfil: ${error.message}`);
  }

  return data;
}

// Actualizar perfil de negocio
export async function updateBusinessProfile(
  businessId: string,
  updates: {
    name?: string;
    category?: string;
    description?: string;
    address?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }
) {
  // Si se quiere cambiar la contraseña, verificar la actual primero
  if (updates.newPassword) {
    if (!updates.currentPassword) {
      throw new Error("Debes proporcionar la contraseña actual para cambiarla");
    }

    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("password")
      .eq("id", businessId)
      .single();

    if (businessError || !business) {
      throw new Error("Negocio no encontrado");
    }

    const validPassword = await bcrypt.compare(updates.currentPassword, business.password);
    if (!validPassword) {
      throw new Error("Contraseña actual incorrecta");
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(updates.newPassword, 10);
    
    const { error: passwordError } = await supabase
      .from("businesses")
      .update({ password: hashedPassword })
      .eq("id", businessId);

    if (passwordError) {
      console.error("Error al actualizar contraseña:", passwordError);
      throw new Error(`Error al actualizar contraseña: ${passwordError.message}`);
    }
  }

  // Actualizar otros campos (excluir password de updates)
  const { currentPassword, newPassword, ...profileUpdates } = updates;
  
  if (Object.keys(profileUpdates).length > 0) {
    const { error: updateError } = await supabase
      .from("businesses")
      .update(profileUpdates)
      .eq("id", businessId);

    if (updateError) {
      console.error("Error al actualizar perfil:", updateError);
      throw new Error(`Error al actualizar perfil: ${updateError.message}`);
    }
  }

  // Obtener el perfil actualizado
  return await getBusinessProfile(businessId);
}
