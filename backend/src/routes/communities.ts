import { Router } from "express";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.get("/", async (req, res) => {
     res.json({ communities: [] });
});

router.get("/:id", async (req, res) => {
  res.json({ community: null });
});

router.post("/", requireAuth, async (req, res) => {
  res.status(201).json({ message: "Community created" });
});

router.post("/:id/join", requireAuth, async (req, res) => {
  res.json({ message: "Joined community" });
});

router.delete("/:id/join", requireAuth, async (req, res) => {
  res.json({ message: "Left community" });
});


router.get("/:id/posts", async (req, res) => {
  res.json({ posts: [] });
});

router.post("/:id/posts", requireAuth, async (req, res) => {
  res.status(201).json({ message: "Post created" });
});

router.post("/posts/:postId/like", requireAuth, async (req, res) => {
  res.json({ message: "Post liked" });
});

router.delete("/posts/:postId/like", requireAuth, async (req, res) => {
  res.json({ message: "Post unliked" });
});

export default router;
