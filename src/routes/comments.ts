import express from "express";
import {
  getCommentsByPostController,
  getAllCommentsController,
  addCommentController,
  updateCommentController,
  deleteCommentController,
} from "../controller/comments";

const router = express.Router();

router.get("/getCommentsPost/", getCommentsByPostController);
router.get("/allComments", getAllCommentsController);
router.post("/insertComment/:userId", addCommentController);
router.put("/updateComment/:commentId", updateCommentController);
router.delete("/deleteComment/:commentId", deleteCommentController);

export default router;
