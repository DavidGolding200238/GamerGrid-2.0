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

  if (!token) {
    return res.status(401).json({
      error: 'Access token required'
    });
  }

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    req.user = decoded;
    next();
  } catch (error) {
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
