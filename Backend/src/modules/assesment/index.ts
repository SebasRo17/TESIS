/**
 * Módulo Assessment - Punto de entrada principal
 * 
 * Este módulo gestiona los procesos de evaluación del aprendizaje.
 * Principio: Assessment mide, pero no decide. Assessment registra, pero no interpreta.
 */

// Domain exports
export * from './domain/Exam';
export * from './domain/Item';
export * from './domain/ExamAttempt';
export * from './domain/AssessmentPorts';
export * from './domain/errors/AssessmentErrors';

// Application exports
export { GetExamsByCourseUseCase } from './application/GetExamsByCourseUseCase';
export { StartExamAttemptUseCase } from './application/StartExamAttemptUseCase';
export { SubmitItemResponseUseCase } from './application/SubmitItemResponseUseCase';
export { FinishExamAttemptUseCase } from './application/FinishExamAttemptUseCase';
export { GetExamAttemptDetailUseCase } from './application/GetExamAttemptDetailUseCase';

// Infrastructure exports
export { PrismaExamRepository } from './infrastructure/PrismaExamRepository';
export { PrismaItemRepository } from './infrastructure/PrismaItemRepository';
export { PrismaExamAttemptRepository } from './infrastructure/PrismaExamAttemptRepository';
export { PrismaItemResponseRepository } from './infrastructure/PrismaItemResponseRepository';

// Interface exports
export { AssessmentController } from './interface/http/AssessmentController';
export { createAssessmentRouter } from './interface/http/assessmentRoutes';
export * from './interface/http/dto/AssessmentDTO';
