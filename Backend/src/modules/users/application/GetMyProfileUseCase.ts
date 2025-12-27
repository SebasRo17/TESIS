import type { UserRepository } from "../domain/UserPorts";
import { AppError } from "../../../core/errors/AppError";
import { ok, err, type Result } from "../../../utils/result";

export interface GetMyProfileInput {
    userId: number;
}

export interface GetMyProfileOutput {
    id: number;
    email: string;
    status: 'active' | 'inactive' | 'pending' | 'blocked';
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

export class GetMyProfileUseCase {
    constructor(private userRepository: UserRepository) {}

    async execute(input: GetMyProfileInput): Promise<Result<GetMyProfileOutput, AppError>> {
        try {
            const user = await this.userRepository.findUserById(input.userId);
            if (!user) {
                return err(new AppError("Usuario no encontrado", 404));
            }

            const profile = await this.userRepository.getUserProfile(input.userId);

            const createdAt = user.created_at instanceof Date 
                ? user.created_at.toISOString() 
                : String(user.created_at);

            const response: GetMyProfileOutput = {
                id: user.id,
                email: user.email,
                status: user.status as any,
                createdAt,
            };

            if (profile) {
                response.profile = {
                    firstName: profile.first_name,
                    lastName: profile.last_name,
                    document: profile.document ?? null,
                    goal: profile.goal ?? null,
                    phone: profile.phone ?? null,
                    birthDate: profile.birth_date ? profile.birth_date.split('T')[0] : null,
                    city: profile.city ?? null,
                };
            }

            return ok(response);
        } catch (error) {
            console.error("GetMyProfileUseCase error:", error);
            return err(new AppError("Error al obtener el perfil", 500));
        }
    }
}
