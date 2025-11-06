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
    const { vacanteId, experienciaAnos, numeroDocumento, nombre, correo, telefono } = req.body;
    const documentoPath = req.file ? req.file.path : null;

    if (!vacanteId || !numeroDocumento || !nombre) {
      return res.status(400).json({ msg: "vacanteId, numeroDocumento y nombre son obligatorios" });
    }

    // validar vacante
    const vacante = await prisma.vacante.findUnique({ where: { id: Number(vacanteId) } });
    if (!vacante) return res.status(404).json({ msg: "Vacante no encontrada" });

    const plainPassword = generatePlainPassword(numeroDocumento, nombre);

    let usuario = await prisma.usuario.findUnique({
      where: { numeroDocumento: String(numeroDocumento) }
    });

    if (usuario) {
      // verificar si ya está postulado a esta vacante
      const ya = await prisma.postulacion.findFirst({
        where: { usuarioId: usuario.id, vacanteId: Number(vacanteId) }
      });
      if (ya) return res.status(400).json({ msg: "Ya te postulaste a esta vacante" });

      // regenerar credenciales temporales
      const hashed = await hashPassword(plainPassword);
      usuario = await prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          contrasena: hashed,
          credencialTemp: true,
          correo: correo ?? usuario.correo,
          nombre: nombre ?? usuario.nombre,
          telefono: telefono ?? usuario.telefono,
        },
      });
    } else {
      // crear nuevo usuario postulante
      const hashed = await hashPassword(plainPassword);
      usuario = await prisma.usuario.create({
        data: {
          nombre,
          correo: correo || null,
          contrasena: hashed,
          rol: "POSTULANTE",
          numeroDocumento: String(numeroDocumento),
          credencialTemp: true,
          telefono: telefono || null
        }
      });
    }

    // Crear postulación
    const postulacion = await prisma.postulacion.create({
      data: {
        usuarioId: usuario.id,
        vacanteId: Number(vacanteId),
        experienciaAnos: experienciaAnos ? Number(experienciaAnos) : null,
        estado: "EN_REVISION",
      },
    });

    // Guardar documento si existe
    if (documentoPath) {
      await prisma.documento.create({
        data: {
          urlArchivo: documentoPath,
          tipo: "CV",
          usuarioId: usuario.id,
          postulacionId: postulacion.id,
        },
      });
    }

    res.status(201).json({
      postulacion,
      credentials: {
        numeroDocumento,
        password: plainPassword,
        note: "Estas credenciales son temporales y válidas mientras tengas al menos una postulación activa."
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al crear postulación", error: error.message });
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
