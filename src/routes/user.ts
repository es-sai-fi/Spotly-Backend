import { Router } from "express";
import { 
    registerUser, 
    loginUser, 
    updateAUser,
    deleteUserController,
    changePasswordController,
    getUserByIdController,
} from "../controller/user";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/updateUser/:userId", updateAUser);
router.put("/changePassword/:userId",changePasswordController);
router.delete("/delete/:userId",deleteUserController);
router.get("/:userId",getUserByIdController);

export default router;
