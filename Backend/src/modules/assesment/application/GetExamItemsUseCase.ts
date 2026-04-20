import type { IExamRepository, IItemRepository } from '../domain/AssessmentPorts';
import type { ExamMode } from '../domain/Exam';
import type { ItemType } from '../domain/Item';
import {
  ExamNotActiveError,
  ExamNotFoundError,
  ItemNotFoundError,
} from '../domain/errors/AssessmentErrors';

export interface PublicExamOption {
  id: string;
  text: string;
}

export interface PublicExamItem {
  id: number;
  topicId: number;
  type: ItemType;
  stem: string;
  options: PublicExamOption[] | null;
  difficulty: number;
  orderN: number;
  weight: number;
}

export interface PublicExamWithItems {
  id: number;
  title: string;
  mode: ExamMode;
  timeLimitSec: number;
  version: number;
  items: PublicExamItem[];
}

export class GetExamItemsUseCase {
  constructor(
    private readonly examRepository: IExamRepository,
    private readonly itemRepository: IItemRepository
  ) {}

  async execute(examId: number): Promise<PublicExamWithItems> {
    const exam = await this.examRepository.findByIdWithItems(examId);

    if (!exam) {
      throw new ExamNotFoundError(examId);
    }

    if (!exam.isActive) {
      throw new ExamNotActiveError(examId);
    }

    const itemIds = exam.items.map((item) => item.itemId);
    const items = await this.itemRepository.findByIds(itemIds);
    const itemsById = new Map(items.map((item) => [item.id, item]));

    return {
      id: exam.id,
      title: exam.title,
      mode: exam.mode,
      timeLimitSec: exam.timeLimitSec,
      version: exam.version,
      items: exam.items.map((examItem) => {
        const item = itemsById.get(examItem.itemId);

        if (!item) {
          throw new ItemNotFoundError(examItem.itemId);
        }

        return {
          id: item.id,
          topicId: item.topicId,
          type: item.type,
          stem: item.stem,
          options: item.options?.map((option) => ({
            id: option.id,
            text: option.text,
          })) ?? null,
          difficulty: item.difficulty,
          orderN: examItem.orderN,
          weight: examItem.weight,
        };
      }),
    };
  }
}
