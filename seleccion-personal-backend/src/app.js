import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import vacantesRoutes from "./routes/vacantes.routes.js";
import postulacionesRoutes from "./routes/postulaciones.routes.js";
import evaluacionesRoutes from "./routes/evaluaciones.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";




dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));



app.use("/api/auth", authRoutes);
app.use("/api/vacantes", vacantesRoutes);
app.use("/api/postulaciones", postulacionesRoutes);
app.use("/api/evaluaciones", evaluacionesRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Ruta de prueba
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Servidor funcionando correctamente" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
