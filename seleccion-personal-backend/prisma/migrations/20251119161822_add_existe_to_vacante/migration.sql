/*
  Warnings:

  - You are about to drop the column `fechaApertura` on the `Vacante` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Vacante" DROP COLUMN "fechaApertura",
ADD COLUMN     "actualizadoEn" TIMESTAMP(3),
ADD COLUMN     "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creadoPorId" INTEGER,
ADD COLUMN     "existe" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "fechaPublicacion" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "descripcion" DROP NOT NULL,
ALTER COLUMN "requisitos" DROP NOT NULL,
ALTER COLUMN "area" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Vacante" ADD CONSTRAINT "Vacante_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
