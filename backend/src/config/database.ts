import mysql from "mysql2/promise";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const {
  DB_HOST,
  DB_PORT = "3306",
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
} = process.env;

if (!DB_HOST || !DB_NAME || !DB_USER) {
  console.error("[DB] Missing required env vars", {
    DB_HOST: Boolean(DB_HOST),
    DB_NAME: Boolean(DB_NAME),
    DB_USER: Boolean(DB_USER),
  });
  process.exit(1);
}

console.log("[DB] connecting", { host: DB_HOST, user: DB_USER, db: DB_NAME });

const dbConfig = {
  host: DB_HOST,
  port: Number(DB_PORT),
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export const pool = mysql.createPool(dbConfig);
export const db = pool;

export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    console.log("[DB] connection established");
    const [result] = (await connection.execute(
      "SELECT DATABASE() as current_db"
    )) as any;
    console.log("[DB] current database:", result[0]?.current_db);
    connection.release();
    return true;
  } catch (error) {
    console.error("[DB] connection failed:", error);
    return false;
  }
}

export async function initializeDatabase(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(100),
        profile_image VARCHAR(255),
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255),
        reset_token VARCHAR(255),
        reset_expires DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

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

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS communities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        image_url VARCHAR(500),
        banner_image_url VARCHAR(500),
        member_count INT DEFAULT 0,
        post_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS community_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        community_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        image_url VARCHAR(500),
        author VARCHAR(100) DEFAULT 'Anonymous',
        likes_count INT DEFAULT 0,
        comments_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS community_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        community_id INT NOT NULL,
        role ENUM('member', 'admin') DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_community (user_id, community_id)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS community_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        parent_comment_id INT DEFAULT NULL,
        user_id INT,
        content TEXT NOT NULL,
        image_url VARCHAR(500),
        author VARCHAR(100) DEFAULT 'Anonymous',
        likes_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_comment_id) REFERENCES community_comments(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS community_comment_likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        comment_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (comment_id) REFERENCES community_comments(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_comment_like (user_id, comment_id)
      )
    `);

    console.log("[DB] schema initialized");
    connection.release();
    return true;
  } catch (error) {
    console.error("[DB] Failed to initialize database:", error);
    return false;
  }
}
