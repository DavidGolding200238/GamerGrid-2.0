import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getRandomGames, getTopGames, getGamesByGenre } from "./routes/games.js";
import { registerUser, loginUser, getUserProfile, logoutUser, forgotPassword, resetPassword, verifyEmail } from "./routes/auth.js";
import { authenticateToken } from "./middleware/auth.js";
import fs from "fs/promises";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // Root route
  app.get('/', (_req, res) => {
    res.status(200).send('GamerGrid backend is running');
  });

  // Test API
  app.get("/api/ping", (_req, res) => res.json({ message: "ping" }));

  // Multer storage (memory for S3 upload)
  const storage = multer.memoryStorage();

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (file.mimetype.startsWith("image/")) return cb(null, true);
      cb(new Error("Only image files are allowed"));
    },
  });

  // S3 client
  const s3 = new S3Client({ region: process.env.AWS_REGION });

  // Upload endpoint (uploads to S3 in production, local in dev)
  app.post("/api/upload", upload.single("image"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const ext = path.extname(req.file.originalname);
    const base = path.basename(req.file.originalname, ext).replace(/\s+/g, "_");
    const filename = `${base}-${Date.now()}${ext}`;

    try {
      if (process.env.NODE_ENV === 'production') {
        // Upload to S3
        const key = `uploads/${filename}`;
        await s3.send(new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        }));
        // Use S3_BASE_URL env if set, else default to AWS S3 public URL
        const s3BaseUrl = process.env.S3_BASE_URL || `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com`;
        return res.json({ url: `${s3BaseUrl}/${key}` });
      } else {
        // Save locally
        const uploadDir = path.join(__dirname, '../uploads');
        await fs.mkdir(uploadDir, { recursive: true });
        const filepath = path.join(uploadDir, filename);
        await fs.writeFile(filepath, req.file.buffer);
  // Resolve a safe frontend base URL for dev: either FRONTEND_BASE_URL or inferred from the request host
  const frontendBase = process.env.FRONTEND_BASE_URL || `${req.protocol}://${req.get('host')}`;
  return res.json({ url: `${frontendBase}/uploads/${filename}` });
      }
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // Auth routes
  app.post("/api/auth/register", registerUser);
  app.post("/api/auth/login", loginUser);
  app.post("/api/auth/logout", logoutUser);
  app.get("/api/auth/profile", authenticateToken, getUserProfile);
  app.post("/api/auth/forgot-password", forgotPassword);
  app.post("/api/auth/reset-password", resetPassword);
  app.post("/api/auth/verify-email", verifyEmail);

  // Games routes
  app.get("/api/games", getGamesByGenre);
  app.get("/api/games/random", getRandomGames);
  app.get("/api/games/top", getTopGames);

  return app;
}