import { Router } from "express";
import {
  applyToVacante,
  recuperarCredenciales,
  seguimientoUsuario,
  seguimientoPublico,
  addFeedback,
  listPostulaciones,      // <--- FALTABA ESTO
  getPostulacion,         // <--- FALTABA ESTO
  updateEstadoPostulacion // <--- FALTABA ESTO
} from "../controllers/postulaciones.controller.js";
import { authRequired, permit } from "../middlewares/auth.middleware.js";
import { uploadSingle } from "../middlewares/upload.middleware.js"; // Tu middleware corregido

const router = Router();

// =============================================
// 🟢 RUTAS PÚBLICAS
// =============================================

// 1. Postularse (Con subida de archivo 'cv')
router.post("/", uploadSingle, applyToVacante);

// 2. Recuperar credenciales (Si lo usas)
router.post("/recuperar-credenciales", recuperarCredenciales);

// 3. Seguimiento Público (Con Documento + Fecha)
router.post("/seguimiento-publico", seguimientoPublico);


// =============================================
// 🔒 RUTAS PRIVADAS (CANDIDATO LOGUEADO)
// =============================================
router.get("/seguimiento", authRequired, permit("POSTULANTE"), seguimientoUsuario);


// =============================================
// 🛡️ RUTAS ADMINISTRATIVAS (RRHH / ADMIN)
// Estas son las que faltaban para que el Dashboard funcione
// =============================================

// 1. Listar todas (Global o por Vacante)
router.get("/", authRequired, permit("ADMIN", "RRHH"), listPostulaciones);

// 2. Ver detalle de una postulación
router.get("/:id", authRequired, permit("ADMIN", "RRHH"), getPostulacion);

// 3. Cambiar estado (Mover a Entrevista/Contratado)
router.patch("/:id/estado", authRequired, permit("ADMIN", "RRHH"), updateEstadoPostulacion);

// 4. Agregar Feedback/Evaluación
router.post("/:id/feedback", authRequired, permit("RRHH", "ADMIN", "JEFE_AREA"), addFeedback);

export default router;