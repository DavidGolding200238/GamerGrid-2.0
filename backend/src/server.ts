import { createServer } from './index.js';
import { testConnection, initializeDatabase, db } from "./config/database";
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

  // COMMUNITY ROUTES
  // Get all communities
  app.get('/api/communities', async (req, res) => {
    try {
      const [rows] = await db.execute('SELECT * FROM communities ORDER BY created_at DESC');
      res.json({ communities: rows });
    } catch (err) {
      console.error('Error fetching communities:', err);
      res.status(500).json({ error: 'Failed to fetch communities' });
    }
  });

  // Create new community
  app.post('/api/communities', async (req, res) => {
    try {
      const { name, description, category, image_url } = req.body;
      const [result] = await db.execute(
        'INSERT INTO communities (name, description, category, image_url) VALUES (?, ?, ?, ?)',
        [name, description, category, image_url]
      ) as any;
      res.json({ id: result.insertId, message: 'Community created successfully' });
    } catch (err) {
      console.error('Error creating community:', err);
      res.status(500).json({ error: 'Failed to create community' });
    }
  });

  // Get posts for a specific community
  app.get('/api/communities/:id/posts', async (req, res) => {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM community_posts WHERE community_id = ? ORDER BY created_at DESC',
        [req.params.id]
      );
      res.json({ posts: rows });
    } catch (err) {
      console.error('Error fetching posts:', err);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  });

  // Create post in community
  app.post('/api/communities/:id/posts', async (req, res) => {
    try {
      const { title, content, image_url, author } = req.body;
      const [result] = await db.execute(
        'INSERT INTO community_posts (community_id, title, content, image_url, author) VALUES (?, ?, ?, ?, ?)',
        [req.params.id, title, content, image_url, author || 'Anonymous']
      ) as any;
      
      // Update community post count
      await db.execute('UPDATE communities SET post_count = post_count + 1 WHERE id = ?', [req.params.id]);
      
      res.json({ id: result.insertId, message: 'Post created successfully' });
    } catch (err) {
      console.error('Error creating post:', err);
      res.status(500).json({ error: 'Failed to create post' });
    }
  });

  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoints available at http://localhost:${PORT}/api/`);
  });
} 

// Start the application
startServer().catch(console.error);




