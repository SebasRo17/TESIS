export interface ResetPasswordRequest {
    userId: number;
    token: string;
    newPassword: string;
    confirmPassword: string;
}