import type { IProgressMetricsService } from '../domain/ProgressPorts';
import type { UserProgressSummary } from '../domain/UserProgressSummary';

export class GetUserProgressSummaryUseCase {
  constructor(private readonly metricsService: IProgressMetricsService) {}

  async execute(userId: number): Promise<UserProgressSummary> {
    return this.metricsService.getUserProgressSummary(userId);
  }
}
