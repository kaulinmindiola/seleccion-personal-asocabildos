import { Router } from "express";
import {
  crearEvaluacion,
  listarEvaluaciones,
  obtenerPorPostulacion,
  actualizarEvaluacion,
} from "../controllers/evaluaciones.controller.js";
import { authRequired, permit } from "../middlewares/auth.middleware.js";

const router = Router();

// Crear evaluación (solo RRHH, ADMIN, JEFE_AREA)
router.post("/", authRequired, permit("RRHH", "ADMIN", "JEFE_AREA"), crearEvaluacion);

// Listar todas las evaluaciones
router.get("/", authRequired, permit("RRHH", "ADMIN"), listarEvaluaciones);

// Obtener evaluación por postulación
router.get("/postulacion/:postulacionId", authRequired, permit("RRHH", "ADMIN", "JEFE_AREA"), obtenerPorPostulacion);

// Actualizar evaluación
router.put("/:id", authRequired, permit("RRHH", "ADMIN", "JEFE_AREA"), actualizarEvaluacion);

export default router;
