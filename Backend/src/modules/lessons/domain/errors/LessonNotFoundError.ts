import { AppError } from '../../../../core/errors/AppError';

export class LessonNotFoundError extends AppError {
  constructor(message: string = 'Lesson not found') {
    super(message, 404);
    this.name = 'LessonNotFoundError';
  }
}
