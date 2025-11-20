import { Router } from "express";
import {
  applyToVacante,
  recuperarCredenciales,
  seguimientoUsuario,seguimientoPublico,
  addFeedback
} from "../controllers/postulaciones.controller.js";
import { authRequired, permit } from "../middlewares/auth.middleware.js";
import { uploadSingle } from "../middlewares/upload.middleware.js";

const router = Router();

/**
 * =============================================
 * 📌 POST /api/postulaciones
 * Crear una nueva postulación (pública)
 * =============================================
 */
router.post("/", uploadSingle, applyToVacante);

/**
 * =============================================
 * 📌 POST /api/postulaciones/recuperar-credenciales
 * Permite recuperar las credenciales temporales (público)
 * =============================================
 */
router.post("/recuperar-credenciales", recuperarCredenciales);

/**
 * =============================================
 * 📌 GET /api/postulaciones/seguimiento
 * Permite al postulante ver el estado de su postulación
 * (autenticado y rol POSTULANTE)
 * =============================================
 */
router.get("/seguimiento", authRequired, permit("POSTULANTE"), seguimientoUsuario);

/**
 * =============================================
 * 📌 POST /api/postulaciones/:id/feedback
 * Permite agregar feedback sobre una postulación
 * (roles permitidos: RRHH, ADMIN, JEFE_AREA)
 * =============================================
 */
router.post("/:id/feedback", authRequired, permit("RRHH", "ADMIN", "JEFE_AREA"), addFeedback);

router.post("/seguimiento-publico", seguimientoPublico);


export default router;
