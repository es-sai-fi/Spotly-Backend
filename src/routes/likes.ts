import { Router } from "express";
import { toggleLikeController, getLikesController } from "../controller/likes";

const router = Router();

// POST /api/likes/:postId - Dar o quitar like a un post
router.post("/:postId", toggleLikeController);

// GET /api/likes/:postId - Obtener número de likes de un post
router.get("/:postId", getLikesController);

export default router;
