import { Router } from "express";
import {
  getUsernamebyIdController,
  updateAUsernameById,
} from "../controller/username";

const router = Router();

router.get("/:username_id", getUsernamebyIdController);
router.put("/updateUsername/:username_id", updateAUsernameById);

export default router;
