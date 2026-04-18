import type { IProgressMetricsService } from '../domain/ProgressPorts';
import type { RecentActivity } from '../domain/RecentActivity';

/**
 * Caso de Uso: Obtener actividad reciente del usuario
 * Retorna información sobre las últimas interacciones registradas
 */
export class GetRecentActivityUseCase {
  constructor(private readonly metricsService: IProgressMetricsService) {}

  async execute(userId: number): Promise<RecentActivity> {
    // Obtener actividad reciente desde el servicio de métricas
    const recentActivity = await this.metricsService.getRecentActivity(userId);

    return recentActivity;
  }
}
