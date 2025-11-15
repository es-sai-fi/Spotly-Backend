import { Router } from "express";
import { 
  getCommentsController,
  createCommentController,
  deleteCommentController
} from "../controller/comments";

const router = Router();

// GET /api/comments/:postId - Obtener todos los comentarios de un post
router.get("/:postId", getCommentsController);

// POST /api/comments/:postId - Crear un nuevo comentario en un post
router.post("/:postId", createCommentController);

// DELETE /api/comments/:commentId - Eliminar un comentario
router.delete("/:commentId", deleteCommentController);

export default router;
