/*
  Warnings:

  - Changed the type of `fechaExpedicion` on the `Usuario` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "public"."Usuario_fechaExpedicion_key";

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "fechaExpedicion",
ADD COLUMN     "fechaExpedicion" TIMESTAMP(3) NOT NULL;
