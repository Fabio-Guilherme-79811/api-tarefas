import { Request, Response, NextFunction } from "express";

export function logger(req: Request, res: Response, next: NextFunction) {
  const agora = new Date().toISOString();
  console.log(`[${agora}] ${req.method} ${req.url}`);
  next();
}
