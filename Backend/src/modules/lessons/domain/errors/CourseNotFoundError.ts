export class CourseNotFoundError extends Error {
  constructor(message: string = 'Course not found') {
    super(message);
    this.name = 'CourseNotFoundError';
  }
}
