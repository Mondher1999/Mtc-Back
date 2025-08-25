// middlewares/upload.js
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 Created uploads directory:", uploadsDir);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname).toLowerCase();
    const filename = `${uniqueSuffix}${extension || ".dat"}`;
    cb(null, filename);
  },
});

// Accepted mime types
const allowedMimeTypes = [
  // Videos
  "video/mp4",
  "video/avi",
  "video/quicktime", // .mov
  "video/x-msvideo",
  "video/webm",
  "video/ogg",
  "video/3gpp",
  "video/x-ms-wmv",
  "video/x-flv",
  "video/mp2t",

  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/jpg",
];

const allowedExtensions = [
  // Videos
  ".mp4",
  ".avi",
  ".mov",
  ".webm",
  ".ogg",
  ".3gp",
  ".wmv",
  ".flv",
  ".ts",

  // Images
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
];

// Create multer upload instance
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 * 1024, // 10GB max
  },
  fileFilter: function (req, file, cb) {
    const fileExtension = path
      .extname(file.originalname)
      .toLowerCase();

    if (
      allowedMimeTypes.includes(file.mimetype) ||
      allowedExtensions.includes(fileExtension)
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `❌ Invalid file type: ${file.originalname}. Only images and videos are allowed.`
        )
      );
    }
  },
});

// Debug info
console.log("🔧 Upload middleware ready");
console.log("📂 Upload dir:", uploadsDir);

export default upload;
export const uploadUserFiles = upload.fields([
  { name: "receipt", maxCount: 1 },
  { name: "photoId", maxCount: 1 },
]);