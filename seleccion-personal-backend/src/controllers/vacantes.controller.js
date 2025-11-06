import prisma from "../prisma/client.js";

// ================================
// 📌 Crear vacante
// ================================
export const createVacante = async (req, res) => {
  try {
    const { titulo, descripcion, requisitos, area } = req.body;

    if (!titulo || !descripcion) {
      return res.status(400).json({ msg: "Título y descripción son obligatorios" });
    }

    const vacante = await prisma.vacante.create({
      data: {
        titulo,
        descripcion,
        requisitos,
        area,
        estado: "ABIERTA",
      },
    });

    res.status(201).json(vacante);
  } catch (error) {
    res.status(500).json({ msg: "Error al crear vacante", error: error.message });
  }
};

// ================================
// 📌 Listar todas las vacantes
// ================================
export const listVacantes = async (req, res) => {
  try {
    const vacantes = await prisma.vacante.findMany({
      orderBy: { fechaApertura: "desc" },
    });
    res.json(vacantes);
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener vacantes", error: error.message });
  }
};

// ================================
// 📌 Obtener una vacante por ID
// ================================
export const getVacante = async (req, res) => {
  try {
    const { id } = req.params;
    const vacante = await prisma.vacante.findUnique({
      where: { id: parseInt(id) }, // ✅ Convertir string a número
    });

    if (!vacante) return res.status(404).json({ msg: "Vacante no encontrada" });

    res.json(vacante);
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener vacante", error: error.message });
  }
};

// ================================
// 📌 Actualizar vacante
// ================================
export const updateVacante = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const vacante = await prisma.vacante.update({
      where: { id: parseInt(id) },
      data,
    });

    res.json(vacante);
  } catch (error) {
    res.status(500).json({ msg: "Error al actualizar vacante", error: error.message });
  }
};

// ================================
// 📌 Eliminar vacante
// ================================
export const deleteVacante = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.vacante.delete({ where: { id: parseInt(id) } });
    res.json({ msg: "Vacante eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ msg: "Error al eliminar vacante", error: error.message });
  }
};
