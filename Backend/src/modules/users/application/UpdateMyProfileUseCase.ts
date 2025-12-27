import type { UserRepository } from "../domain/UserPorts";
import { AppError } from "../../../core/errors/AppError";
import { ok, err, type Result } from "../../../utils/result";

export interface UpdateMyProfileInput {
    userId: number;
    firstName?: string;
    lastName?: string;
    document?: string | null;
    goal?: string | null;
    phone?: string | null;
    birthDate?: string | null;
    city?: string | null;
}

export interface UpdateMyProfileOutput {
    message: string;
    profile: {
        firstName: string;
        lastName: string;
        document?: string | null;
        goal?: string | null;
        phone?: string | null;
        birthDate?: string | null;
        city?: string | null;
    };
}

export class UpdateMyProfileUseCase {
    constructor(private userRepository: UserRepository) {}

    async execute(input: UpdateMyProfileInput): Promise<Result<UpdateMyProfileOutput, AppError>> {
        try {
            // Validar usuario existe
            const user = await this.userRepository.findUserById(input.userId);
            if (!user) {
                return err(new AppError("Usuario no encontrado", 404));
            }

            // Validar datos
            const validationError = this.validateInput(input);
            if (validationError) {
                return err(validationError);
            }

            // Preparar datos a actualizar
            const updateData: Record<string, any> = {};

            if (input.firstName !== undefined) updateData.first_name = input.firstName;
            if (input.lastName !== undefined) updateData.last_name = input.lastName;
            if (input.document !== undefined) updateData.document = input.document;
            if (input.goal !== undefined) updateData.goal = input.goal;
            if (input.phone !== undefined) updateData.phone = input.phone;
            if (input.city !== undefined) updateData.city = input.city;
            if (input.birthDate !== undefined) {
                updateData.birth_date = input.birthDate ? new Date(input.birthDate) : null;
            }

            // Actualizar perfil
            const updatedProfile = await this.userRepository.updateUserProfile(
                input.userId,
                updateData
            );

            return ok({
                message: "Perfil actualizado correctamente",
                profile: {
                    firstName: updatedProfile.first_name,
                    lastName: updatedProfile.last_name,
                    document: updatedProfile.document ?? null,
                    goal: updatedProfile.goal ?? null,
                    phone: updatedProfile.phone ?? null,
                    birthDate: updatedProfile.birth_date 
                        ? (updatedProfile.birth_date instanceof Date 
                            ? updatedProfile.birth_date.toISOString().split('T')[0]
                            : String(updatedProfile.birth_date).split('T')[0])
                        : null,
                    city: updatedProfile.city ?? null,
                },
            });
        } catch (error) {
            console.error("UpdateMyProfileUseCase error:", error);
            return err(new AppError("Error al actualizar el perfil", 500));
        }
    }

    private validateInput(input: UpdateMyProfileInput): AppError | null {
        const nameRegex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s\-']+$/;

        if (input.firstName && !nameRegex.test(input.firstName)) {
            return new AppError("Nombre contiene caracteres no válidos", 400);
        }

        if (input.firstName && input.firstName.length > 255) {
            return new AppError("Nombre no puede exceder 255 caracteres", 400);
        }

        if (input.lastName && !nameRegex.test(input.lastName)) {
            return new AppError("Apellido contiene caracteres inválidos", 400);
        }

        if (input.lastName && input.lastName.length > 255) {
            return new AppError("Apellido no puede exceder 255 caracteres", 400);
        }

        if (input.phone) {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(input.phone)) {
                return new AppError("Teléfono contiene caracteres inválidos", 400);
            }
            if (input.phone.length > 255) {
                return new AppError("Teléfono no puede exceder 255 caracteres", 400);
            }
        }

        if (input.birthDate) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(input.birthDate)) {
                return new AppError("Fecha de nacimiento inválida (formato: YYYY-MM-DD)", 400);
            }

            const birthDate = new Date(input.birthDate);
            if (isNaN(birthDate.getTime())) {
                return new AppError("Fecha de nacimiento inválida", 400);
            }

            if (birthDate > new Date()) {
                return new AppError("Fecha de nacimiento no puede ser futura", 400);
            }
        }

        if (input.city && input.city.length > 255) {
            return new AppError("Ciudad no puede exceder 255 caracteres", 400);
        }

        if (input.goal && input.goal.length > 255) {
            return new AppError("Meta académica no puede exceder 255 caracteres", 400);
        }

        return null;
    }
}
