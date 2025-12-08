export type User = {
    id: number;
    email: string;
    password_hash: string;
    status: 'active' | 'inactive' | 'pending';
    created_at: Date;
}