import { createServer } from './index.js';
import { testConnection, initializeDatabase } from "./config/database.js";
import gamesRouter from './routes/games.js';
import newsRouter from './routes/news.js';
import communitiesRouter from './routes/communities.js';
import { registerUser, loginUser, getUserProfile, logoutUser } from './routes/auth.js';
import { authenticateToken } from './middleware/auth.js'; 

// Main server startup function
async function startServer() {
  // Check if MySQL database is accessible
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('Failed to connect to database. Please check your MySQL configuration.');
    // Note: Not exiting to keep service alive for health checks
  } else {
    // Create database tables if they don't exist
    await initializeDatabase();
  }

  // Start Express server
  const app = createServer();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use('/api/games', gamesRouter);
  app.use('/api/news', newsRouter);
  app.use('/api', communitiesRouter);

  // Auth routes
  app.post('/api/auth/register', registerUser);
  app.post('/api/auth/login', loginUser);
  app.get('/api/auth/profile', authenticateToken, getUserProfile);
  app.post('/api/auth/logout', logoutUser);

  // Database initialization route (for debugging)
  app.post('/api/init-db', async (_req, res) => {
    try {
      const success = await initializeDatabase();
      if (success) {
        res.json({ message: 'Database initialized successfully' });
      } else {
        res.status(500).json({ error: 'Failed to initialize database' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Database initialization error' });
    }
  });

    // Health check endpoint
  app.get('/healthz', async (_req, res) => {
    try {
      const ok = await testConnection();
      res.status(ok ? 200 : 500).send(ok ? 'ok' : 'db down');
    } catch {
      res.status(500).send('db down');
    }
  });

  app.listen(parseInt(process.env.PORT || '3000', 10), '0.0.0.0', () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoints available at http://localhost:${PORT}/api/`);
  });
} 

// Start the application
startServer().catch(console.error);




