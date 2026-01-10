/**
 * Entidad de dominio: Item
 * Representa una pregunta o ejercicio evaluable
 */
export interface Item {
  id: number;
  topicId: number;
  type: ItemType;
  stem: string;
  options: ItemOption[] | null;
  answerKey: AnswerKey;
  explanation: string | null;
  difficulty: number;
  source: string | null;
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum ItemType {
  SINGLE_CHOICE = 'single_choice',
  MULTI_CHOICE = 'multi_choice',
  OPEN = 'open',
}

export interface ItemOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface AnswerKey {
  correctAnswer: string | string[];
  acceptedAnswers?: string[];
  caseSensitive?: boolean;
}
