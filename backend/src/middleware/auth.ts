import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService.js';


// Extend Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: number;
      user?: any;
    }
  }
}

// Middleware to authenticate JWT tokens
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log('Auth middleware - URL:', req.url);
  console.log('Auth middleware - authHeader:', authHeader);
  console.log('Auth middleware - token present:', !!token);

  if (!token) {
    console.log('Auth middleware - no token, returning 401');
    return res.status(401).json({
      error: 'Access token required'
    });
  }

  try {
    const decoded = verifyToken(token);
    console.log('Auth middleware - decoded:', decoded);
    req.userId = decoded.userId;
    req.user = decoded;
    console.log('Auth middleware - success, userId:', req.userId);
    next();
  } catch (error) {
    console.log('Auth middleware - token verification failed:', error instanceof Error ? error.message : error);
    return res.status(403).json({
      error: 'Invalid or expired token'
    });
  }
}

// Optional authentication middleware (doesn't fail if no token)
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = verifyToken(token);
      req.userId = decoded.userId;
      req.user = decoded;
    } catch (error) {
      // Token is invalid but we don't fail the request
      console.warn('Invalid token provided:', error);
    }
  }

  next();
}


