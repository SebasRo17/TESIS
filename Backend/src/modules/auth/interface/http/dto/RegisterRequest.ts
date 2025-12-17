export interface RegisterRequest {
    email: string;
    password: string;
    confirmPassword: string;
    firstName?: string;
    lastName?: string;
    document?: string;
    goal?: string;
    birthDate?: string;
    city?: string;
}