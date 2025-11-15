import { Request, Response } from "express";
import { likePost, unlikePost, getLikesCount } from "../services/likes";

// Toggle like en un post (like/unlike)
export async function toggleLikeController(req: Request, res: Response) {
  try {
    const { postId } = req.params;
    const { userId, action } = req.body; // action: 'like' | 'unlike'

    if (!postId) {
      return res.status(400).json({ error: "Post ID es requerido" });
    }

    if (!userId) {
      return res.status(400).json({ error: "Usuario no autenticado" });
    }

    if (!action || !['like', 'unlike'].includes(action)) {
      return res.status(400).json({ error: "Acción inválida. Usa 'like' o 'unlike'" });
    }

    let result;
    if (action === 'like') {
      result = await likePost(userId, postId);
    } else {
      result = await unlikePost(userId, postId);
    }

    // Obtener el nuevo count de likes
    const likesCount = await getLikesCount(postId);

    return res.status(200).json({
      ...result,
      likes: likesCount
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Ya diste like")) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado" });
  }
}

// Obtener el número de likes de un post
export async function getLikesController(req: Request, res: Response) {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ error: "Post ID es requerido" });
    }

    const likesCount = await getLikesCount(postId);
    return res.status(200).json({ likes: likesCount });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error inesperado" });
  }
}
