export interface LoginResponse {
    user: {
        id: number;
        email: string;
    };
    accessToken: string;
    refreshToken: string;
}