import { Request, Response } from "express";
import { getCommentsByPostId, createComment, deleteComment } from "../services/comments";

// Obtener comentarios de un post
export async function getCommentsController(req: Request, res: Response) {
  try {
    const { postId } = req.params;
    
    if (!postId) {
      return res.status(400).json({ error: "Post ID es requerido" });
    }

    const comments = await getCommentsByPostId(postId);
    return res.status(200).json(comments);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado al obtener comentarios" });
  }
}

// Crear un nuevo comentario
export async function createCommentController(req: Request, res: Response) {
  try {
    const { postId } = req.params;
    const { userId, content } = req.body;

    if (!postId) {
      return res.status(400).json({ error: "Post ID es requerido" });
    }

    if (!userId) {
      return res.status(400).json({ error: "Usuario no autenticado" });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "El contenido del comentario es requerido" });
    }

    if (content.trim().length > 500) {
      return res.status(400).json({ error: "El comentario no puede exceder 500 caracteres" });
    }

    const comment = await createComment(userId, postId, content);
    return res.status(201).json(comment);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado al crear comentario" });
  }
}

// Eliminar un comentario
export async function deleteCommentController(req: Request, res: Response) {
  try {
    const { commentId } = req.params;
    const { userId } = req.body;

    if (!commentId) {
      return res.status(400).json({ error: "Comment ID es requerido" });
    }

    if (!userId) {
      return res.status(400).json({ error: "Usuario no autenticado" });
    }

    const result = await deleteComment(commentId, userId);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("permiso")) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado" });
  }
}
