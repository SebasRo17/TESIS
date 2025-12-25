export interface RegisterResponse {
    user: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    };
    accessToken: string;
    refreshToken: string;
}