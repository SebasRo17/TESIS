import type { UserRepository, UserProfile } from "../domain/UserPorts";
import { prisma } from "../../../infra/db/prisma";

export class PrismaUserRepository implements UserRepository {
    async findUserById(id: number): Promise<any | null> {
        try {
            const user = await prisma.user.findUnique({
                where: { id },
            });

            if (!user) return null;

            return {
                id: user.id,
                email: user.email,
                password_hash: user.passwordHash,
                status: user.status,
                created_at: user.createdAt,
            };
        } catch (error) {
            throw new Error(`Error buscando usuario por ID: ${error}`);
        }
    }

    private formatBirthDate(date: Date | null | undefined): string | null {
        if (!date) return null;
        
        if (date instanceof Date) {
            const isoString = date.toISOString();
            const parts = isoString.split('T');
            return parts[0] || null;
        }
        
        const dateStr = String(date);
        const parts = dateStr.split('T');
        return parts[0] || null;
    }

    async getUserProfile(userId: number): Promise<UserProfile | null> {
        try {
            const profile = await prisma.user_profile.findUnique({
                where: { user_id: userId },
            });

            if (!profile) return null;

            const result: UserProfile = {
                user_id: profile.user_id,
                first_name: profile.first_name,
                last_name: profile.last_name,
                document: profile.document ?? null,
                goal: profile.goal ?? null,
                phone: profile.phone ?? null,
                birth_date: this.formatBirthDate(profile.birth_date),
                city: profile.city ?? null,
            };

            return result;
        } catch (error) {
            throw new Error(`Error obteniendo perfil: ${error}`);
        }
    }

    async updateUserProfile(
        userId: number,
        profile: Partial<UserProfile>
    ): Promise<UserProfile> {
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

            const result: UserProfile = {
                user_id: updated.user_id,
                first_name: updated.first_name,
                last_name: updated.last_name,
                document: updated.document ?? null,
                goal: updated.goal ?? null,
                phone: updated.phone ?? null,
                birth_date: this.formatBirthDate(updated.birth_date),
                city: updated.city ?? null,
            };

            return result;
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

    async updateUserStatus(
        userId: number,
        status: 'active' | 'inactive' | 'pending'
    ): Promise<void> {
        try {
            await prisma.user.update({
                where: { id: userId },
                data: { status },
            });
        } catch (error) {
            throw new Error(`Error actualizando estado: ${error}`);
        }
    }
}
