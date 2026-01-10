/**
 * Entidad de dominio: Exam
 * Representa una evaluación formal asociada a un curso
 */
export interface Exam {
  id: number;
  title: string;
  mode: ExamMode;
  timeLimitSec: number;
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum ExamMode {
  DIAGNOSTIC = 'diagnostic',
  MOCK = 'mock',
  FINAL = 'final',
}

export interface ExamWithItems extends Exam {
  items: ExamItem[];
}

export interface ExamItem {
  itemId: number;
  orderN: number;
  weight: number;
}
