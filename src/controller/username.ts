import { getUsernamebyId, updateUsername } from "../services/usernames";
import { Request, Response } from "express";

export async function getUsernamebyIdController(req: Request, res: Response) {
  try {
    const username_id = req.params.username_id;
    const usernameData = await getUsernamebyId(username_id);
    if (!usernameData) {
      return res.status(400).json({ error: "No existe el usuario" });
    }
  } catch (error) {
    return res.status(400).json(error);
  }
}

export async function updateAUsernameById(req: Request, res: Response) {
  try {
    const username_id = req.params.username_id;
    const username = req.body.username;

    const userNameData = await getUsernamebyId(username_id);
    if (userNameData.username == username) {
      return res
        .status(409)
        .json({ error: "El nombre de usuario ya está registrado" });
    }

    const updatedUsername = await updateUsername(username_id, username);
    return res.status(200).json({
      message: "Nombre de usuario actualizado correctamente",
      updatedUsername,
    });
  } catch (error) {
    return res.status(400).json(error);
  }
}
