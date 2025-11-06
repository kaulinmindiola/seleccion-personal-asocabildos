import { Router } from "express";
import { register, login, me } from "../controllers/auth.controller.js";
import { authRequired } from "../middlewares/auth.middleware.js";

const router = Router();

// Rutas públicas
router.post("/register", register);
router.post("/login", login);

// Ruta privada (requiere token)
router.get("/me", authRequired, me);

export default router;
