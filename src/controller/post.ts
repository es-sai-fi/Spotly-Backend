import { Request, Response } from "express";
import { addPost, deletePost, getPostById } from "../services/post";

export async function createPostController(req: Request, res: Response) {
  try {
    const { businessId, content } = req.body;
    const file = req.file;

    if (!businessId) {
      return res.status(400).json({ error: "El negocio es requerido" });
    }

    const postData = await addPost(businessId, content, file);

    if (!postData) {
      return res
        .status(400)
        .json({ error: "No se pudo obtener la información" });
    }
    return res
      .status(200)
      .json({ message: "Post creado exitosamente", postData });
  } catch (error) {
    return res.status(400).json({ error: "No se pudo crear el post" });
  }
}

export async function deletePostController(req: Request, res: Response) {
  try {
    const postId = req.params.postId;

    const validPost = await getPostById(postId);
    if (!validPost) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    const result = deletePost(postId);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: "Error al eliminar post" });
  }
}
