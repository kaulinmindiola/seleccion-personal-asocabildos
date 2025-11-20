import Joi from "joi";

// campos compartidos
export const vacanteCreateSchema = Joi.object({
  titulo: Joi.string().trim().min(3).max(150).required(),
  descripcion: Joi.string().allow("", null).max(5000),
  requisitos: Joi.string().allow("", null).max(5000),
  area: Joi.string().trim().max(100).allow("", null),
  estado: Joi.string().valid("ABIERTA","CERRADA","PAUSADA","ARCHIVADA").optional(),
  publicado: Joi.boolean().optional(),
  fechaPublicacion: Joi.date().iso().optional().allow(null),
  fechaCierre: Joi.date().iso().optional().allow(null)
});

export const vacanteUpdateSchema = Joi.object({
  titulo: Joi.string().trim().min(3).max(150).optional(),
  descripcion: Joi.string().allow("", null).max(5000).optional(),
  requisitos: Joi.string().allow("", null).max(5000).optional(),
  area: Joi.string().trim().max(100).optional(),
  estado: Joi.string().valid("ABIERTA","CERRADA","PAUSADA","ARCHIVADA").optional(),
  publicado: Joi.boolean().optional(),
  fechaPublicacion: Joi.date().iso().optional().allow(null),
  fechaCierre: Joi.date().iso().optional().allow(null)
});
