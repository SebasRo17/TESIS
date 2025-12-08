import type { User } from "../../../shared/domain/User";
export interface AuthRepository {
    findUserByEmail(email: string): Promise<User | null>;
    createUser(email: string, passwordHash: string): Promise<User>;
    storeRefreshToken(userId: number, refreshHash: string, ip?: string, ua?: string): Promise<void>;
    revokeRefreshToken(userId: number, refreshHash: string): Promise<void>;
}

export interface PasswordHasher {   
    hash(plain: string): Promise<string>;
    compare(plain: string, hash: string): Promise<boolean>;
}

export interface TokenPair{
    accessToken: string;
    refreshToken: string;
}

export interface TokenService {
    signAccess(user: { id: number; email: string}): string;
    signRefresh(user: { id: number; email: string}): string;
    verifyRefresh(token: string): { id: number; email: string };
}