import prisma from "../prisma/client.js";
import { vacanteCreateSchema, vacanteUpdateSchema } from "../validators/vacante.validator.js";

/**
 * GET /vacantes
 * Query params:
 *  - page (default 1), limit (default 10)
 *  - search (full text search on titulo + descripcion)
 *  - estado
 *  - area
 *  - publicado (true/false)
 *  - fechaDesde, fechaHasta (ISO dates for fechaPublicacion)
 *  - sortBy (createdAt|fechaPublicacion|titulo), order (asc|desc)
 *  - includeCounts (true/false) -> add _count.postulaciones
 */
export const listVacantes = async (req, res) => {
  try {
    const {
      page = 1, limit = 10, search, estado, area, existe,
      fechaDesde, fechaHasta, sortBy = "creadoEn", order = "desc", includeCounts = "false"
    } = req.query;

    const take = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (Math.max(1, parseInt(page, 10) || 1) - 1) * take;

    // build where
    const where = {};
    if (estado) where.estado = estado;
    if (area) where.area = { equals: area, mode: "insensitive" };
    if (typeof existe !== "undefined") where.existe = existe === "true";
    if (fechaDesde || fechaHasta) {
      where.fechaPublicacion = {};
      if (fechaDesde) where.fechaPublicacion.gte = new Date(fechaDesde);
      if (fechaHasta) where.fechaPublicacion.lte = new Date(fechaHasta);
    }
    if (search) {
      where.OR = [
        { titulo: { contains: String(search), mode: "insensitive" } },
        { descripcion: { contains: String(search), mode: "insensitive" } }
      ];
    }

    // mapping sort fields to DB column names
    const orderBy = {};
    const dir = order.toLowerCase() === "asc" ? "asc" : "desc";
    switch (sortBy) {
      case "titulo": orderBy.titulo = dir; break;
      case "fechaPublicacion": orderBy.fechaPublicacion = dir; break;
      default: orderBy.creadoEn = dir;
    }

    const [total, items] = await Promise.all([
      prisma.vacante.count({ where }),
      prisma.vacante.findMany({
        where,
        orderBy,
        skip,
        take,
        include: includeCounts === "true" ? { _count: { select: { postulaciones: true } } } : undefined
      })
    ]);

    const totalPages = Math.ceil(total / take);

    res.json({
      meta: { total, page: parseInt(page, 10), limit: take, totalPages },
      data: items
    });
  } catch (err) {
    console.error("listVacantes error:", err);
    res.status(500).json({ msg: "Error al listar vacantes", error: err.message });
  }
};


export const getVacante = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ msg: "ID inválido" });

    const vac = await prisma.vacante.findUnique({
      where: { id },
      include: { postulaciones: true, creadoPor: { select: { id: true, nombre: true, correo: true } } }
    });
    if (!vac) return res.status(404).json({ msg: "Vacante no encontrada" });
    res.json(vac);
  } catch (err) {
    console.error("getVacante error:", err);
    res.status(500).json({ msg: "Error al obtener vacante", error: err.message });
  }
};


export const createVacante = async (req, res) => {
  try {
    const { error, value } = vacanteCreateSchema.validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).json({ msg: error.details.map(d => d.message).join(", ") });

    const data = {
      titulo: value.titulo,
      descripcion: value.descripcion || null,
      requisitos: value.requisitos || null,
      area: value.area || null,
      estado: value.estado || "ABIERTA",
      existe: typeof value.existe === "boolean" ? value.existe : true,
      fechaPublicacion: value.fechaPublicacion ? new Date(value.fechaPublicacion) : new Date(),
      fechaCierre: value.fechaCierre ? new Date(value.fechaCierre) : null,
      creadoPorId: req.user?.id || null
    };

    const vac = await prisma.vacante.create({ data });
    res.status(201).json(vac);
  } catch (err) {
    console.error("createVacante error:", err);
    res.status(500).json({ msg: "Error al crear vacante", error: err.message });
  }
};


export const updateVacante = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ msg: "ID inválido" });

    const { error, value } = vacanteUpdateSchema.validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).json({ msg: error.details.map(d => d.message).join(", ") });

    const data = {};
    if (value.titulo) data.titulo = value.titulo;
    if (value.descripcion !== undefined) data.descripcion = value.descripcion;
    if (value.requisitos !== undefined) data.requisitos = value.requisitos;
    if (value.area !== undefined) data.area = value.area;
    if (value.estado) data.estado = value.estado;
    if (typeof value.existe === "boolean") data.existe = value.existe;
    if (value.fechaPublicacion) data.fechaPublicacion = new Date(value.fechaPublicacion);
    if (value.fechaCierre) data.fechaCierre = value.fechaCierre ? new Date(value.fechaCierre) : null;

    const updated = await prisma.vacante.update({
      where: { id },
      data: { ...data, actualizadoEn: new Date() }
    });

    res.json(updated);
  } catch (err) {
    console.error("updateVacante error:", err);
    res.status(500).json({ msg: "Error al actualizar vacante", error: err.message });
  }
};


export const deleteVacante = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ msg: "ID inválido" });

    // Validar rol ADMIN
    if (req.user?.rol !== "ADMIN") {
      return res.status(403).json({ msg: "No autorizado" });
    }

    // Verificar si tiene postulaciones
    const vac = await prisma.vacante.findUnique({
      where: { id },
      include: { postulaciones: true }
    });

    if (!vac) return res.status(404).json({ msg: "Vacante no encontrada" });

    if (vac.postulaciones.length > 0) {
      // Soft-delete
      const soft = await prisma.vacante.update({
        where: { id },
        data: { estado: "ARCHIVADA", actualizadoEn: new Date() }
      });
      return res.json({
        msg: "La vacante tiene postulaciones asociadas y ha sido archivada.",
        vacante: soft
      });
    }

    // Si no tiene postulaciones, eliminar físicamente
    await prisma.vacante.delete({ where: { id } });
    res.json({ msg: "Vacante eliminada correctamente" });

  } catch (err) {
    console.error("deleteVacante error:", err);
    res.status(500).json({ msg: "Error al eliminar vacante", error: err.message });
  }
};

