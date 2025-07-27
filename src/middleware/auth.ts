import User  from "../models/User";
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    if (!decoded) {
      res.status(403).json({ error: 'Token expired or invalid' });
      return;
    }

    // Properly await the user lookup
    const userDetails = await User.findById(decoded._id);


    if (!userDetails) {
      res.status(403).json({ error:  userDetails });
      return;
      
    }

    req.user = userDetails;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token expired or invalid' });
    return;
  }
};

export const authorizeRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
};
