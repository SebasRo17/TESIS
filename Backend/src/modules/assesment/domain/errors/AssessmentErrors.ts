import { DomainError } from '../../../../core/errors/DomainError';

export class ExamNotFoundError extends DomainError {
  constructor(examId: number) {
    super(`Exam with ID ${examId} not found`);
  }
}

export class ExamNotActiveError extends DomainError {
  constructor(examId: number) {
    super(`Exam with ID ${examId} is not active`);
  }
}

export class ItemNotFoundError extends DomainError {
  constructor(itemId: number) {
    super(`Item with ID ${itemId} not found`);
  }
}

export class ItemNotInExamError extends DomainError {
  constructor(itemId: number, examId: number) {
    super(
      `Item ${itemId} does not belong to exam ${examId}`
    );
  }
}

export class ExamAttemptNotFoundError extends DomainError {
  constructor(attemptId: number) {
    super(`Exam attempt with ID ${attemptId} not found`);
  }
}

export class ExamAttemptAlreadyCompletedError extends DomainError {
  constructor(attemptId: number) {
    super(
      `Exam attempt ${attemptId} is already completed`
    );
  }
}

export class ExamAttemptNotOwnedError extends DomainError {
  constructor(attemptId: number, userId: number) {
    super(
      `Exam attempt ${attemptId} does not belong to user ${userId}`
    );
  }
}

export class ItemResponseAlreadyExistsError extends DomainError {
  constructor(attemptId: number, itemId: number) {
    super(
      `Response for item ${itemId} in attempt ${attemptId} already exists`
    );
  }
}

export class InvalidAnswerFormatError extends DomainError {
  constructor(itemType: string) {
    super(
      `Invalid answer format for item type ${itemType}`
    );
  }
}
