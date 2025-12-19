import type { User } from "../../../shared/domain/User";
export interface AuthRepository {
    findUserByEmail(email: string): Promise<User | null>;
    createUser(email: string, passwordHash: string): Promise<User>;
    storeRefreshToken(userId: number, refreshHash: string, ip?: string, ua?: string): Promise<void>;
    revokeRefreshToken(userId: number, refreshHash: string): Promise<void>;
    findUserById(id: number): Promise<User | null>;
    verifyRefreshTokenExists(
        userId: number,
        refreshHash: string
    ): Promise<boolean>;
    revokeAllRefreshTokens(userId: number): Promise<void>; // Para logoutAll
    storePasswordReset(userId: number, tokenHash: string, expiresAt: Date, ip?: string | null, ua?: string | null): Promise<void>;
    getActivePasswordResets(userId: number): Promise<Array<{ id: number; tokenHash: string; expiresAt: Date }>>;
    markPasswordResetUsed(id: number): Promise<void>;
    updateUserPassword(userId: number, newPasswordHash: string): Promise<void>;
}

export interface PasswordHasher {   
    hash(plain: string): Promise<string>;
    compare(plain: string, hash: string): Promise<boolean>;
}

export interface TokenPair{
    accessToken: string;
    refreshToken: string;
}

export interface EmailService {
    sendPasswordResetEmail(params: { to: string; resetUrl: string }): Promise<void>;
}

export interface TokenService {
    signAccess(user: { id: number; email: string}): string;
    signRefresh(user: { id: number; email: string}): string;
    verifyRefresh(token: string): { id: number; email: string };
    verifyAccess(token: string): { id: number; email: string };
}