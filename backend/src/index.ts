import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getRandomGames, getTopGames, getGamesByGenre } from "./routes/games.js";
import { registerUser, loginUser, getUserProfile, logoutUser } from "./routes/auth.js";
import { authenticateToken } from "./middleware/auth.js";
import { db } from "./config/database.js";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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

  // Upload endpoint (uploads to S3 and returns URL)
  app.post("/api/upload", upload.single("image"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const ext = path.extname(req.file.originalname);
    const base = path.basename(req.file.originalname, ext).replace(/\s+/g, "_");
    const key = `uploads/${base}-${Date.now()}${ext}`;
    try {
      await s3.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      }));
      return res.json({ url: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${key}` });
    } catch (error) {
      console.error("S3 upload error:", error);
      return res.status(500).json({ error: "Failed to upload file" });
    }
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