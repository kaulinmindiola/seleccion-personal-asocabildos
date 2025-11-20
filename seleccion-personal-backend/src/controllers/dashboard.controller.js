import prisma from "../prisma/client.js";
import { dashboardRangeSchema, dashboardPaginationSchema } from "../validators/dashboard.validator.js";

// 3.1 KPI globales
export const dashboardKPIs = async (req, res) => {
  try {
    const totalVacantes = await prisma.vacante.count();
    const vacantesAbiertas = await prisma.vacante.count({ where: { estado: "ABIERTA" } });
    const totalPostulaciones = await prisma.postulacion.count();
    const totalUsuarios = await prisma.usuario.count();

    const promedioPostulacionesPorVacante =
      totalVacantes > 0 ? totalPostulaciones / totalVacantes : 0;

    res.json({
      totalVacantes,
      vacantesAbiertas,
      totalPostulaciones,
      totalUsuarios,
      promedioPostulacionesPorVacante: Number(promedioPostulacionesPorVacante.toFixed(2))
    });
  } catch (err) {
    console.error("dashboardKPIs error:", err);
    res.status(500).json({ msg: "Error al obtener KPIs", error: err.message });
  }
};

// 3.2 Estadísticas por rango de fechas
export const dashboardPorRango = async (req, res) => {
  try {
    const { error, value } = dashboardRangeSchema.validate(req.query);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    const { startDate, endDate } = value;

    const vacantes = await prisma.vacante.count({
      where: { creadoEn: { gte: startDate, lte: endDate } }
    });

    const postulaciones = await prisma.postulacion.count({
      where: { fechaPostulacion: { gte: startDate, lte: endDate } }
    });

    res.json({
      rango: { startDate, endDate },
      vacantes,
      postulaciones
    });
  } catch (err) {
    console.error("dashboardPorRango error:", err);
    res.status(500).json({ msg: "Error al obtener estadísticas", error: err.message });
  }
};

// 3.3 Postulaciones por área
export const dashboardPorArea = async (req, res) => {
  try {
    // Primero agrupamos por vacante
    const grupos = await prisma.postulacion.groupBy({
      by: ["vacanteId"],
      _count: { id: true }
    });

    // Sacamos las vacantes y sus áreas
    const vacantes = await prisma.vacante.findMany({
      where: { id: { in: grupos.map(g => g.vacanteId) } },
      select: { id: true, area: true }
    });

    // Unimos datos
    const result = grupos.map(g => {
      const v = vacantes.find(x => x.id === g.vacanteId);
      return {
        area: v?.area ?? "Sin área",
        postulaciones: g._count.id
      };
    });

    res.json(result);

  } catch (err) {
    console.error("dashboardPorArea error:", err);
    res.status(500).json({ msg: "Error al agrupar por área", error: err.message });
  }
};


// 3.4 Postulaciones por vacante
export const dashboardPorVacante = async (req, res) => {
  try {
    const grupos = await prisma.postulacion.groupBy({
      by: ["vacanteId"],
      _count: { id: true }
    });

    const vacantes = await prisma.vacante.findMany({
      where: { id: { in: grupos.map(g => g.vacanteId) } },
      select: { id: true, titulo: true }
    });

    const result = grupos.map(g => {
      const v = vacantes.find(x => x.id === g.vacanteId);
      return {
        vacanteId: g.vacanteId,
        titulo: v?.titulo || "Vacante eliminada",
        postulaciones: g._count.id
      };
    });

    res.json(result);
  } catch (err) {
    console.error("dashboardPorVacante error:", err);
    res.status(500).json({ msg: "Error en agrupación por vacante", error: err.message });
  }
};

// 3.5 Tiempo promedio de contratación
export const dashboardTiempoContratacion = async (req, res) => {
  try {
    const registros = await prisma.postulacion.findMany({
      where: { estado: "CONTRATADO" },
      select: {
        fechaPostulacion: true,
        ultimaActualizacion: true
      }
    });

    if (registros.length === 0)
      return res.json({ promedioDias: 0 });

    let sumaDias = 0;

    registros.forEach(r => {
      if (!r.ultimaActualizacion) return; // evita valores null
      const diff = (new Date(r.ultimaActualizacion) - new Date(r.fechaPostulacion)) / (1000 * 60 * 60 * 24);
      sumaDias += diff;
    });

    const promedio = sumaDias / registros.length;

    res.json({ promedioDias: Number(promedio.toFixed(2)) });

  } catch (err) {
    console.error("dashboardTiempoContratacion error:", err);
    res.status(500).json({ msg: "Error tiempo de contratación", error: err.message });
  }
};


// 3.6 Listado de postulaciones con filtros + paginación
export const dashboardPostulaciones = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      area,
      vacanteId,
      estado,
      search,
      fechaDesde,
      fechaHasta,
      sortBy = "fechaPostulacion",
      order = "desc"
    } = req.query;

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const where = {};

    if (area) {
      where.vacante = { area };
    }

    if (vacanteId)
      where.vacanteId = Number(vacanteId);

    if (estado)
      where.estado = estado;

    if (fechaDesde || fechaHasta) {
      where.fechaPostulacion = {};
      if (fechaDesde) where.fechaPostulacion.gte = new Date(fechaDesde);
      if (fechaHasta) where.fechaPostulacion.lte = new Date(fechaHasta);
    }

    if (search) {
      where.OR = [
        { usuario: { nombre: { contains: search, mode: "insensitive" } } },
        { usuario: { correo: { contains: search, mode: "insensitive" } } },
        { usuario: { numeroDocumento: { contains: search, mode: "insensitive" } } },
      ];
    }

    const orderBy = {};
    orderBy[sortBy] = order.toLowerCase() === "asc" ? "asc" : "desc";

    const [total, data] = await Promise.all([
      prisma.postulacion.count({ where }),
      prisma.postulacion.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          usuario: { select: { nombre: true, correo: true, numeroDocumento: true } },
          vacante: { select: { id: true, titulo: true, area: true } }
        }
      })
    ]);

    res.json({
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / take)
      },
      data
    });

  } catch (err) {
    console.error("dashboardPostulaciones error:", err);
    res.status(500).json({ msg: "Error al listar postulaciones", error: err.message });
  }
};

