import prisma from "../prisma/client.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SALT = parseInt(process.env.SALT_ROUNDS || "10");

// ===========================
// 📌 Registro de usuario
// ===========================
export const register = async (req, res) => {
  try {
    const { nombre, correo, contrasena, rol, numeroDocumento } = req.body;

    // 🚫 Bloquear registro directo de postulantes
    if (rol && rol.toUpperCase() === "POSTULANTE") {
      return res.status(403).json({
        msg: "Los postulantes se crean automáticamente al postularse a una vacante.",
      });
    }

    if (!correo || !contrasena || !nombre) {
      return res
        .status(400)
        .json({ msg: "Nombre, correo y contraseña son obligatorios" });
    }

    // Verificar si el correo o número de documento ya existen
    const userExists = await prisma.usuario.findFirst({
      where: {
        OR: [{ correo }, { numeroDocumento: numeroDocumento || "" }],
      },
    });

    if (userExists) {
      return res.status(409).json({ msg: "El usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(contrasena, SALT);

    const user = await prisma.usuario.create({
      data: {
        nombre,
        correo,
        numeroDocumento: numeroDocumento || null,
        contrasena: hashedPassword,
        rol: rol || "ADMIN", // puedes ajustar rol por defecto
      },
    });

    const { contrasena: _p, ...userData } = user;
    res.status(201).json(userData);
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error al registrar usuario", error: error.message });
  }
};

// ===========================
// 📌 Inicio de sesión
// ===========================
console.log(
  "🔐 JWT_SECRET:",
  process.env.JWT_SECRET ? "Cargado" : "NO CARGADO"
);

export const login = async (req, res) => {
  try {
    const { identifier, correo, contrasena, password } = req.body;

    // 🔹 Permitir tanto 'identifier' como 'correo'
    const inputIdentifier = identifier || correo;
    const inputPassword = contrasena || password;

    if (!inputIdentifier || !inputPassword) {
      return res
        .status(400)
        .json({ msg: "Debe proporcionar correo o número de documento y contraseña" });
    }

    // Buscar por correo o número de documento
   // Buscar usuario por correo o número de documento
const user = await prisma.usuario.findFirst({
  where: {
    OR: [
      { correo: inputIdentifier },
      { numeroDocumento: inputIdentifier }
    ]
  }
});

if (!user)
  return res.status(404).json({ msg: "Usuario no encontrado" });

    const valid = await bcrypt.compare(inputPassword, user.contrasena);
    if (!valid) return res.status(401).json({ msg: "Contraseña incorrecta" });

    // Crear token JWT
    const token = jwt.sign(
      { id: user.id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    const { contrasena: _p, ...userData } = user;
    res.json({ token, user: userData });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error al iniciar sesión", error: error.message });
  }
};

// ===========================
// 📌 Obtener usuario autenticado
// ===========================
export const me = async (req, res) => {
  try {
    const { contrasena, ...userData } = req.user;
    res.json(userData);
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error al obtener usuario", error: error.message });
  }
};
