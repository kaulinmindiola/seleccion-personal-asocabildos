import prisma from "../prisma/client.js";

// =============================
// 📌 Crear evaluación
// =============================
export const crearEvaluacion = async (req, res) => {
  try {
    const { postulacionId, puntajeTecnico, puntajeActitud, observaciones, estadoFinal } = req.body;
    const evaluadorId = req.user.id;

    // Verificar si la postulación existe
    const postulacion = await prisma.postulacion.findUnique({ where: { id: Number(postulacionId) } });
    if (!postulacion) return res.status(404).json({ msg: "Postulación no encontrada" });

    // Verificar si ya existe una evaluación para esa postulación
    const existente = await prisma.evaluacion.findFirst({ where: { postulacionId: Number(postulacionId) } });
    if (existente) return res.status(400).json({ msg: "Ya existe una evaluación para esta postulación" });

    const evaluacion = await prisma.evaluacion.create({
      data: {
        postulacionId: Number(postulacionId),
        evaluadorId,
        puntajeTecnico: Number(puntajeTecnico),
        puntajeActitud: Number(puntajeActitud),
        observaciones,
        estadoFinal: estadoFinal || "EN_PROCESO",
      },
    });

    res.status(201).json(evaluacion);
  } catch (error) {
    res.status(500).json({ msg: "Error al crear evaluación", error: error.message });
  }
};

// =============================
// 📌 Listar todas las evaluaciones
// =============================
export const listarEvaluaciones = async (_req, res) => {
  try {
    const evaluaciones = await prisma.evaluacion.findMany({
      include: {
        postulacion: {
          include: { usuario: true, vacante: true },
        },
        evaluador: {
          select: { id: true, nombre: true, correo: true },
        },
      },
    });
    res.json(evaluaciones);
  } catch (error) {
    res.status(500).json({ msg: "Error al listar evaluaciones", error: error.message });
  }
};

// =============================
// 📌 Obtener evaluación por postulación
// =============================
export const obtenerPorPostulacion = async (req, res) => {
  try {
    const { postulacionId } = req.params;
    const evaluacion = await prisma.evaluacion.findFirst({
      where: { postulacionId: Number(postulacionId) },
      include: {
        postulacion: { include: { usuario: true, vacante: true } },
        evaluador: true,
      },
    });

    if (!evaluacion) return res.status(404).json({ msg: "Evaluación no encontrada" });
    res.json(evaluacion);
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener evaluación", error: error.message });
  }
};

// =============================
// 📌 Actualizar evaluación
// =============================
export const actualizarEvaluacion = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const evaluacion = await prisma.evaluacion.update({
      where: { id: Number(id) },
      data,
    });

    res.json(evaluacion);
  } catch (error) {
    res.status(500).json({ msg: "Error al actualizar evaluación", error: error.message });
  }
};
