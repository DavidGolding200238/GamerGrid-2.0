import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getRandomGames, getTopGames, getGamesByGenre } from "./routes/games";
import { registerUser, loginUser, getUserProfile, logoutUser } from "./routes/auth";
import { authenticateToken } from "./middleware/auth";
import { db } from "./config/database";

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Test API
  app.get("/api/ping", (_req, res) => res.json({ message: "ping" }));

  // Ensure uploads dir exists
  const uploadDir = path.resolve(__dirname, "../../uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  // Serve uploaded files
  app.use("/uploads", express.static(uploadDir));

  // Multer storage
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
      cb(null, `${base}-${Date.now()}${ext}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (file.mimetype.startsWith("image/")) return cb(null, true);
      cb(new Error("Only image files are allowed"));
    },
  });

  // Upload endpoint (returns URL to store in DB)
  app.post("/api/upload", upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    return res.json({ url: `/uploads/${req.file.filename}` });
  });

  // Auth routes
  app.post("/api/auth/register", registerUser);
  app.post("/api/auth/login", loginUser);
  app.post("/api/auth/logout", logoutUser);
  app.get("/api/auth/profile", authenticateToken, getUserProfile);

  // Games routes
  app.get("/api/games", getGamesByGenre);
  app.get("/api/games/random", getRandomGames);
  app.get("/api/games/top", getTopGames);

  // Communities routes
  app.get("/api/communities", async (_req, res) => {
    try {
      const [rows] = await db.execute(
        "SELECT * FROM communities ORDER BY created_at DESC"
      );
      res.json({ communities: rows });
    } catch (err) {
      console.error("Error fetching communities:", err);
      res.status(500).json({ error: "Failed to fetch communities" });
    }
  });

  app.post("/api/communities", async (req, res) => {
    try {
      const { name, description, category, image_url } = req.body;
      const [result] = await db.execute(
        "INSERT INTO communities (name, description, category, image_url) VALUES (?, ?, ?, ?)",
        [name, description, category, image_url || null]
      ) as any;
      res.status(201).json({ id: result.insertId, message: "Community created" });
    } catch (err) {
      console.error("Error creating community:", err);
      res.status(500).json({ error: "Failed to create community" });
    }
  });

  app.get("/api/communities/:id/posts", async (req, res) => {
    try {
      const [rows] = await db.execute(
        "SELECT * FROM community_posts WHERE community_id = ? ORDER BY created_at DESC",
        [req.params.id]
      );
      res.json({ posts: rows });
    } catch (err) {
      console.error("Error fetching posts:", err);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.post("/api/communities/:id/posts", async (req, res) => {
    try {
      const { title, content, image_url, author } = req.body;
      const [result] = await db.execute(
        "INSERT INTO community_posts (community_id, title, content, image_url, author) VALUES (?, ?, ?, ?, ?)",
        [req.params.id, title, content, image_url || null, author || "Anonymous"]
      ) as any;

      await db.execute(
        "UPDATE communities SET post_count = post_count + 1 WHERE id = ?",
        [req.params.id]
      );

      res.status(201).json({ id: result.insertId, message: "Post created" });
    } catch (err) {
      console.error("Error creating post:", err);
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  return app;
}