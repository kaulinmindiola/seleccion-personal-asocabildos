import prisma from "../prisma/client.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* ============================================================
   REGISTER (Crear usuario)
   ============================================================ */
export const register = async (req, res) => {
  try {
    const { 
      nombre,
      correo,
      contrasena,
      rol,
      credencialTemp,
      numeroDocumento,
      fechaExpedicion
    } = req.body;

    // Validación de campos requeridos
    if (
      !nombre ||
      !correo ||
      !contrasena ||
      !rol ||
      !numeroDocumento
    ) {
      return res.status(400).json({ msg: "Todos los campos obligatorios no fueron enviados" });
    }

    // Verificar si ya existe
    const existingUser = await prisma.usuario.findUnique({
      where: { numeroDocumento: String(numeroDocumento) },
    });

    if (existingUser) {
      return res.status(409).json({ msg: "El usuario ya existe" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Crear usuario
    const newUser = await prisma.usuario.create({
      data: {
        nombre,
        correo,
        contrasena: hashedPassword,
        rol,
        credencialTemp,
        numeroDocumento: String(numeroDocumento),
        fechaExpedicion: new Date(fechaExpedicion),
      },
    });

    const { contrasena: _, ...data } = newUser;

    return res.status(201).json({ msg: "Usuario creado", user: data });

  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ msg: "Error en registro", error: error.message });
  }
};


/* ============================================================
   LOGIN
   ============================================================ */
export const login = async (req, res) => {
  try {
    const { numeroDocumento, password } = req.body;

    if (!numeroDocumento || !password) {
      return res.status(400).json({ msg: "numeroDocumento y password obligatorios" });
    }

    const user = await prisma.usuario.findUnique({
      where: { numeroDocumento: String(numeroDocumento) }
    });

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // Solo ADMIN y RRHH pueden entrar
    if (!["ADMIN", "RRHH"].includes(user.rol)) {
      return res.status(403).json({ msg: "No autorizado para iniciar sesión" });
    }

    const validPassword = await bcrypt.compare(password, user.contrasena);

    if (!validPassword) {
      return res.status(401).json({ msg: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user.id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    const { contrasena, ...data } = user;

    return res.json({ token, user: data });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ msg: "Error en login", error: error.message });
  }
};

/* ============================================================
   ME (Usuario autenticado)
   ============================================================ */
export const me = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo datos del usuario" });
  }
};
