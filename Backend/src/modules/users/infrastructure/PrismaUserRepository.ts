import type { UserRepository, UserProfile } from "../domain/UserPorts";
import type { User } from "../../../shared/domain/User";
import { prisma } from "../../../infra/db/prisma";

export class PrismaUserRepository implements UserRepository {
    async findUserById(id: number): Promise<User | null> {
        try {
            const user = await prisma.user.findUnique({
                where: { id },
            });

            if (!user) return null;

            return {
                id: user.id,
                email: user.email,
                password_hash: user.passwordHash,
                status: user.status as "active" | "inactive" | "pending",
                created_at: user.createdAt,
            };
        } catch (error) {
            throw new Error(`Error buscando usuario por ID: ${error}`);
        }
    }

    async getUserProfile(userId: number): Promise<UserProfile | null> {
        try {
            const profile = await prisma.user_profile.findUnique({
                where: { user_id: userId },
            });

            if (!profile) return null;

            return {
                user_id: profile.user_id,
                first_name: profile.first_name,
                last_name: profile.last_name,
                document: profile.document ?? null,
                goal: profile.goal ?? null,
                phone: profile.phone ?? null,
                birth_date: profile.birth_date 
                    ? profile.birth_date.toISOString().split('T')[0] 
                    : null,
                city: profile.city ?? null,
            };
        } catch (error) {
            throw new Error(`Error obteniendo perfil: ${error}`);
        }
    }

    async updateUserProfile(userId: number, profile: Partial<UserProfile>): Promise<UserProfile> {
        try {
            const updateData: Record<string, any> = {};

            if (profile.first_name !== undefined) updateData.first_name = profile.first_name;
            if (profile.last_name !== undefined) updateData.last_name = profile.last_name;
            if (profile.document !== undefined) updateData.document = profile.document;
            if (profile.goal !== undefined) updateData.goal = profile.goal;
            if (profile.phone !== undefined) updateData.phone = profile.phone;
            if (profile.city !== undefined) updateData.city = profile.city;
            if (profile.birth_date !== undefined) {
                updateData.birth_date = profile.birth_date 
                    ? new Date(profile.birth_date) 
                    : null;
            }

            const updated = await prisma.user_profile.update({
                where: { user_id: userId },
                data: updateData,
            });

            return {
                user_id: updated.user_id,
                first_name: updated.first_name,
                last_name: updated.last_name,
                document: updated.document ?? null,
                goal: updated.goal ?? null,
                phone: updated.phone ?? null,
                birth_date: updated.birth_date 
                    ? updated.birth_date.toISOString().split('T')[0] 
                    : null,
                city: updated.city ?? null,
            };
        } catch (error) {
            throw new Error(`Error actualizando perfil: ${error}`);
        }
    }

    async updateUserPassword(userId: number, newPasswordHash: string): Promise<void> {
        try {
            await prisma.user.update({
                where: { id: userId },
                data: { passwordHash: newPasswordHash },
            });
        } catch (error) {
            throw new Error(`Error actualizando contraseña: ${error}`);
        }
    }

    async updateUserStatus(userId: number, status: string): Promise<void> {
        try {
            await prisma.user.update({
                where: { id: userId },
                data: { status },
            });
        } catch (error) {
            throw new Error(`Error actualizando estado: ${error}`);
        }
    }

    async getUserStatus(userId: number): Promise<'active' | 'inactive' | 'pending' | 'blocked'> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { status: true },
            });

            if (!user) throw new Error("Usuario no encontrado");
            return user.status as any;
        } catch (error) {
            throw new Error(`Error obteniendo estado: ${error}`);
        }
    }
}
