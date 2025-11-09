import { getUsernamebyId, updateUsername, getUsernameByName } from "../services/usernames";
import { Request, Response } from "express";

export async function getUsernamebyIdController(req: Request, res: Response) {
  try {
    const username_id = req.params.username_id;
    const usernameData = await getUsernamebyId(username_id);

    if (!usernameData) {
      return res.status(400).json({ error: "No existe el usuario" });
    }

    return res.status(200).json(usernameData);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado" });
  }
}

export async function updateAUsernameById(req: Request, res: Response) {
  try {
    const username_id = req.params.username_id;
    const username = req.body.username;


    const usernameData = await getUsernamebyId(username_id);
    if (!usernameData) {
      return res.status(400).json({ error: "No existe el usuario" });
    }

    const existingUsername = await getUsernameByName(username);
    if (existingUsername && existingUsername.id !== username_id) {
      return res.status(409).json({ error: "El nombre de usuario ya está registrado" });
    }

    if (usernameData.username === username) {
      return res.status(200).json({ message: "El nombre de usuario ya está actualizado" });
    }

    const updatedUsername = await updateUsername(username_id, username);
    return res.status(200).json({
      message: "Nombre de usuario actualizado correctamente",
      updatedUsername,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado" });
  }
}
