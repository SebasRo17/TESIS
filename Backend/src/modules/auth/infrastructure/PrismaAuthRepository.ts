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
                status: user.status as "active" | "inactive" | "pending",
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
                status: user.status as "active" | "inactive" | "pending",
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
                status: user.status as "active" | "inactive" | "pending",
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

    async storePasswordReset(userId: number, tokenHash: string, expiresAt: Date, ip?: string | null, ua?: string | null): Promise<void> {
        await prisma.password_resets.create({
            data: {
                user_id: userId,
                token_hash: tokenHash,
                expires_at: expiresAt,
                ip: ip ?? null,
                user_agent: ua ?? null,
            },
        });
    }

    async getActivePasswordResets(userId: number): Promise<Array<{ id: number; tokenHash: string; expiresAt: Date }>> {
        const rows = await prisma.password_resets.findMany({
            where: { user_id: userId, used_at: null, expires_at: { gt: new Date() } },
            select: { id: true, token_hash: true, expires_at: true },
            orderBy: { created_at: 'desc' },
        });
        return rows.map(r => ({ id: r.id, tokenHash: r.token_hash, expiresAt: r.expires_at }));
    }

    async markPasswordResetUsed(id: number): Promise<void> {
        await prisma.password_resets.update({
            where: { id },
            data: { used_at: new Date() },
        });
    }

    async updateUserPassword(userId: number, newPasswordHash: string): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
        });
    }

    async storeEmailVerificationToken(userId: number, tokenHash: string, expiresAt: Date, ip?: string | null, ua?: string | null): Promise<void> {
        await prisma.email_verifications.create({
            data: {
                user_id: userId,
                token_hash: tokenHash,
                expires_at: expiresAt,
                ip: ip ?? null,
                user_agent: ua ?? null,
            },
        });
    }

    async getActiveEmailVerificationToken(userId: number): Promise<{ id: number; tokenHash: string; expiresAt: Date } | null> {
        const token = await prisma.email_verifications.findFirst({
            where: {
                user_id: userId,
                used_at: null,
                expires_at: { gt: new Date() },
            },
            select: { id: true, token_hash: true, expires_at: true },
            orderBy: { created_at: 'desc' },
        });
        
        return token ? { id: token.id, tokenHash: token.token_hash, expiresAt: token.expires_at } : null;
    }

    async markEmailVerificationTokenUsed(id: number): Promise<void> {
        await prisma.email_verifications.update({
            where: { id },
            data: { used_at: new Date() },
        });
    }

    async setUserAsVerified(userId: number): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data: { status: 'active' },
        });
    }
}