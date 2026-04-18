import type { CourseRepository } from "../domain/CoursePorts";
import { ok, err, type Result } from "../../../utils/result";
import { CourseNotFoundError } from "../domain/errors/CourseNotFoundError";

export class GetCourseByIdUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(id: number): Promise<Result<NonNullable<Awaited<ReturnType<CourseRepository["findById"]>>>, CourseNotFoundError>> {
    const course = await this.repo.findById(id);
    if (!course || course.status !== "active") return err(new CourseNotFoundError());
    return ok(course);
  }
}