import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/documentos";

// Si no existe la carpeta, se crea automáticamente
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const name = Date.now() + path.extname(file.originalname);
    cb(null, name);
  },
});

// Permitir solo archivos PDF
const fileFilter = (_req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Solo se permiten archivos PDF"));
};

export const uploadSingle = multer({ storage, fileFilter }).single("cv");
