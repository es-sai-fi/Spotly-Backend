import { Router } from "express";
import {
  getReviewsBusinessByIdController,
  upsertRatingBusinessController,
  upsertReviewBusinessController,
  getAllReviewsBusinessController,
  deleteReviewBusinessController,
} from "../controller/reviews";

const router = Router();

router.get("/getReviews/", getReviewsBusinessByIdController);
router.post("/insertReview/:userId", upsertReviewBusinessController);
router.post("/insertRating/:userId", upsertRatingBusinessController);
router.delete("/delete/:userId", deleteReviewBusinessController);
router.get("", getAllReviewsBusinessController);

export default router;
