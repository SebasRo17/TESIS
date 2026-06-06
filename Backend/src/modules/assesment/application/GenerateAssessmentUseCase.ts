import { AppError } from '../../../core/errors/AppError';
import { ExamMode } from '../domain/Exam';
import { ItemType, type AnswerKey, type ItemOption } from '../domain/Item';
import type { IExamRepository, IItemRepository } from '../domain/AssessmentPorts';

export interface GenerateAssessmentInput {
  userId: number;
  courseId: number;
  topicId: number;
  difficulty: 'basic' | 'medium' | 'advanced';
  questionCount: number;
  mode: ExamMode;
}

export interface GeneratedAssessmentOutput {
  examId: number;
  title: string;
  mode: ExamMode;
  timeLimitSec: number;
  itemsCount: number;
  itemIds: number[];
}

interface NormalizedQuestion {
  type: ItemType;
  stem: string;
  options: ItemOption[];
  answerKey: AnswerKey;
  explanation: string | null;
  difficulty: number;
}

const DIFFICULTY_TO_NUMBER = {
  basic: 2,
  medium: 3,
  advanced: 4,
} as const;

export class GenerateAssessmentUseCase {
  constructor(
    private readonly examRepository: IExamRepository,
    private readonly itemRepository: IItemRepository,
    private readonly orchestratorQueryUrl: string,
    private readonly timeoutMs: number = 2 * 60 * 1000
  ) {}

  async execute(input: GenerateAssessmentInput): Promise<GeneratedAssessmentOutput> {
    if (!Number.isInteger(input.userId) || input.userId <= 0) {
      throw new AppError('Usuario invalido', 400);
    }

    const belongs = await this.itemRepository.topicBelongsToCourse(input.topicId, input.courseId);
    if (!belongs) {
      throw new AppError('El tema no pertenece al curso', 400);
    }

    const questionCount = Math.min(Math.max(input.questionCount, 1), 10);
    const questions: NormalizedQuestion[] = [];

    for (let index = 0; index < questionCount; index++) {
      const raw = await this.requestQuestion(input, index + 1);
      questions.push(this.normalizeQuestion(raw, input.difficulty));
    }

    const createdItems = [];
    for (const question of questions) {
      const item = await this.itemRepository.create({
        topicId: input.topicId,
        type: question.type,
        stem: question.stem,
        options: question.options,
        answerKey: question.answerKey,
        explanation: question.explanation,
        difficulty: question.difficulty,
        source: 'ai_generated',
      });
      createdItems.push(item);
    }

    const exam = await this.examRepository.createWithItems({
      title: `Evaluacion IA - Tema ${input.topicId}`,
      mode: input.mode,
      timeLimitSec: Math.max(300, questionCount * 90),
      itemIds: createdItems.map((item) => item.id),
    });

    return {
      examId: exam.id,
      title: exam.title,
      mode: exam.mode,
      timeLimitSec: exam.timeLimitSec,
      itemsCount: exam.items.length,
      itemIds: createdItems.map((item) => item.id),
    };
  }

  private async requestQuestion(input: GenerateAssessmentInput, questionNumber: number): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    const query = [
      `Genera una pregunta de opcion multiple en JSON estricto para el tema ${input.topicId}.`,
      `Nivel: ${input.difficulty}. Pregunta numero ${questionNumber}.`,
      'Formato: {"stem":"...","options":[{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."}],"answerKey":{"correctAnswer":"A"},"explanation":"..."}',
      'No incluyas markdown ni texto fuera del JSON.',
    ].join(' ');

    try {
      const response = await fetch(this.orchestratorQueryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: input.userId,
          query,
          modo: 'generar_ejercicio',
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new AppError(`Modelo error: ${response.status} ${body}`, 502);
      }

      const data = await response.json();
      return data.response ?? data.content ?? data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if ((error as Error).name === 'AbortError') {
        throw new AppError('Timeout al generar evaluacion IA', 504);
      }
      throw new AppError('Error al generar evaluacion IA', 502);
    } finally {
      clearTimeout(timeout);
    }
  }

  private normalizeQuestion(raw: unknown, difficulty: 'basic' | 'medium' | 'advanced'): NormalizedQuestion {
    const parsed = this.parseRawQuestion(raw);
    const stem = String(parsed.stem ?? parsed.question ?? parsed.pregunta ?? '').trim();
    const options = this.normalizeOptions(parsed.options ?? parsed.opciones);
    const correctAnswer = String(
      parsed.answerKey?.correctAnswer
        ?? parsed.answer_key?.correctAnswer
        ?? parsed.answer_key?.correct_answer
        ?? parsed.correctAnswer
        ?? parsed.respuesta_correcta
        ?? ''
    ).trim();

    if (!stem || options.length < 2 || !correctAnswer) {
      throw new AppError('El modelo no devolvio una pregunta valida', 502);
    }

    return {
      type: ItemType.SINGLE_CHOICE,
      stem,
      options,
      answerKey: { correctAnswer },
      explanation: parsed.explanation ? String(parsed.explanation) : parsed.explicacion ? String(parsed.explicacion) : null,
      difficulty: DIFFICULTY_TO_NUMBER[difficulty],
    };
  }

  private parseRawQuestion(raw: unknown): Record<string, any> {
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      return raw as Record<string, any>;
    }

    const text = String(raw ?? '').trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // Fallback to text parsing below.
      }
    }

    return this.parseTextQuestion(text);
  }

  private parseTextQuestion(text: string): Record<string, any> {
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const options: ItemOption[] = [];
    const stemLines: string[] = [];
    let correctAnswer = '';
    let explanation = '';

    for (const line of lines) {
      const optionMatch = line.match(/^([A-Da-d])[\)\.\:\-]\s*(.+)$/);
      if (optionMatch) {
        options.push({ id: optionMatch[1]!.toUpperCase(), text: optionMatch[2]!.trim() });
        continue;
      }

      const answerMatch = line.match(/(?:respuesta|correcta|answer)\s*[:\-]\s*([A-Da-d])/i);
      if (answerMatch) {
        correctAnswer = answerMatch[1]!.toUpperCase();
        continue;
      }

      if (/^(explicacion|explanation|justificacion)\s*[:\-]/i.test(line)) {
        explanation = line.replace(/^(explicacion|explanation|justificacion)\s*[:\-]\s*/i, '').trim();
        continue;
      }

      stemLines.push(line.replace(/^pregunta\s*[:\-]\s*/i, ''));
    }

    return {
      stem: stemLines.join(' ').trim(),
      options,
      answerKey: { correctAnswer },
      explanation,
    };
  }

  private normalizeOptions(raw: unknown): ItemOption[] {
    if (Array.isArray(raw)) {
      return raw.map((option, index) => {
        if (typeof option === 'string') {
          return { id: String.fromCharCode(65 + index), text: option };
        }

        const record = option as Record<string, unknown>;
        return {
          id: String(record.id ?? String.fromCharCode(65 + index)).toUpperCase(),
          text: String(record.text ?? record.label ?? record.value ?? '').trim(),
        };
      }).filter((option) => option.text);
    }

    if (raw && typeof raw === 'object') {
      return Object.entries(raw as Record<string, unknown>).map(([id, text]) => ({
        id: id.toUpperCase(),
        text: String(text).trim(),
      })).filter((option) => option.text);
    }

    return [];
  }
}
