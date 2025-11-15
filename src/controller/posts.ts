import { Request, Response } from "express";
import { getAllPosts, getPostsByBusinessId, getPostById, createPost } from "../services/posts";

// Obtener todos los posts
export async function getAllPostsController(_req: Request, res: Response) {
  try {
    const posts = await getAllPosts();
    return res.status(200).json(posts);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado al obtener posts" });
  }
}

// Obtener posts de un negocio específico
export async function getPostsByBusinessController(req: Request, res: Response) {
  try {
    const { businessId } = req.params;
    
    if (!businessId) {
      return res.status(400).json({ error: "Business ID es requerido" });
    }

    const posts = await getPostsByBusinessId(businessId);
    return res.status(200).json(posts);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado" });
  }
}

// Obtener un post por ID
export async function getPostByIdController(req: Request, res: Response) {
  try {
    const { postId } = req.params;
    
    if (!postId) {
      return res.status(400).json({ error: "Post ID es requerido" });
    }

    const post = await getPostById(postId);
    
    if (!post) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    return res.status(200).json(post);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado" });
  }
}

// Crear un nuevo post
export async function createPostController(req: Request, res: Response) {
  try {
    const { content } = req.body;
    const businessId = (req as any).user?.id; // ID del negocio desde el token JWT
    
    if (!businessId) {
      return res.status(401).json({ error: "No autorizado" });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "El contenido es requerido" });
    }

    const post = await createPost(businessId, content);
    return res.status(201).json({
      message: "Post creado exitosamente",
      post
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado al crear post" });
  }
}
