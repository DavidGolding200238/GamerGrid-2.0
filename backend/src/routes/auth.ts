import { Request, Response } from 'express';
import { createUser, authenticateUser, generateTokens, getUserById } from '../services/authService.js';

// User registration
export async function registerUser(req: Request, res: Response) {
  try {
    const { username, email, password, displayName } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Username, email, and password are required'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      });
    }

    // Create user
    const newUser = await createUser(username, email, password, displayName);

    // Generate tokens
    const { accessToken, user } = generateTokens(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      accessToken
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.message === 'Username or email already exists') {
      return res.status(409).json({
        error: error.message
      });
    }

    res.status(500).json({
      error: 'Internal server error during registration'
    });
  }
}

// User login
export async function loginUser(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required'
      });
    }

    // Authenticate user
    const user = await authenticateUser(username, password);

    if (!user) {
      return res.status(401).json({
        error: 'Invalid username or password'
      });
    }

    // Generate tokens
    const { accessToken, user: userInfo } = generateTokens(user);

    res.json({
      message: 'Login successful',
      user: userInfo,
      accessToken
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error during login'
    });
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
