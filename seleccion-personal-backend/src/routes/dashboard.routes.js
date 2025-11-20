import { Router } from "express";
// ⚠️ ERROR AQUÍ: Descomenta esta línea obligatoriamente
import { authRequired, permit } from "../middlewares/auth.middleware.js"; 

import {
  dashboardKPIs,
  dashboardPorRango,
  dashboardPorArea,
  dashboardPorVacante,
  dashboardTiempoContratacion,
  dashboardPostulaciones
} from "../controllers/dashboard.controller.js";

const router = Router();

// Ahora sí funcionará porque authRequired ya está importado
router.use(authRequired, permit("ADMIN", "RRHH"));

router.get("/kpis", dashboardKPIs);
router.get("/rango", dashboardPorRango);
router.get("/por-area", dashboardPorArea);
router.get("/por-vacante", dashboardPorVacante);
router.get("/tiempo-contratacion", dashboardTiempoContratacion);
router.get("/postulaciones", dashboardPostulaciones);

export default router;