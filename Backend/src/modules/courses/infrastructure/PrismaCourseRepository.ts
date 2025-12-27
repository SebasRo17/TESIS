import { prisma } from "../../../infra/db/prisma";
import type { Course } from "../domain/Course";
import type { CourseRepository } from "../domain/CoursePorts";

export class PrismaCourseRepository implements CourseRepository {
    async findAll(): Promise<Course[]> {
        const rows = await prisma.courses.findMany({ orderBy: { id: "asc" } });
        return rows.map((r) => ({
            id: r.id,
            code: r.code,
            title: r.title,
            description: r.description,
            status: r.status,
        }));
    }

    async findById(id: number): Promise<Course | null> {
        const r = await prisma.courses.findUnique({ where: { id } });
        return r
            ? {
                id: r.id,
                code: r.code,
                title: r.title,
                description: r.description,
                status: r.status,
            }
        : null;
    }

    async findByCode(code: string): Promise<Course | null> {
        const r = await prisma.courses.findUnique({ where: { code } });
        return r
            ? {
                id: r.id,
                code: r.code,
                title: r.title,
                description: r.description,
                status: r.status,
            }
        : null;
    }
}