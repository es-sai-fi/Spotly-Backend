import { Request, Response } from "express";
import {
  addPost,
  deletePost,
  getPostById,
  getAllPost,
  getAllPostBusiness,
} from "../services/post";
import { getBusinessById } from "../services/business";

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
      .json({ message: "Publicacion creada exitosamente", postData });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado" });
  }
}

export async function deletePostController(req: Request, res: Response) {
  try {
    const postId = req.params.postId;

    const validPost = await getPostById(postId);
    if (!validPost) {
      return res.status(404).json({ error: "Publicacion no encontrada" });
    }

    const result = await deletePost(postId);

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado" });
  }
}

export async function getAllPostBusinessController(req: Request, res: Response) {
  try {
    const businessId = req.params.businessId;

    const validBusiness = await getBusinessById(businessId);
    if (!validBusiness) {
      return res.status(404).json({ message: "No existe el negocio" });
    }

    const postBusiness = await getAllPostBusiness(businessId);
    if (!postBusiness) {
      return res.status(400).json({ error: "Error al obtener publicaciones" });
    }

    return res.status(200).json({
      message: "Publicaciones encontradas",
      data: postBusiness,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado" });
  }
}

export async function getAllPostController(req: Request, res: Response) {
  try {
    const allPost = await getAllPost();
    return res.status(200).json({ data: allPost });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado" });
  }
}
