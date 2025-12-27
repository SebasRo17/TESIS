export interface GetMyProfileResponse {
    id: number;
    email: string;
    status: 'active' | 'inactive' | 'pending';
    profile?: {
        firstName: string;
        lastName: string;
        document?: string | null;
        goal?: string | null;
        phone?: string | null;
        birthDate?: string | null;
        city?: string | null;
    };
    createdAt: string;
}
