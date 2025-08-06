import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

// TypeScript interfaces for type safety
export interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
  profile_image?: string;
  created_at: Date;
}

export interface AuthTokens {
  accessToken: string;
  user: User;
}

// Hash password using bcrypt for security
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // Strong hashing rounds
  return await bcrypt.hash(password, saltRounds);
}

// Verify password against stored hash
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Generate JWT token for user authentication
export function generateTokens(user: User): AuthTokens {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  const payload = {
    userId: user.id, 
    username: user.username,
    email: user.email 
  };

  const accessToken = jwt.sign(
    payload,
    secret as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );

  return {
    accessToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      display_name: user.display_name,
      profile_image: user.profile_image,
      created_at: user.created_at
    }
  };
}

// Verify JWT token
export function verifyToken(token: string) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    return jwt.verify(token, secret) as any;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Create new user
export async function createUser(username: string, email: string, password: string, displayName?: string) {
  const connection = await pool.getConnection();
  
  try {
    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    ) as any;

    if (existingUsers.length > 0) {
      throw new Error('Username or email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert new user
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password_hash, display_name) VALUES (?, ?, ?, ?)',
      [username, email, passwordHash, displayName || username]
    ) as any;

    // Get the created user
    const [newUser] = await connection.execute(
      'SELECT id, username, email, display_name, profile_image, created_at FROM users WHERE id = ?',
      [result.insertId]
    ) as any;

    return newUser[0] as User;
  } finally {
    connection.release();
  }
}

// Authenticate user
export async function authenticateUser(usernameOrEmail: string, password: string): Promise<User | null> {
  const connection = await pool.getConnection();
  
  try {
    const [users] = await connection.execute(
      'SELECT id, username, email, password_hash, display_name, profile_image, created_at FROM users WHERE username = ? OR email = ?',
      [usernameOrEmail, usernameOrEmail]
    ) as any;

    if (users.length === 0) {
      return null;
    }

    const user = users[0];
    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      return null;
    }

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  } finally {
    connection.release();
  }
}

// Get user by ID
export async function getUserById(userId: number): Promise<User | null> {
  const connection = await pool.getConnection();
  
  try {
    const [users] = await connection.execute(
      'SELECT id, username, email, display_name, profile_image, created_at FROM users WHERE id = ?',
      [userId]
    ) as any;

    return users.length > 0 ? users[0] as User : null;
  } finally {
    connection.release();
  }
}
