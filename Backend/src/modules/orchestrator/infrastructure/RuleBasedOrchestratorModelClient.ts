import type { InputSnapshot, OrchestratorDecision } from '../domain/Orchestrator';
import type { OrchestratorModelClient } from '../domain/OrchestratorPorts';

/**
 * Cliente por defecto. Simula una decisión del modelo externo con reglas simples.
 */
export class RuleBasedOrchestratorModelClient implements OrchestratorModelClient {
  async decide(snapshot: InputSnapshot): Promise<OrchestratorDecision> {
    const pendingItem = (snapshot.plan as any)?.items?.find((item: any) => item.status === 'pending');

    if (pendingItem) {
      return {
        type: 'next',
        rationale: 'Existe una actividad pendiente en el plan activo',
        modelVersion: 'rule-based-v1',
        payload: {
          itemId: pendingItem.id,
          contentRefType: pendingItem.contentRefType,
          contentRefId: pendingItem.contentRefId,
        },
      };
    }

    const lowMastery = snapshot.mastery.find((entry) => entry.mastery < 0.4);
    if (lowMastery) {
      return {
        type: 'reinforce_topic',
        rationale: 'Se detectó bajo dominio en un tema crítico',
        modelVersion: 'rule-based-v1',
        payload: {
          topicId: lowMastery.topicId,
          strategy: 'practice_first',
        },
      };
    }

    return {
      type: 'feedback',
      rationale: 'No se requiere ajuste inmediato; mantener estado actual',
      modelVersion: 'rule-based-v1',
      payload: {
        message: 'Continuar monitoreo sin cambios por ahora',
      },
    };
  }
}
