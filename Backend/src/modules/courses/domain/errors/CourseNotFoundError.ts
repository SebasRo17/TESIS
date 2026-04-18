import { AppError } from '../../../../core/errors/AppError';

export class CourseNotFoundError extends AppError {
    constructor(message = 'Course not found') {
        super(message, 404);
    }
}
