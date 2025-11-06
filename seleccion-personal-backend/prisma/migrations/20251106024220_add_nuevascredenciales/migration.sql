-- AlterTable
ALTER TABLE "Evaluacion" ALTER COLUMN "puntajeTecnico" DROP NOT NULL,
ALTER COLUMN "puntajeActitud" DROP NOT NULL,
ALTER COLUMN "estadoFinal" DROP NOT NULL,
ALTER COLUMN "fechaEvaluacion" DROP NOT NULL;
