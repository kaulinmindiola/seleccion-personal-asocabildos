import { Router } from "express";
import {
  createVacante,
  listVacantes,
  getVacante,
  updateVacante,
  deleteVacante,
} from "../controllers/vacantes.controller.js";
import { authRequired, permit } from "../middlewares/auth.middleware.js";

const router = Router();

// Crear una nueva vacante (solo RRHH o ADMIN)
router.post("/", authRequired, permit("RRHH", "ADMIN"), createVacante);

// Listar todas las vacantes (público)
router.get("/", listVacantes);

// Obtener una vacante específica (público)
router.get("/:id", getVacante);

// Actualizar vacante (solo RRHH o ADMIN)
router.put("/:id", authRequired, permit("RRHH", "ADMIN"), updateVacante);

// Eliminar vacante (solo RRHH o ADMIN)
router.delete("/:id", authRequired, permit("RRHH", "ADMIN"), deleteVacante);

export default router;
