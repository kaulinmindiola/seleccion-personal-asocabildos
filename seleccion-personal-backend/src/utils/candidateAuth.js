import prisma from "../prisma/client.js";

// =============================================
// 🔧 Devuelve true si el usuario tiene al menos 1 vacante activa o finalizada
// (mantiene acceso mientras la vacante no esté cerrada o eliminada)
// =============================================
export const hasOpenOrFinalVacantes = async (usuarioId) => {
  const count = await prisma.postulacion.count({
    where: {
      usuarioId: Number(usuarioId),
      vacante: {
        estado: { in: ["ABIERTA", "FINALIZADA"] }, // 👈 importante
      },
    },
  });
  return count > 0;
};

// =============================================
// 🔧 Devuelve true si el usuario fue contratado en alguna postulación
// =============================================
export const isUserContratado = async (usuarioId) => {
  const count = await prisma.postulacion.count({
    where: {
      usuarioId: Number(usuarioId),
      estado: "CONTRATADO",
    },
  });
  return count > 0;
};

// =============================================
// 🔧 Revoca credenciales temporales solo si todas las vacantes están cerradas
//     y el usuario no fue contratado
// =============================================
export const revokeTempCredentialsIfNoActivePostulations = async (usuarioId) => {
  const tieneVacantesActivas = await hasOpenOrFinalVacantes(usuarioId);

  if (!tieneVacantesActivas) {
    const contratado = await isUserContratado(usuarioId);
    if (!contratado) {
      await prisma.usuario.update({
        where: { id: Number(usuarioId) },
        data: { credencialTemp: false },
      });
      console.log(`🔒 Credenciales temporales revocadas para usuarioId=${usuarioId}`);
    } else {
      console.log(`✅ UsuarioId=${usuarioId} fue contratado, credenciales conservadas`);
    }
  } else {
    console.log(`🟢 UsuarioId=${usuarioId} mantiene acceso: tiene vacantes activas o finalizadas`);
  }
};
