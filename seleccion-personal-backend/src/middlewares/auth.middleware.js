import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'; // Asegúrate de tener dotenv instalado

dotenv.config(); // Cargamos las variables de entorno por seguridad

export const authRequired = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Log para ver qué llega al servidor (DEBUG)
  // console.log("📥 Header recibido:", authHeader); 

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Token no provisto" });
  }

  const token = authHeader.split(' ')[1];

  // Verifica que este log coincida con el secreto usado en auth.controller.js
  // console.log("🔐 Verificando con secreto:", process.env.JWT_SECRET || "secret123");

  jwt.verify(token, process.env.JWT_SECRET || "secret123", (err, user) => {
    if (err) {
        console.error("❌ Error Token:", err.message);
        return res.status(403).json({ message: "Token inválido o expirado" });
    }
    
    req.user = user;
    next();
  });
};

// ... (función permit sigue igual)
export const permit = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ msg: "No autenticado" });
    
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ msg: "No tienes permisos" });
    }
    next();
  };
};