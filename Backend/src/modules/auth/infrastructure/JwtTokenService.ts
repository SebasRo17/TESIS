import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../../../config/env";
import type { TokenService } from "../domain/AuthPorts";

export class JwtTokenService implements TokenService {
    signAccess(user: { id: number; email: string }): string {
        const secret = env.jwt.accessSecret;
        const ttl = env.jwt.accessTtl;

        if (!secret) {
            throw new Error("JWT_ACCESS_SECRET no está configurado");
        }

        const options: SignOptions = {
            expiresIn: ttl as any,
        };

        return jwt.sign(user, secret, options);
    }

    signRefresh(user: { id: number; email: string }): string {
        const secret = env.jwt.refreshSecret;
        const ttl = env.jwt.refreshTtl;

        if (!secret) {
            throw new Error("JWT_REFRESH_SECRET no está configurado");
        }

        const options: SignOptions = {
            expiresIn: ttl as any,
        };

        return jwt.sign(user, secret, options);
    }

    verifyRefresh(token: string): { id: number; email: string } {
        const secret = env.jwt.refreshSecret;

        if (!secret) {
            throw new Error("JWT_REFRESH_SECRET no está configurado");
        }

        try {
            return jwt.verify(token, secret) as {
                id: number;
                email: string;
            };
        } catch (error) {
            throw new Error("Token de actualización inválido o expirado");
        }
    }

    verifyAccess(token: string): { id: number; email: string } {
        const secret = env.jwt.accessSecret;

        if (!secret) {
            throw new Error("JWT_ACCESS_SECRET no está configurado");
        }

        try {
            return jwt.verify(token, secret) as {
                id: number;
                email: string;
            };
        } catch (error) {
            throw new Error("Token de acceso inválido o expirado");
        }
    }
}