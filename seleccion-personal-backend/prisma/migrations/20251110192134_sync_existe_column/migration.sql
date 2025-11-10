/*
  Warnings:

  - A unique constraint covering the columns `[fechaExpedicion]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fechaExpedicion` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "fechaExpedicion" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_fechaExpedicion_key" ON "Usuario"("fechaExpedicion");
