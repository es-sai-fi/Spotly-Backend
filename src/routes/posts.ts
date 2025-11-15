import { Router } from "express";
import { 
  getAllPostsController,
  getPostsByBusinessController,
  getPostByIdController,
  createPostController
} from "../controller/posts";
import { authenticateToken } from "../middlewares/user";

const router = Router();

// GET /api/posts - Obtener todos los posts
router.get("/", getAllPostsController);

// GET /api/posts/business/:businessId - Obtener posts de un negocio específico
router.get("/business/:businessId", getPostsByBusinessController);

// GET /api/posts/:postId - Obtener un post específico
router.get("/:postId", getPostByIdController);

// POST /api/posts - Crear un nuevo post (solo para negocios autenticados)
router.post("/", authenticateToken, createPostController);

export default router;
