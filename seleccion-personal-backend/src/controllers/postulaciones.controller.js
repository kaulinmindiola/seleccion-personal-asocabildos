import prisma from "../prisma/client.js";

// =====================================================================
// 1. CREAR POSTULACIÓN (PÚBLICA) - applyToVacante
// =====================================================================
export const applyToVacante = async (req, res) => {
  try {
    console.log("📩 Recibiendo postulación...");
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { vacanteId, experienciaAnos, numeroDocumento, nombre, correo, telefono, fechaExpedicion } = req.body;

    // Validaciones
    if (!vacanteId || !numeroDocumento || !nombre || !fechaExpedicion) {
      return res.status(400).json({ msg: "Faltan datos obligatorios (vacanteId, documento, nombre, fecha)" });
    }
    
    // Validación de archivo (CV)
    if (!req.file) {
      return res.status(400).json({ msg: "El archivo CV es obligatorio" });
    }

    // Parsear Fecha (evita horas)
    let fechaExp = new Date(fechaExpedicion);
    if (isNaN(fechaExp.getTime())) return res.status(400).json({ msg: "Fecha inválida" });
    
    // Normalizar fecha (YYYY-MM-DD)
    fechaExp.setHours(0,0,0,0);

    // 1. Buscar o Crear Usuario
    let usuario = await prisma.usuario.findUnique({ where: { numeroDocumento: String(numeroDocumento) } });

    if (!usuario) {
      usuario = await prisma.usuario.create({
        data: {
          nombre,
          correo: correo || null,
          numeroDocumento: String(numeroDocumento),
          fechaExpedicion: fechaExp,
          telefono: telefono || null,
          rol: "POSTULANTE",
          contrasena: null, // Sin acceso al panel admin
          activo: true
        }
      });
    } else {
      // Actualizar datos de contacto si ya existía
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { nombre, correo, telefono, fechaExpedicion: fechaExp }
      });
    }

    // 2. Verificar duplicados (Mismo usuario a misma vacante)
    const yaPostulado = await prisma.postulacion.findFirst({
      where: { usuarioId: usuario.id, vacanteId: Number(vacanteId) }
    });
    
    if (yaPostulado) {
      return res.status(400).json({ msg: "Ya te has postulado a esta vacante previamente." });
    }

    // 3. Crear Postulación
    const postulacion = await prisma.postulacion.create({
      data: {
        usuarioId: usuario.id,
        vacanteId: Number(vacanteId),
        experienciaAnos: experienciaAnos ? Number(experienciaAnos) : 0,
        estado: "EN_REVISION",
        fechaPostulacion: new Date()
      }
    });

    // 4. Guardar Documento
    await prisma.documento.create({
      data: {
        usuarioId: usuario.id,
        postulacionId: postulacion.id,
        vacanteId: Number(vacanteId),
        tipo: "CV", 
        urlArchivo: req.file.path // Multer guarda aquí la ruta
      }
    });

    return res.status(201).json({
      msg: "Postulación registrada correctamente",
      postulacionId: postulacion.id
    });

  } catch (error) {
    console.error("Error applyToVacante:", error);
    return res.status(500).json({ msg: "Error interno del servidor", error: error.message });
  }
};

// =====================================================================
// 2. LISTAR POSTULACIONES (ADMIN/RRHH) - listPostulaciones
// =====================================================================
export const listPostulaciones = async (req, res) => {
  try {
    const { page = 1, limit = 10, vacanteId, estado, search, sortBy = "fechaPostulacion", order = "desc" } = req.query;
    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const where = {};
    if (vacanteId) where.vacanteId = Number(vacanteId);
    if (estado) where.estado = estado;
    
    // Buscador inteligente
    if (search) {
      where.OR = [
        { usuario: { nombre: { contains: search, mode: "insensitive" } } },
        { usuario: { numeroDocumento: { contains: search, mode: "insensitive" } } },
        { vacante: { titulo: { contains: search, mode: "insensitive" } } }
      ];
    }

    const [total, items] = await Promise.all([
      prisma.postulacion.count({ where }),
      prisma.postulacion.findMany({
        where, take, skip, orderBy: { [sortBy]: order },
        include: {
          documentos: true, // CRÍTICO: Para ver el CV en el Admin
          usuario: { select: { id: true, nombre: true, correo: true, numeroDocumento: true, telefono: true } },
          vacante: { select: { id: true, titulo: true, area: true } }
        }
      })
    ]);

    res.json({ meta: { total, page: Number(page), limit: take }, data: items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error listando postulaciones" });
  }
};

// =====================================================================
// 3. ACTUALIZAR ESTADO (ADMIN/RRHH) - updateEstadoPostulacion
// =====================================================================
export const updateEstadoPostulacion = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { estado, comentarios } = req.body; 
    
    const actualizado = await prisma.postulacion.update({
      where: { id },
      data: { estado, comentarios, ultimaActualizacion: new Date() }
    });
    
    res.json({ msg: "Estado actualizado", data: actualizado });
  } catch (error) {
    res.status(500).json({ msg: "Error al actualizar estado" });
  }
};

// =====================================================================
// 4. DETALLE / OBTENER UNA (ADMIN/RRHH)
// =====================================================================
export const getPostulacion = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = await prisma.postulacion.findUnique({
      where: { id },
      include: { usuario: true, vacante: true, documentos: true, evaluaciones: true }
    });
    if (!data) return res.status(404).json({ msg: "No encontrada" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ msg: "Error del servidor" });
  }
};

// =====================================================================
// 5. SEGUIMIENTO PÚBLICO (CANDIDATO) - seguimientoPublico
// =====================================================================
export const seguimientoPublico = async (req, res) => {
  try {
    const { numeroDocumento, fechaExpedicion } = req.body;
    
    // 1. Validar usuario
    const usuario = await prisma.usuario.findUnique({ where: { numeroDocumento: String(numeroDocumento) } });
    if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado" });
    
    // 2. Validar fecha
    const fechaInput = new Date(fechaExpedicion).toISOString().split('T')[0];
    const fechaUser = new Date(usuario.fechaExpedicion).toISOString().split('T')[0];

    if (fechaInput !== fechaUser) return res.status(404).json({ msg: "La fecha de expedición no coincide." });

    // 3. Retornar postulaciones
    const postulaciones = await prisma.postulacion.findMany({
      where: { usuarioId: usuario.id },
      include: { vacante: true },
      orderBy: { fechaPostulacion: 'desc' }
    });

    res.json({ usuario: { id: usuario.id, nombre: usuario.nombre }, postulaciones });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// =====================================================================
// 6. FEEDBACK / EVALUACIÓN (RRHH) - addFeedback
// =====================================================================
export const addFeedback = async (req, res) => {
  // Esta función es opcional si ya estás usando evaluaciones.controller.js
  // Pero si tus rutas apuntan aquí, mantenla.
  res.json({ msg: "Usa el endpoint de Evaluaciones" });
};

export const recuperarCredenciales = async (req, res) => { /* ... */ };
export const seguimientoUsuario = async (req, res) => { /* ... */ };