export interface GetCurrentUserResponse {
    id: number;
    email: string;
    status: 'active' | 'inactive' | 'pending';
    profile?: {
        firstName: string;
        lastName: string;
        document?: string;
        goal?: string;
        phone?: string;
        birthDate?: string; 
        city?: string;    
    };
    createdAt: string;
}