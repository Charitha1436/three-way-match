import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Missing Bearer Token' });
  }

  const token = authHeader.split(' ')[1];
  const expectedToken = process.env.STATIC_AUTH_TOKEN || 'supersecrettoken123';

  if (token !== expectedToken) {
    return res.status(403).json({ message: 'Forbidden: Invalid Token' });
  }

  next();
};
