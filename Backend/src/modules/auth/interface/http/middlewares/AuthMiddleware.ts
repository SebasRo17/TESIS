import type { Request, Response, NextFunction } from "express";
import type { TokenService } from "../../../domain/AuthPorts";
import { AppError } from "../../../../../core/errors/AppError";
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export function createAuthMiddleware(tokenService: TokenService) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          error: "Token no proporcionado",
        });
        return;
      }

      const token = authHeader.substring(7); // Remover "Bearer "

      try {
        const decoded = tokenService.verifyAccess(token);
        req.user = decoded;
        next();
      } catch (error) {
        res.status(401).json({
          error: "Token inválido o expirado",
        });
      }
    } catch (error) {
      res.status(500).json({
        error: "Error en autenticación",
      });
    }
  };
}