import bcrypt from "bcrypt";
import {
  createUser,
  getUserByEmail,
  getUserByUsername,
  updateUser,
  deleteUser,
  changePassword,
  getUserById,
} from "../services/user";
import { addUsername } from "../services/usernames";
import { generateToken } from "../services/auth";
import { Request, Response } from "express";

export async function registerUser(req: Request, res: Response) {
  try {
    const { email, name, surname, age, password, username } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Falta proporcionar el Email",
      });
    } else if (age === undefined) {
      return res.status(400).json({
        error: "Falta proporcionar la edad",
      });
    } else if (!password) {
      return res.status(400).json({
        error: "Falta proporcionar la contraseña",
      });
    }

    if (!name || !surname) {
      return res.status(400).json({
        error: "Proporcione el nombre completo",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (typeof email !== "string" || !emailRegex.test(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    if (typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Nombre inválido" });
    }

    const ageNum = Number(age);
    if (Number.isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      return res.status(400).json({ error: "Edad inválida" });
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

    const existingEmail = await getUserByEmail(email);
    const existingUsername = await getUserByUsername(username);
    if (existingEmail || existingUsername) {
      return res
        .status(409)
        .json({ error: "El email o nombre de usuario ya está registrado" });
    }

    const usernameData = await addUsername(username);

    const created = await createUser(
      usernameData.id,
      email,
      name,
      surname,
      ageNum,
      passwordStr,
    );
    const safeUser = created
      ? {
        id: created.id,
        email: created.email,
        username_id: created.username_id,
        name: created.name,
        age: created.age,
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

export async function loginUser(req: Request, res: Response) {
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

    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ error: "Contraseña incorrecta" });
    const token = generateToken({
      id: user.id,
      email: user.email,
    });

    return res.status(200).json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        username_id: user.username_id,
        name: user.name,
        email: user.email,
        surname: user.surname,
        age: user.age,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado" });
  }
}

export async function updateAUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const body = req.body;

    const toUpdate: Record<string, unknown> = {};

    if (typeof body.name === "string") toUpdate.name = body.name;
    if (typeof body.surname === "string") toUpdate.surname = body.surname;
    if (typeof body.email === "string") toUpdate.email = body.email;
    if (typeof body.age === "number") toUpdate.age = body.age;

    const updatedUser = await updateUser(userId, toUpdate);

    return res.status(200).json({
      message: "Usuario actualizado exitosamente",
      updatedUser,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado" });
  }
}

export async function deleteUserController(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const validUser = await getUserById(userId);
    if (!validUser) {
      return res.status(404).json({ error: "El usuario no existe" });
    }
    const userDeleted = await deleteUser(userId);
    if (!userDeleted) {
      return res.status(400).json({ error: "No se pudo eliminar el usuario" });
    }
    return res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "Error inesperado" });
  }
}

export async function changePasswordController(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    const { oldPassword, newPassword } = req.body;
    const Password = await getUserById(userId);

    if (!Password) {
      return res.status(400).json({ error: "No se encontró el usuario" });
    }
    if (oldPassword === newPassword) {
      return res.status(400).json({ error: "Las contraseñas son iguales" });
    }

    const actPasword = Password.password;
    const verify = await bcrypt.compare(oldPassword, actPasword);

    if (!verify) {
      return res
        .status(400)
        .json({ error: "La contraseña actual no coincide" });
    }

    const passwordNew = await changePassword(userId, newPassword);

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

export async function getUserByIdController(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    const user = await getUserById(userId);
    if (!user) {
      return res.status(400).json({ error: "No existe el usuario" });
    }
    return res.status(200).json({ message: "Usuario encontrado", user });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado" });
  }
}
