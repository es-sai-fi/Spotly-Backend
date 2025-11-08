import { Router } from "express";
import multer from "multer";

import { 
    createPostController, 
    deletePostController,
    getAllPostBusinessController,
    getAllPostController } from "../controller/post";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.post("/create", upload.single("image"), createPostController);
router.delete("/delete/:postId", deletePostController);
router.get("getPostBusiness",getAllPostBusinessController);
router.get("/",getAllPostController);
export default router;
