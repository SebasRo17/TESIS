import { AppError } from '../../../core/errors/AppError';
import { err, ok, type Result } from '../../../utils/result';
import { prisma } from '../../../infra/db/prisma';
import type { AuthRepository } from '../domain/AuthPorts';

export interface GetCurrentUserInput {
    userId: number;
}

export interface GetCurrentUserOutput {
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

export class GetCurrentUserUseCase {
    constructor(private authRepository: AuthRepository) {}

    async execute(input: GetCurrentUserInput): Promise<Result<GetCurrentUserOutput, AppError>> {
        try {
            const user = await this.authRepository.findUserById(input.userId);
            if (!user) return err(new AppError('Usuario no encontrado', 404));

            const profile = await prisma.user_profile.findUnique({
                where: { user_id: input.userId },
            });

            const createdAt =
                (user as any).created_at ??
                (user as any).createdAt ??
                new Date();

            const response: GetCurrentUserOutput = {
                id: user.id,
                email: user.email,
                status: (user as any).status ?? 'active',
                createdAt: createdAt instanceof Date ? createdAt.toISOString() : String(createdAt),
            };

            if (profile) {
                const birthDate: string | null =
                    profile.birth_date?.toISOString().split('T')[0] ?? null;

                response.profile = {
                    firstName: profile.first_name,
                    lastName: profile.last_name,
                    document: profile.document ?? null,
                    goal: profile.goal ?? null,
                    phone: profile.phone ?? null,
                    birthDate,
                    city: profile.city ?? null,
                };
            }

            return ok(response);
        } catch (error) {
            console.error('GetCurrentUserUseCase error:', error);
            return err(new AppError('Error al obtener información del usuario', 500));
        }
    }
}