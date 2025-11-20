import { Router } from "express";
import {
  listVacantes,
  getVacante,
  createVacante,
  updateVacante,
  deleteVacante
} from "../controllers/vacantes.controller.js";
import { authRequired, permit } from "../middlewares/auth.middleware.js";

const router = Router();

// Público: listar vacantes públicas / filtros
router.get("/", listVacantes);

// Obtener detalle de vacante (público)
router.get("/:id", getVacante);

// Rutas protegidas: admin/rrhh
router.post("/", authRequired, permit("ADMIN"), createVacante);
router.put("/:id", authRequired, permit("ADMIN"), updateVacante);
router.patch("/:id", authRequired, permit("ADMIN"), updateVacante);
router.delete("/:id", authRequired, permit("ADMIN"), deleteVacante);

export default router;
