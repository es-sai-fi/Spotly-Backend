import { Request, Response } from "express";
import {
  getCommentsByPost,
  getAllComments,
  addComment,
  updateComment,
  deleteComment,
} from "../services/comments";
import { getUserById } from "../services/user";
import { getPostById } from "../services/post"; 


export async function getCommentsByPostController(req: Request, res: Response) {
  try {
    const { postId } = req.body;

    const validPost = await getPostById(postId);
    if (!validPost) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    const comments = await getCommentsByPost(postId);
    if (!comments) {
      return res
        .status(400)
        .json({ error: "No se pudo obtener los comentarios" });
    }

    return res.status(200).json({ message: "Comentarios obtenidos", comments });
  } catch (err: any) {
    return res.status(400).json({ error:"Error al obtener comentarios" });
  }
}


export async function getAllCommentsController(req: Request, res: Response) {
  try {
    const comments = await getAllComments();
    return res.status(200).json({ comments });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}


export async function addCommentController(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    const { postId, content } = req.body;

    const validUser = await getUserById(userId);
    if (!validUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const validPost = await getPostById(postId);
    if (!validPost) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    const comment = await addComment(userId, postId, content);
    if (!comment) {
      return res.status(400).json({ error: "Error al agregar comentario" });
    }

    return res
      .status(200)
      .json({ message: "Comentario agregado exitosamente", comment });
  } catch (err: any) {
    return res.status(400).json({ error:"Error al agregar comentario" });
  }
}


export async function updateCommentController(req: Request, res: Response) {
  try {
    const commentId = req.params.commentId;
    const { content } = req.body;

    const updated = await updateComment(commentId, content);
    if (!updated) {
      return res.status(400).json({ error: "Error al actualizar comentario" });
    }

    return res
      .status(200)
      .json({ message: "Comentario actualizado exitosamente", updated });
  } catch (err: any) {
    return res.status(400).json({ error:"Error al actualizar comentario" });
  }
}


export async function deleteCommentController(req: Request, res: Response) {
  try {
    const commentId = req.params.commentId;

    const deleted = await deleteComment(commentId);
    if (!deleted) {
      return res.status(400).json({ error: "No se pudo eliminar el comentario" });
    }

    return res.status(200).json({ message: "Comentario eliminado correctamente" });
  } catch (err: any) {
    return res.status(400).json({ error: "Error al eliminar comentario" });
  }
}
