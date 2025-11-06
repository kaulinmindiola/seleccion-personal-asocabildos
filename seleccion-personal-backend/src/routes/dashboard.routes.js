import { Router } from "express";
import {
  resumenGeneral,
  tendencias,
  rankingCandidatos,
  estadisticasPorArea,
} from "../controllers/dashboard.controller.js";
import { authRequired, permit } from "../middlewares/auth.middleware.js";

const router = Router();

// Todas las rutas del dashboard son privadas y solo accesibles por RRHH o ADMIN
router.get("/resumen", authRequired, permit("RRHH", "ADMIN"), resumenGeneral);
router.get("/tendencias", authRequired, permit("RRHH", "ADMIN"), tendencias);
router.get("/ranking", authRequired, permit("RRHH", "ADMIN"), rankingCandidatos);
router.get("/areas", authRequired, permit("RRHH", "ADMIN"), estadisticasPorArea);

export default router;
