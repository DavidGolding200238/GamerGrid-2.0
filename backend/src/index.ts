import "dotenv/config";
import express from "express";
import cors from "cors";
import { getRandomGames, getTopGames, getGamesByGenre } from "./routes/games";
import { registerUser, loginUser, getUserProfile, logoutUser } from "./routes/auth.js";
import { authenticateToken } from "./middleware/auth.js";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Test API route
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Authentication routes
  app.post("/api/auth/register", registerUser);
  app.post("/api/auth/login", loginUser);
  app.post("/api/auth/logout", logoutUser);
  app.get("/api/auth/profile", authenticateToken, getUserProfile);

  // Games API routes using RAWG
  app.get("/api/games", getGamesByGenre); // This will handle genre parameter
  app.get("/api/games/random", getRandomGames);
  app.get("/api/games/top", getTopGames);

  return app;
}

// Start the server when this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = createServer();
  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
