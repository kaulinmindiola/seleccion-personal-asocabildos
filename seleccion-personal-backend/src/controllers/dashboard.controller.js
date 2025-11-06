import prisma from "../prisma/client.js";

// ================================
// 📊 1. Resumen general
// ================================
export const resumenGeneral = async (_req, res) => {
  try {
    const totalUsuarios = await prisma.usuario.count();
    const totalVacantes = await prisma.vacante.count();
    const totalPostulaciones = await prisma.postulacion.count();
    const totalEvaluaciones = await prisma.evaluacion.count();

    const vacantesAbiertas = await prisma.vacante.count({
      where: { estado: "ABIERTA" },
    });
    const vacantesCerradas = await prisma.vacante.count({
      where: { estado: "CERRADA" },
    });

    const aprobados = await prisma.evaluacion.count({
      where: { estadoFinal: "APROBADO" },
    });
    const rechazados = await prisma.evaluacion.count({
      where: { estadoFinal: "RECHAZADO" },
    });

    res.json({
      usuarios: totalUsuarios,
      vacantes: totalVacantes,
      postulaciones: totalPostulaciones,
      evaluaciones: totalEvaluaciones,
      vacantesAbiertas,
      vacantesCerradas,
      candidatosAprobados: aprobados,
      candidatosRechazados: rechazados,
    });
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener resumen general", error: error.message });
  }
};

// ================================
// 📈 2. Tendencias temporales
// ================================
export const tendencias = async (_req, res) => {
  try {
    // Agrupa vacantes por mes de apertura
    const vacantesPorMes = await prisma.$queryRaw`
      SELECT DATE_TRUNC('month', "fechaApertura") AS mes, COUNT(*)::int AS total
      FROM "Vacante"
      GROUP BY DATE_TRUNC('month', "fechaApertura")
      ORDER BY DATE_TRUNC('month', "fechaApertura");
    `;

    // Agrupa postulaciones por mes
    const postulacionesPorMes = await prisma.$queryRaw`
      SELECT DATE_TRUNC('month', "fechaPostulacion") AS mes, COUNT(*)::int AS total
      FROM "Postulacion"
      GROUP BY DATE_TRUNC('month', "fechaPostulacion")
      ORDER BY DATE_TRUNC('month', "fechaPostulacion");
    `;

    res.json({
      vacantesPorMes,
      postulacionesPorMes,
    });
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener tendencias", error: error.message });
  }
};


// ================================
// 🏆 3. Ranking de candidatos (por puntaje promedio)
// ================================
// ================================
// 🏆 3. Ranking de candidatos (por puntaje promedio)
// ================================
// ================================
// 🏆 3. Ranking de candidatos (por puntaje promedio)
// ================================
export const rankingCandidatos = async (_req, res) => {
  try {
    const resultado = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.nombre,
        u.correo,
        ROUND(AVG((e."puntajeTecnico" + e."puntajeActitud") / 2)) AS promedio,
        COUNT(e.id)::int AS evaluaciones
      FROM "Evaluacion" e
      INNER JOIN "Postulacion" p ON e."postulacionId" = p.id
      INNER JOIN "Usuario" u ON p."usuarioId" = u.id
      GROUP BY u.id, u.nombre, u.correo
      ORDER BY promedio DESC;
    `;

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener ranking de candidatos", error: error.message });
  }
};

// ================================
// 📌 4. Estadísticas por área
// ================================
export const estadisticasPorArea = async (_req, res) => {
  try {
    const data = await prisma.$queryRaw`
      SELECT "area", COUNT(*) AS total, 
      SUM(CASE WHEN "estado" = 'ABIERTA' THEN 1 ELSE 0 END) AS abiertas,
      SUM(CASE WHEN "estado" = 'CERRADA' THEN 1 ELSE 0 END) AS cerradas
      FROM "Vacante"
      GROUP BY "area"
      ORDER BY total DESC;
    `;

    // Convertimos BigInt a Number antes de enviar la respuesta
    const formattedData = data.map(row=> ({
        area: row.area,
        total: Number(row.total),
        abiertas: Number(row.abiertas),
        cerradas: Number(row.cerradas),
    }));

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ 
      msg: "Error al obtener estadísticas por área", 
      error: error.message 
    });
  }
};
