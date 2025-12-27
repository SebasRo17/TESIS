import type { CourseRepository } from '../domain/CoursePorts';
import { ok, err, type Result } from "../../../utils/result";
import { AppError } from '../../../core/errors/AppError';

export class GetCoursesUseCase {
    constructor(private courseRepository: CourseRepository) {}

    async execute(): Promise<Result<Awaited<ReturnType<CourseRepository["findAll"]>>, AppError>> {
        try {
            const courses = await this.courseRepository.findAll();
            return ok(courses.filter((c) => c.status === 'active'));
        } catch (e) {
            return err(new AppError('Error al obtener los cursos', 500));
        }
    }
}