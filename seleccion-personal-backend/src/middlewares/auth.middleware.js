import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";

export const authRequired = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ msg: "Token no proporcionado" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.usuario.findUnique({ where: { id: decoded.id } });

    if (!user) return res.status(401).json({ msg: "Usuario no encontrado" });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ msg: "Token inválido o expirado" });
  }
};

export const permit = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ msg: "No autenticado" });
    if (!roles.includes(req.user.rol)) return res.status(403).json({ msg: "Acceso denegado" });
    next();
  };
};
