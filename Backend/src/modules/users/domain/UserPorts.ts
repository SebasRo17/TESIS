import type { User } from "../../../shared/domain/User";

export interface UserProfile {
    user_id: number;
    first_name: string;
    last_name: string;
    document?: string | null;
    goal?: string | null;
    phone?: string | null;
    birth_date?: string | null;
    city?: string | null;
}

export interface UserRepository {
    findUserById(id: number): Promise<User | null>;
    updateUserProfile(userId: number, profile: Partial<UserProfile>): Promise<UserProfile>;
    getUserProfile(userId: number): Promise<UserProfile | null>;
    updateUserPassword(userId: number, newPasswordHash: string): Promise<void>;
    updateUserStatus(userId: number, status: 'active' | 'inactive' | 'blocked'): Promise<void>;
    getUserStatus(userId: number): Promise<'active' | 'inactive' | 'pending' | 'blocked'>;
}

export interface PasswordHasher {
    hash(plain: string): Promise<string>;
    compare(plain: string, hash: string): Promise<boolean>;
}
