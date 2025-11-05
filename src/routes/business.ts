import { Router } from "express";
import { 
    deleteBusinessController, 
    loginBusiness, 
    registerBusiness,
    editBusinessController,
    changePasswordController,
} from "../controller/business";

const router = Router();

router.post("/register", registerBusiness);
router.post("/login", loginBusiness);
router.delete("/delete/:businessId",deleteBusinessController);
router.put("/edit/:businessId",editBusinessController);
router.put("/changePassword/:businessId",changePasswordController)

export default router;
