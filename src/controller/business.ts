import bcrypt from "bcrypt";
import { generateToken } from "../services/auth";
import {
  createBusiness,
  getBusinessByEmail,
  getBusinessByUsername,
  deleteBusiness,
  editBusiness,
  getBusinessById,
  getBusinessByIdPassword,
  businessRatingById,
  changePassword,
} from "../services/business";
import { addUsername } from "../services/usernames";
import { Request, Response } from "express";
import validator from "validator";

export async function registerBusiness(req: Request, res: Response) {
  try {
    const { email, name, username, category, description, address, password } =
      req.body;

    if (!email || !name || !username || !category || !password) {
      return res.status(400).json({
        error:
          "Faltan datos necesarios: nombre, correo, nombre de usuario, categoría, contraseña",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    if (typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Nombre inválido" });
    }

    if (typeof category !== "string" || category.trim().length === 0) {
      return res.status(400).json({ error: "Categoría inválida" });
    }

    if (typeof username !== "string" || username.trim().length === 0) {
      return res.status(400).json({ error: "Nombre de usuario inválido" });
    }

    const passwordStr =
      typeof password === "string"
        ? password
        : typeof password === "number"
          ? String(password)
          : null;

    if (!passwordStr || passwordStr.length < 8) {
      return res
        .status(400)
        .json({ error: "La contraseña debe tener al menos 8 caracteres" });
    }

    const hasLetter = /[a-zA-Z]/.test(passwordStr);
    const hasNumber = /\d/.test(passwordStr);

    if (!hasLetter || !hasNumber) {
      return res.status(400).json({
        error: "La contraseña debe contener al menos una letra y un número",
      });
    }

    const existingEmail = await getBusinessByEmail(email);
    const existingUsername = await getBusinessByUsername(username);
    if (existingEmail || existingUsername) {
      return res
        .status(409)
        .json({ error: "El email o nombre de usuario ya está registrado" });
    }

    const usernameData = await addUsername(username);

    const created = await createBusiness(
      usernameData.id,
      email,
      name,
      category,
      description,
      address,
      passwordStr,
    );
    const safeUser = created
      ? {
        id: created.id,
        name: created.name,
        username_id: created.username_id,
        email: created.email,
        category: created.category,
        description: created.description,
        address: created.address,
      }
      : null;
    return res.status(201).json(safeUser);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado" });
  }
}

export async function loginBusiness(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email)
      return res
        .status(400)
        .json({ error: "El email no ha sido proporcionado" });
    if (!password) {
      return res
        .status(400)
        .json({ error: "La contraseña no ha sido proporcionada" });
    }

    const business = await getBusinessByEmail(email);
    if (!business)
      return res.status(404).json({ error: "Negocio no encontrado" });

    const validPassword = await bcrypt.compare(password, business.password);
    if (!validPassword)
      return res.status(400).json({ error: "Contraseña incorrecta" });
    const token = generateToken({
      id: business.id,
      email: business.email,
    });

    return res.status(200).json({
      message: "Login exitoso",
      token,
      user: {
        id: business.id,
        username_id: business.username_id,
        name: business.name,
        email: business.email,
        category: business.category,
        rating: business.rating,
        description: business.description,
        address: business.address,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado" });
  }
}

export async function editBusinessController(req: Request, res: Response) {
  try {
    const businessId = req.params.businessId;
    const body = req.body;
    const toUpdate: Record<string, unknown> = {};

    if (typeof body.name === "string") toUpdate.name = body.name;
    if (typeof body.description === "string")
      toUpdate.description = body.description;
    if (typeof body.email === "string") toUpdate.email = body.email;
    if (typeof body.address === "string") toUpdate.address = body.address;

    const editedBusiness = await editBusiness(businessId, toUpdate);
    if (!editedBusiness) {
      return res
        .status(400)
        .json({ error: "Hubo un error editando la información" });
    }
    return res
      .status(200)
      .json({ message: "Información editada exitosamente", toUpdate });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado" });
  }
}

export async function deleteBusinessController(req: Request, res: Response) {
  try {
    const businessId = req.params.businessId;
    const validBusinessId = await getBusinessById(businessId);

    if (!validBusinessId) {
      return res.status(404).json({ error: "No existe el negocio" });
    }
    const businessDeleted = await deleteBusiness(businessId);
    if (!businessDeleted) {
      return res.status(400).json({ error: "No se pudo eliminar el negocio" });
    }
    return res.status(200).json({ message: "Negocio eliminado exitosamente" });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado" });
  }
}

export async function changePasswordController(req: Request, res: Response) {
  try {
    const businessId = req.params.businessId;
    const { oldPassword, newPassword } = req.body;
    const Password = await getBusinessByIdPassword(businessId);

    if (!Password) {
      return res.status(404).json({ error: "Negocio no encontrado" });
    }
    const verify = await bcrypt.compare(oldPassword, Password);
    if (!verify) {
      return res.status(400).json({ error: "La contraseña actual no coincide" });
    }
    if (oldPassword === newPassword) {
      return res.status(400).json({ error: "Las contraseñas son iguales" });
    }
    const passwordNew = await changePassword(businessId, newPassword);

    if (!passwordNew) {
      return res.status(400).json({ error: "Error al cambiar la contraseña" });
    }
    return res
      .status(200)
      .json({ message: "Contraseña Actualizada exitosamente" });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado" });
  }
}

export async function getBusinessRatingById(req: Request, res: Response) {
  try {
    const businessId = req.params.businessId;
    const business = await getBusinessById(businessId);

    if (!businessId) {
      return res.status(404).json({ error: "El id no fue proporcionado." });
    }

    if (!business) {
      return res.status(404).json({ error: "Negocio no encontrado" });
    }

    const ratingData = await businessRatingById(businessId);
    if (!ratingData) {
      return res.status(400).json({ error: "Error al mostrar el rating" });
    }

    return res.status(200).json(ratingData);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado" });
  }
}
