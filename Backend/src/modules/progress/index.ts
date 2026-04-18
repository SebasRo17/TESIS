/**
 * Módulo Progress
 * 
 * Propósito:
 * Registrar y exponer el progreso observable del usuario dentro del sistema educativo.
 * Este módulo refleja hechos verificables de interacción y avance.
 * 
 * Alcance:
 * - Registrar el avance del usuario en las lecciones
 * - Exponer métricas agregadas de progreso por curso
 * - Proveer información objetiva sobre la actividad reciente del usuario
 * - Servir como fuente de datos para módulos de mayor nivel (mastery, orchestrator)
 * 
 * Principio:
 * Progress observa, pero no interpreta.
 * Progress registra, pero no decide.
 */

// Domain exports
export * from './domain/LessonProgress';
export * from './domain/CourseProgress';
export * from './domain/RecentActivity';
export * from './domain/ProgressPorts';

// Application exports
export { StartLessonProgressUseCase } from './application/StartLessonProgressUseCase';
export { UpdateLessonProgressUseCase } from './application/UpdateLessonProgressUseCase';
export { CompleteLessonProgressUseCase } from './application/CompleteLessonProgressUseCase';
export { GetCourseProgressUseCase } from './application/GetCourseProgressUseCase';
export { GetRecentActivityUseCase } from './application/GetRecentActivityUseCase';
export { GetLessonProgressDetailUseCase } from './application/GetLessonProgressDetailUseCase';

// Infrastructure exports
export { PrismaLessonProgressRepository } from './infrastructure/PrismaLessonProgressRepository';
export { PrismaProgressMetricsService } from './infrastructure/PrismaProgressMetricsService';

// Interface exports
export { ProgressController } from './interface/http/ProgressController';
export { createProgressRouter } from './interface/http/progressRoutes';
export * from './interface/http/dto/ProgressDTO';
