import type { Exam } from '../domain/Exam';
import type { IExamRepository } from '../domain/AssessmentPorts';

/**
 * Caso de uso: Obtener exámenes por curso
 * Devuelve exámenes activos del curso especificado
 */
export class GetExamsByCourseUseCase {
  constructor(private readonly examRepository: IExamRepository) {}

  async execute(courseId: number): Promise<Exam[]> {
    const exams = await this.examRepository.findByCourseId(courseId, true);
    return exams;
  }
}
