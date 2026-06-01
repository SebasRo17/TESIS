import type { ILessonProgressRepository } from '../domain/ProgressPorts';
import { ProgressStatus, type LessonProgress } from '../domain/LessonProgress';
import { AppError } from '../../../core/errors/AppError';
import type { UpdateMasteryUseCase } from '../../mastery/application/UpdateMasteryUseCase';

/**
 * Puerto para consultar el topic principal de una leccion
 */
export interface ILessonTopicLookup {
  findPrimaryTopicId(lessonId: number): Promise<number | null>;
}

/**
 * Caso de Uso: Completar progreso de una leccion
 * Marca una leccion como completada por el usuario y actualiza mastery del topic
 */
export class CompleteLessonProgressUseCase {
  constructor(
    private readonly progressRepository: ILessonProgressRepository,
    private readonly updateMasteryUseCase?: UpdateMasteryUseCase,
    private readonly lessonTopicLookup?: ILessonTopicLookup
  ) {}

  async execute(userId: number, lessonId: number): Promise<LessonProgress> {
    // Buscar el progreso existente
    const existing = await this.progressRepository.findByUserAndLesson(userId, lessonId);

    if (!existing) {
      throw new AppError('No se encontro progreso para esta leccion', 404);
    }

    // Validar que no este ya completada
    if (existing.completedAt) {
      throw new AppError('La leccion ya esta marcada como completada', 400);
    }

    // Marcar como completada
    const completed = await this.progressRepository.update(existing.id, {
      status: ProgressStatus.COMPLETED,
      completedAt: new Date(),
    });

    // Actualizar mastery del topic principal con un delta positivo
    await this.updateMasteryFromLessonCompletion(userId, lessonId);

    return completed;
  }

  private async updateMasteryFromLessonCompletion(
    userId: number,
    lessonId: number
  ): Promise<void> {
    if (!this.updateMasteryUseCase || !this.lessonTopicLookup) return;

    try {
      const topicId = await this.lessonTopicLookup.findPrimaryTopicId(lessonId);
      if (!topicId) return;

      // Delta fijo por completar leccion: +0.05
      // Completar contenido demuestra engagement, no dominio completo
      await this.updateMasteryUseCase.execute({
        userId,
        topicId,
        source: 'lesson',
        delta: 0.05,
        observationsDelta: 0,
        evidence: { lessonId, event: 'lesson_completed' },
      });
    } catch (error) {
      console.error('[CompleteLessonProgress] Error actualizando mastery:', error);
    }
  }
}
