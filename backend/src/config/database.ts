import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'game_grid_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create connection pool
export const pool = mysql.createPool(dbConfig);

// Test database connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    
    // Test if we can actually query the database
    const [result] = await connection.execute('SELECT DATABASE() as current_db') as any;
    console.log('📋 Current database:', result[0]?.current_db);
    
    // Test if game_grid_db exists
    const [databases] = await connection.execute('SHOW DATABASES LIKE "game_grid_db"') as any;
    console.log('🗄️ game_grid_db exists:', databases.length > 0);
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(100),
        profile_image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create user_games table (for favorites, wishlist, etc.)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_games (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        game_id VARCHAR(50) NOT NULL,
        game_title VARCHAR(255) NOT NULL,
        game_image VARCHAR(500),
        status ENUM('favorite', 'wishlist', 'played', 'playing') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_game_status (user_id, game_id, status)
      )
    `);

    console.log('✅ Database tables initialized successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    return false;
  }
}
