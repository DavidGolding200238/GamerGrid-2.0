import { createServer } from "./index.js";
import { testConnection, initializeDatabase } from "./config/database.js";

const HOST = "0.0.0.0";
const PORT = Number(process.env.PORT ?? 8080);

async function start() {
  try {
    const connected = await testConnection();
    if (connected) {
      await initializeDatabase();
    } else {
      console.error("Database connection failed; continuing to start server for health checks.");
    }
  } catch (error) {
    console.error("Database initialization error:", error);
  }

  const app = createServer();

  app.listen(PORT, HOST, () => {
    console.log(`Backend listening on http://${HOST}:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to bootstrap server:", error);
  process.exitCode = 1;
});
