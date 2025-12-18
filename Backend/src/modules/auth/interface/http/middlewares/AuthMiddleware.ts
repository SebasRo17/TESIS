import type { Request, Response, NextFunction } from "express";
import type { TokenService } from "../../../domain/AuthPorts";
import { prisma } from "../../../../../infra/db/prisma";
import { AppError } from "../../../../../core/errors/AppError";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export function createAuthMiddleware(tokenService: TokenService) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Token no proporcionado" });
        return;
      }

      const token = authHeader.substring(7);
      let decoded: { id: number; email: string };

      try {
        decoded = tokenService.verifyAccess(token); // detecta expirados
      } catch {
        res.status(401).json({ error: "Token inválido o expirado" });
        return;
      }

      // Verificar usuario y estado
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { status: true },
      });
      if (!user) {
        res.status(404).json({ error: "Usuario no encontrado" });
        return;
      }
      if (user.status !== "active") {
        res.status(403).json({ error: "Usuario inactivo" });
        return;
      }

      // Verificar que exista al menos una sesión activa (refresh token guardado)
      const session = await prisma.authSession.findFirst({
        where: { userId: decoded.id },
      });
      if (!session) {
        res.status(401).json({ error: "Sesión expirada o revocada" });
        return;
      }

      req.user = { id: decoded.id, email: decoded.email };
      next();
    } catch (error) {
      console.error("AuthMiddleware error:", error);
      res.status(500).json({ error: "Error en autenticación" });
    }
  };
}