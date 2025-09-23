import { createServer } from './index.js';
import { testConnection, initializeDatabase } from "./config/database.js";
import gamesRouter from './routes/games.js';



// Main server startup function
async function startServer() {
  // Check if MySQL database is accessible
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('Failed to connect to database. Please check your MySQL configuration.');
    process.exit(1);
  }

  // Create database tables if they don't exist
  await initializeDatabase();

  // Start Express server
  const app = createServer();
  const PORT = process.env.PORT || 3000;

  app.use('/api/games', gamesRouter);

  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoints available at http://localhost:${PORT}/api/`);
  });
}

// Start the application
startServer().catch(console.error);
