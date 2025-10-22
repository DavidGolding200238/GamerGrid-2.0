import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { registerUser, loginUser, getUserProfile, logoutUser, forgotPassword, resetPassword, verifyEmail } from "./routes/auth.js";
import { authenticateToken } from "./middleware/auth.js";
import gamesRouter from "./routes/games.js";
import newsRouter from "./routes/news.js";
import communitiesRouter from "./routes/communities.js";
import { initializeDatabase, testConnection } from "./config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function createServer() {
  const app = express();
  const isProduction = process.env.NODE_ENV === "production" || Boolean(process.env.AWS_EXECUTION_ENV);

  // Middleware
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  const allowed = [
    "http://gamegrid.co.za.s3-website-us-east-1.amazonaws.com",
    "https://gamegrid.co.za",
    "https://www.gamegrid.co.za",
    "http://gamegrid.co.za",
    "http://www.gamegrid.co.za",
  ];

  app.use(
    cors({
      origin: (origin, cb) =>
        !origin || allowed.includes(origin) ? cb(null, true) : cb(null, false),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Serve static files from uploads directory
  if (!isProduction) {
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
  }

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
    limits: { fileSize: 10 * 1024 * 1024 },
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
    const relativePath = `/uploads/${filename}`;

    try {
      if (isProduction) {
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
        return res.json({
          path: relativePath,
          url: relativePath,
          // provide absolute for debugging/legacy usage
          absoluteUrl: `${s3BaseUrl}/${key}`,
        });
      } else {
        // Save locally
        const uploadDir = path.join(__dirname, '../uploads');
        await fs.mkdir(uploadDir, { recursive: true });
        const filepath = path.join(uploadDir, filename);
        await fs.writeFile(filepath, req.file.buffer);
        // Resolve a safe frontend base URL for dev: either FRONTEND_BASE_URL or inferred from the request host
        const frontendBase = process.env.FRONTEND_BASE_URL || `${req.protocol}://${req.get("host")}`;
        return res.json({
          path: relativePath,
          url: relativePath,
          absoluteUrl: `${frontendBase}${relativePath}`,
        });
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

  // Feature routers
  app.use("/api/games", gamesRouter);
  app.use("/api/news", newsRouter);
  app.use("/api/communities", communitiesRouter);

  // Database utilities (primarily for internal/admin use)
  app.post("/api/init-db", async (_req, res) => {
    try {
      const success = await initializeDatabase();
      if (success) {
        return res.json({ message: "Database initialized successfully" });
      }
      return res.status(500).json({ error: "Failed to initialize database" });
    } catch (error) {
      console.error("Database initialization error:", error);
      return res.status(500).json({ error: "Database initialization error" });
    }
  });

  app.get("/healthz", async (_req, res) => {
    try {
      const ok = await testConnection();
      res.status(ok ? 200 : 500).send(ok ? "ok" : "db down");
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).send("db down");
    }
  });

  return app;
}
