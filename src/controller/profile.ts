import { Request, Response } from "express";
import { getUserProfile, updateUserProfile, getBusinessProfile, updateBusinessProfile } from "../services/profile";

// Obtener perfil de usuario
export async function getProfileController(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID es requerido" });
    }

    const profile = await getUserProfile(userId);
    return res.status(200).json(profile);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado al obtener perfil" });
  }
}

// Actualizar perfil de usuario
export async function updateProfileController(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const updates = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID es requerido" });
    }

    // Validaciones básicas
    if (updates.age && (updates.age < 1 || updates.age > 150)) {
      return res.status(400).json({ error: "Edad inválida" });
    }

    if (updates.email && !updates.email.includes("@")) {
      return res.status(400).json({ error: "Email inválido" });
    }

    if (updates.newPassword && updates.newPassword.length < 6) {
      return res.status(400).json({ error: "La nueva contraseña debe tener al menos 6 caracteres" });
    }

    const updatedProfile = await updateUserProfile(userId, updates);
    return res.status(200).json({
      message: "Perfil actualizado exitosamente",
      profile: updatedProfile
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Contraseña actual incorrecta")) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado al actualizar perfil" });
  }
}

// Obtener perfil de negocio
export async function getBusinessProfileController(req: Request, res: Response) {
  try {
    const { businessId } = req.params;

    if (!businessId) {
      return res.status(400).json({ error: "Business ID es requerido" });
    }

    const profile = await getBusinessProfile(businessId);
    return res.status(200).json(profile);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado al obtener perfil" });
  }
}

// Actualizar perfil de negocio
export async function updateBusinessProfileController(req: Request, res: Response) {
  try {
    const { businessId } = req.params;
    const updates = req.body;

    if (!businessId) {
      return res.status(400).json({ error: "Business ID es requerido" });
    }

    // Validaciones básicas
    if (updates.email && !updates.email.includes("@")) {
      return res.status(400).json({ error: "Email inválido" });
    }

    if (updates.newPassword && updates.newPassword.length < 6) {
      return res.status(400).json({ error: "La nueva contraseña debe tener al menos 6 caracteres" });
    }

    if (updates.name && updates.name.trim().length === 0) {
      return res.status(400).json({ error: "El nombre no puede estar vacío" });
    }

    const updatedProfile = await updateBusinessProfile(businessId, updates);
    return res.status(200).json({
      message: "Perfil actualizado exitosamente",
      profile: updatedProfile
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Contraseña actual incorrecta")) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado al actualizar perfil" });
  }
}
