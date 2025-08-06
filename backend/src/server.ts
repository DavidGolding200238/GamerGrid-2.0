import { createServer } from './index.js';
import { testConnection, initializeDatabase } from "./config/database.js";

async function startServer() {
  // Test database connection
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('Failed to connect to database. Please check your MySQL configuration.');
    process.exit(1);
  }

  // Initialize database tables
  await initializeDatabase();

  // Start the server
  const app = createServer();
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoints available at http://localhost:${PORT}/api/`);
  });
}

startServer().catch(console.error);
