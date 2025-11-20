import Joi from "joi";

// Validación de rango de fechas
export const dashboardRangeSchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().required()
}).required();

// Validación de paginación y filtros
export const dashboardPaginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});
