import type { CourseRepository } from "../domain/CoursePorts";
import { ok, err, type Result } from "../../../utils/result";
import { CourseNotFoundError } from "../domain/errors/CourseNotFoundError";

export class GetCourseBySlugUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(slug: string): Promise<Result<NonNullable<Awaited<ReturnType<CourseRepository["findByCode"]>>>, CourseNotFoundError>> {
    const course = await this.repo.findByCode(slug);
    if (!course || course.status !== "active") return err(new CourseNotFoundError());
    return ok(course);
  }
}