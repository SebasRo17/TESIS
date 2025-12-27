export interface UserProfile {
    user_id: number;
    first_name: string;
    last_name: string;
    document: string | null;
    goal: string | null;
    phone: string | null;
    birth_date: string | null;
    city: string | null;
}

export interface UserRepository {
    findUserById(id: number): Promise<any | null>;
    updateUserProfile(userId: number, profile: Partial<UserProfile>): Promise<UserProfile>;
    getUserProfile(userId: number): Promise<UserProfile | null>;
    updateUserPassword(userId: number, newPasswordHash: string): Promise<void>;
    updateUserStatus(userId: number, status: 'active' | 'inactive' | 'pending'): Promise<void>;
}

export interface PasswordHasher {
    hash(plain: string): Promise<string>;
    compare(plain: string, hash: string): Promise<boolean>;
}

export interface User {
    id: number;
    email: string;
    password_hash: string;
    status: 'active' | 'inactive' | 'pending';
    created_at: Date | string;
}
