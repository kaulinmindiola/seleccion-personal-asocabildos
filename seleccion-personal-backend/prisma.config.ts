// prisma.config.ts
import { defineConfig, env } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "prisma/schema.prisma", // ruta a tu schema
  migrations: {
    path: "prisma/migrations",    // ruta a tus migraciones
  },
  engine: "classic",              // puedes dejar "classic" o cambiar a "binary" si quieres
  datasource: {
    url: env("DATABASE_URL"),     // toma DATABASE_URL desde tu .env
  },
});
