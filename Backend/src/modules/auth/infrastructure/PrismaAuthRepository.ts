import type { AuthRepository } from '../domain/AuthPorts';
import type { User } from "../../../shared/domain/User";
import { prisma } from "../../../infra/db/prisma";

export class PrismaAuthRepository implements AuthRepository {
    async findUserByEmail(email: string): Promise<User | null> {
        try {
            const user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user) return null;

            return {
                id: user.id,
                email: user.email,
                password_hash: user.passwordHash,
                status: user.status,
                created_at: user.createdAt,
            };
        } catch (error) {
            throw new Error(`Error buscando usuario por email: ${error}`);
        }
    }

    async findUserById(id: number): Promise<User | null> {
        try {
            const user = await prisma.user.findUnique({
                where: { id },
            });

            if (!user) return null;

            return {
                id: user.id,
                email: user.email,
                password_hash: user.passwordHash,
                status: user.status,
                created_at: user.createdAt,
            };
        } catch (error) {
            throw new Error(`Error buscando usuario por ID: ${error}`);
        }
    }

    async createUser(email: string, passwordHash: string): Promise<User> {
        try {
            const user = await prisma.user.create({
                data: {
                    email,
                    passwordHash,
                    status: "pending",
                },
            });

            return {
                id: user.id,
                email: user.email,
                password_hash: user.passwordHash,
                status: user.status,
                created_at: user.createdAt,
            };
        } catch (error) {
            throw new Error(`Error creando usuario: ${error}`);
        }
    }

    async storeRefreshToken(
        userId: number,
        refreshHash: string,
        ip?: string,
        ua?: string
    ): Promise<void> {
        try {
            await prisma.authSession.create({   
                data: {
                    userId,
                    refreshTokenHash: refreshHash,
                    ip: ip || null,
                    userAgent: ua || null,
                },
            });
        } catch (error) {
            throw new Error(`Error guardando refresh token: ${error}`);
        }
    }

    async revokeRefreshToken(userId: number, refreshHash: string): Promise<void> {
        try {
            await prisma.authSession.deleteMany({
                where: {
                    userId,
                    refreshTokenHash: refreshHash,
                },
            });
        } catch (error) {
            throw new Error(`Error revocando refresh token: ${error}`);
        }
    }

    async verifyRefreshTokenExists(
        userId: number,
        refreshHash: string
    ): Promise<boolean> {
        try {
            const session = await prisma.authSession.findFirst({
                where: {
                    userId,
                    refreshTokenHash: refreshHash,
                },
            });
            return !!session;
        } catch (error) {
            throw new Error(`Error verificando refresh token: ${error}`);
        }
    }

    async revokeAllRefreshTokens(userId: number): Promise<void> {
        try {
            await prisma.authSession.deleteMany({
                where: { userId },
            });
        } catch (error) {
            throw new Error(`Error revocando todos los tokens: ${error}`);
        }
    }
}