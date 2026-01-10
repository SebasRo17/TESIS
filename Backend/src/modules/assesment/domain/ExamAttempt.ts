/**
 * Entidad de dominio: ExamAttempt
 * Representa un intento específico de un usuario sobre un examen
 */
export interface ExamAttempt {
  id: number;
  userId: number;
  examId: number;
  startedAt: Date;
  completedAt: Date | null;
  durationSec: number | null;
  scoreRaw: number | null;
  scoreNorm: number | null;
  metadata: ExamAttemptMetadata | null;
}

export interface ExamAttemptMetadata {
  totalItems?: number;
  answeredItems?: number;
  correctAnswers?: number;
  accuracy?: number;
  [key: string]: any;
}

export interface ExamAttemptWithDetails extends ExamAttempt {
  exam: {
    id: number;
    title: string;
    mode: string;
  };
  responses: ItemResponse[];
}

export interface ItemResponse {
  id: number;
  attemptId: number;
  itemId: number;
  answer: any;
  isCorrect: boolean | null;
  timeSpentSec: number | null;
  hintsUsed: number;
  awardedScore: number | null;
  createdAt: Date;
}

export interface AttemptMetrics {
  totalItems: number;
  answeredItems: number;
  correctAnswers: number;
  accuracy: number;
  scoreRaw: number;
  scoreNorm: number;
}
