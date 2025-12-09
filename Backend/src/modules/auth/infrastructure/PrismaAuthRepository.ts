import type { AuthRepository } from '../domain/AuthPorts';
import type { User } from "../../../shared/domain/User";
import { prisma } from "../../../infra/db/prisma";

export class PrismaAuthRepository implements AuthRepository {
    async findUserByEmail(email: string): Promise<User | null> {
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
    }

    async findUserById(id: number): Promise<User | null> {
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
    }

    async createUser(email: string, passwordHash: string): Promise<User> {
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
    }

    async storeRefreshToken(
        userId: number,
        refreshHash: string,
        ip?: string,
        ua?: string
    ): Promise<void> {
        await prisma.authSession.create({   
            data: {
                userId,
                refreshTokenHash: refreshHash,
                ip,
                userAgent: ua,
            },
        });
    }

    async revokeRefreshToken(userId: number, refreshHash: string): Promise<void> {
        await prisma.authSession.deleteMany({
            where: {
                userId,
                refreshTokenHash: refreshHash,
            },
        });
    }

    async verifyRefreshTokenExists(
        userId: number,
        refreshHash: string
    ): Promise<boolean> {
        const token = await prisma.authSession.findFirst({
            where: {
                userId,
                refreshTokenHash: refreshHash,
            },
        });
        return !!token;
    }

    async revokeAllRefreshTokens(userId: number): Promise<void> {
        await prisma.authSession.deleteMany({
            where: { userId },
        });
    }
}