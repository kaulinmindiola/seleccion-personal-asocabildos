// src/controllers/postulaciones.controller.js
import prisma from "../prisma/client.js";
import bcrypt from "bcryptjs";

import {
  revokeTempCredentialsIfNoActivePostulations
} from "../utils/candidateAuth.js";

// =============================================
// 📌 Funciones auxiliares
// =============================================
const generatePlainPassword = (numeroDocumento, nombre) => {
  if (!nombre || !numeroDocumento) throw new Error("Nombre y número de documento requeridos");
  
  const inicial = nombre.trim()[0].toLowerCase(); // primera letra en minúscula
  return `${numeroDocumento}${inicial}`;
};

const hashPassword = async (plain) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plain, salt);
};

const padDocumentoTo13 = (doc) => doc.toString().padStart(13, "0");

// =============================================
// 📌 POST /api/postulaciones
// Crear una nueva postulación
// =============================================
export const applyToVacante = async (req, res) => {
  try {
    // Si estás recibiendo multipart/form-data (con Multer), usa req.body
    const { vacanteId, experienciaAnos, numeroDocumento, nombre, correo, telefono, fechaExpedicion } = req.body;
    // Validaciones mínimas
    if (!vacanteId || !numeroDocumento || !nombre || !fechaExpedicion) {
      return res.status(400).json({ msg: "vacanteId, numeroDocumento, nombre y fechaExpedicion son obligatorios" });
    }

    // Verificar vacante
    const vacante = await prisma.vacante.findUnique({ where: { id: Number(vacanteId) } });
    if (!vacante) return res.status(404).json({ msg: "Vacante no encontrada" });

    // Buscar usuario por numeroDocumento
    let usuario = await prisma.usuario.findUnique({ where: { numeroDocumento: String(numeroDocumento) } });

    // Parse fechaExpedicion a Date si viene como string ISO
  // 📌 Normalizar la fecha (guardar sin hora)
let fechaExp = null;
if (fechaExpedicion) {
  fechaExp = new Date(fechaExpedicion);
  fechaExp.setHours(0, 0, 0, 0); // <--- elimina la hora
  console.log("inicioDia:", inicioDia);
console.log("finDia:", finDia);
console.log("numeroDocumento:", numeroDocumento);

}


    if (!usuario) {
      // Crear usuario sin credenciales (contrasena null)
      usuario = await prisma.usuario.create({
        data: {
          nombre,
          correo: correo || null,
          contrasena: null,
          rol: "POSTULANTE",
          numeroDocumento: String(numeroDocumento),
          fechaExpedicion: fechaExp,
          credencialTemp: false,
          // telefono si lo tienes en modelo:
        }
      });
    } else {
      // Actualizar datos útiles si vienen (no tocar contrasena)
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          nombre,
          correo: correo || usuario.correo,
          fechaExpedicion: fechaExp || usuario.fechaExpedicion,
          // no tocar contrasena ni credencialTemp
        }
      });
    }

    // Evitar duplicados de postulación: same usuario y vacante
    const yaPostulado = await prisma.postulacion.findFirst({
      where: { usuarioId: usuario.id, vacanteId: Number(vacanteId) }
    });
    if (yaPostulado) {
      return res.status(400).json({ msg: "Ya te has postulado a esta vacante" });
    }

    // Guardar documento si multer lo agregó en req.file (opcional)
    const documentoPath = req.file ? req.file.path : null;

    const postulacion = await prisma.postulacion.create({
      data: {
        usuarioId: usuario.id,
        vacanteId: Number(vacanteId),
        experienciaAnos: experienciaAnos ? Number(experienciaAnos) : null,
        estado: "EN_REVISION",
        fechaPostulacion: new Date(),
        comentarios: null,
        // guarda ruta de documento si tu modelo Documento lo contempla
      }
    });

    // Respuesta simple: no devolver credenciales
    return res.status(201).json({
      msg: "Postulación registrada correctamente",
      postulacion: {
        id: postulacion.id,
        usuarioId: usuario.id,
        vacanteId: postulacion.vacanteId,
        fechaPostulacion: postulacion.fechaPostulacion
      }
    });

  } catch (error) {
    console.error("applyToVacante error:", error);
    return res.status(500).json({ msg: "Error al crear postulación", error: error.message });
  }
};

// =============================================
// 📌 POST /api/postulaciones/recuperar-credenciales
// =============================================
export const recuperarCredenciales = async (req, res) => {
  try {
    const { numeroDocumento, nombre } = req.body;
    if (!numeroDocumento) return res.status(400).json({ msg: "Número de documento requerido" });

    const usuario = await prisma.usuario.findUnique({ where: { numeroDocumento: String(numeroDocumento) }});
    if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado. Por favor completa el formulario de postulación." });

    const activo = await prisma.postulacion.findFirst({
      where: {
        usuarioId: usuario.id,
        vacante: { estado: "ACTIVA" }
      }
    });
    if (!activo) return res.status(403).json({ msg: "No existen postulaciones activas. Debes postular nuevamente a una vacante." });

    // generar nueva password temporal
    const plainPassword = generatePlainPassword(numeroDocumento, nombre || usuario.nombre);
    const hashed = await hashPassword(plainPassword);
    await prisma.usuario.update({ where: { id: usuario.id }, data: { contrasena: hashed, credencialTemp: true } });

    return res.json({ username: padDocumentoTo13(numeroDocumento), password: plainPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error al recuperar credenciales", error: err.message });
  }
};

export const seguimientoPublico = async (req, res) => {
  try {
    const { numeroDocumento, fechaExpedicion } = req.body;
    if (!numeroDocumento || !fechaExpedicion) {
      return res.status(400).json({ msg: "numeroDocumento y fechaExpedicion requeridos" });
    }

    // Normalizar fecha recibida
    const fecha = new Date(fechaExpedicion);
    fecha.setHours(0, 0, 0, 0);

    const siguienteDia = new Date(fecha);
    siguienteDia.setDate(fecha.getDate() + 1);

    // Buscar usuario dentro del rango del día
    const usuario = await prisma.usuario.findFirst({
      where: {
        numeroDocumento: String(numeroDocumento),
        fechaExpedicion: {
          gte: fecha,
          lt: siguienteDia,
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({ msg: "No se encontró un postulante con esos datos" });
    }

    const postulaciones = await prisma.postulacion.findMany({
      where: { usuarioId: usuario.id },
      include: {
        vacante: true,
      },
      orderBy: { fechaPostulacion: "desc" }
    });

    return res.json({
      usuario: { 
        id: usuario.id, 
        nombre: usuario.nombre, 
        numeroDocumento: usuario.numeroDocumento 
      }, 
      postulaciones 
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: err.message });
  }
};



// =============================================
// 📌 GET /api/postulaciones/seguimiento
// =============================================
export const seguimientoUsuario = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const postulaciones = await prisma.postulacion.findMany({
      where: { usuarioId: Number(usuarioId) },
      include: {
        vacante: true,
        documentos: true,
        evaluaciones: true
      },
      orderBy: { fechaPostulacion: 'desc' }
    });
    res.json(postulaciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error al obtener seguimiento", error: err.message });
  }
};

// =============================================
// 📌 POST /api/postulaciones/:id/feedback
// =============================================
// =============================================
// 📌 POST /api/postulaciones/:id/feedback
// =============================================

// =============================================
// 📌 POST /api/postulaciones/:id/feedback
// Guarda feedback en Evaluacion + actualiza Postulacion
// =============================================
export const addFeedback = async (req, res) => {
  try {
    const { id } = req.params; // ID de la postulación
    const { comentario, nuevoEstado, puntajeTecnico, puntajeActitud } = req.body;

    if (!id) return res.status(400).json({ msg: "postulacionId es requerido" });

    // Obtener usuario autenticado (evaluador)
    const evaluadorId = req.user?.id;
    if (!evaluadorId) {
      return res.status(401).json({ msg: "Token inválido o faltante" });
    }

    // Buscar postulación
    const postulacion = await prisma.postulacion.findUnique({
      where: { id: Number(id) },
      include: { usuario: true },
    });

    if (!postulacion)
      return res.status(404).json({ msg: "Postulación no encontrada" });

    // Crear registro en Evaluacion (feedback del evaluador)
    await prisma.evaluacion.create({
      data: {
        postulacionId: Number(id),
        evaluadorId,
        puntajeTecnico: puntajeTecnico ?? null,
        puntajeActitud: puntajeActitud ?? null,
        observaciones: comentario ?? null,
        estadoFinal: nuevoEstado ?? "EN_PROCESO",
      },
    });

    // Actualizar comentario y/o estado en la Postulación
    const updated = await prisma.postulacion.update({
      where: { id: Number(id) },
      data: {
        comentarios: comentario ?? postulacion.comentarios,
        estado: nuevoEstado ?? postulacion.estado,
        ultimaActualizacion: new Date(),
      },
    });

    // Si el estado es final → revocar credenciales si no tiene más postulaciones activas
    if (nuevoEstado && ["RECHAZADO", "FINALIZADO", "CONTRATADO"].includes(nuevoEstado)) {
      await revokeTempCredentialsIfNoActivePostulations(postulacion.usuarioId);
    }

    res.json({
      msg: "Feedback agregado correctamente",
      postulacion: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Error al agregar feedback",
      error: err.message,
    });
  }
};
