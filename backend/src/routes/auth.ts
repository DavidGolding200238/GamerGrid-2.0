import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { generateTokens, getUserById, User } from '../services/authService.js';
import { sendResetEmail } from '../services/emailService.js';
import { db } from '../config/database.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { toRelativeUploadPath } from '../utils/uploads.js';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const logSqlError = (route: string, error: any) => {
  if (!error) return;
  console.error({
    route,
    code: error.code,
    sqlMessage: error.sqlMessage,
  });
};

// User registration
export async function registerUser(req: Request, res: Response) {
  const { username, email, password, displayName } = req.body ?? {};

  if (!isNonEmptyString(username) || !isNonEmptyString(email) || !isNonEmptyString(password)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password.trim(), 12);
    const preferredDisplayName =
      isNonEmptyString(displayName) ? displayName.trim() : username.trim();

    const [result] = await db.execute<ResultSetHeader>(
      `
        INSERT INTO users (username, email, password_hash, display_name)
        VALUES (?, ?, ?, ?)
      `,
      [username.trim(), email.trim(), hashedPassword, preferredDisplayName]
    );

    const userId = result.insertId;
    const user = await getUserById(userId);

    if (!user) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    const { accessToken, user: userPayload } = generateTokens(user);

    return res.status(201).json({
      message: 'User registered successfully',
      user: userPayload,
      accessToken,
    });
  } catch (error: any) {
    logSqlError('registerUser', error);

    if (error?.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    if (error?.code === 'ER_BAD_NULL_ERROR') {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}

// User login
export async function loginUser(req: Request, res: Response) {
  const { username, email, password } = req.body ?? {};

  const identifier = isNonEmptyString(username)
    ? username.trim()
    : isNonEmptyString(email)
    ? email.trim()
    : null;

  if (!identifier || !isNonEmptyString(password)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      `
        SELECT id, username, email, password_hash, display_name, profile_image, created_at
        FROM users
        WHERE username = ? OR email = ?
        LIMIT 1
      `,
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userRow = rows[0] as RowDataPacket & {
      id: number;
      username: string;
      email: string;
      password_hash?: string | null;
      display_name: string;
      profile_image?: string | null;
      created_at: Date | string;
    };

    if (!userRow.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const matches = await bcrypt.compare(password.trim(), userRow.password_hash);

    if (!matches) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const sanitizedUser: User = {
      id: userRow.id,
      username: userRow.username,
      email: userRow.email,
      display_name: userRow.display_name,
      profile_image: toRelativeUploadPath(userRow.profile_image) ?? undefined,
      created_at:
        userRow.created_at instanceof Date
          ? userRow.created_at
          : new Date(userRow.created_at),
    };

    const { accessToken, user: userInfo } = generateTokens(sanitizedUser);

    return res.status(200).json({
      message: 'Login successful',
      user: userInfo,
      accessToken,
    });
  } catch (error) {
    logSqlError('loginUser', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Get user profile (requires authentication)
export async function getUserProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).userId; // This will be set by auth middleware

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      user
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}

// Logout (optional - for token blacklisting)
export async function logoutUser(_req: Request, res: Response) {
  // In a simple JWT setup, logout is handled client-side by removing the token
  // For more security, you could implement token blacklisting here
  res.json({
    message: 'Logged out successfully'
  });
}

// Forgot password - send reset email
export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required'
      });
    }

    // Check if user exists
    const [rows] = await db.execute(
      'SELECT id, username FROM users WHERE email = ?',
      [email]
    );

    if ((rows as any[]).length === 0) {
      // Don't reveal if email exists or not for security
      return res.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    const user = (rows as any[])[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in database
    await db.execute(
      'UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?',
      [resetToken, resetExpires, user.id]
    );

    // Send reset email
    await sendResetEmail(email, resetToken);

    res.json({
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}

// Reset password with token
export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Token and new password are required'
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      });
    }

    // Find user with valid reset token
    const [rows] = await db.execute(
      'SELECT id FROM users WHERE reset_token = ? AND reset_expires > NOW()',
      [token]
    );

    if ((rows as any[]).length === 0) {
      return res.status(400).json({
        error: 'Invalid or expired reset token'
      });
    }

    const user = (rows as any[])[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await db.execute(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.json({
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}

// Verify email with token
export async function verifyEmail(req: Request, res: Response) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Verification token is required'
      });
    }

    // Find user with verification token
    const [rows] = await db.execute(
      'SELECT id, email FROM users WHERE verification_token = ?',
      [token]
    );

    if ((rows as any[]).length === 0) {
      return res.status(400).json({
        error: 'Invalid verification token'
      });
    }

    const user = (rows as any[])[0];

    // Mark email as verified and clear token
    await db.execute(
      'UPDATE users SET email_verified = TRUE, verification_token = NULL WHERE id = ?',
      [user.id]
    );

    res.json({
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}
