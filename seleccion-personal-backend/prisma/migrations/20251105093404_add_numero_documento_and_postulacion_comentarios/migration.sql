/*
  Warnings:

  - A unique constraint covering the columns `[numeroDocumento]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Documento" ADD COLUMN     "vacanteId" INTEGER;

-- AlterTable
ALTER TABLE "Postulacion" ADD COLUMN     "comentarios" TEXT,
ADD COLUMN     "ultimaActualizacion" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "numeroDocumento" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_numeroDocumento_key" ON "Usuario"("numeroDocumento");

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_vacanteId_fkey" FOREIGN KEY ("vacanteId") REFERENCES "Vacante"("id") ON DELETE SET NULL ON UPDATE CASCADE;
