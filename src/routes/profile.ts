import { Router } from "express";
import { 
  getProfileController, 
  updateProfileController,
  getBusinessProfileController,
  updateBusinessProfileController
} from "../controller/profile";

const router = Router();

// GET /api/profile/:userId - Obtener perfil de usuario
router.get("/:userId", getProfileController);

// PUT /api/profile/:userId - Actualizar perfil de usuario
router.put("/:userId", updateProfileController);

// GET /api/profile/business/:businessId - Obtener perfil de negocio
router.get("/business/:businessId", getBusinessProfileController);

// PUT /api/profile/business/:businessId - Actualizar perfil de negocio
router.put("/business/:businessId", updateBusinessProfileController);

export default router;
