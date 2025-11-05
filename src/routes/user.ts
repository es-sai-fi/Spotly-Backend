import { Router } from "express";
import { 
    registerUser, 
    loginUser, 
    updateAUser,
    deleteUserController,
} from "../controller/user";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/updateUser/:userId", updateAUser);

router.delete("/delete/:userId",deleteUserController);


export default router;
