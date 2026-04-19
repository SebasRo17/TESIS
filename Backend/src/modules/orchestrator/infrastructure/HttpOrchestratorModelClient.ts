import type { InputSnapshot, OrchestratorDecision } from '../domain/Orchestrator';
import type { OrchestratorModelClient } from '../domain/OrchestratorPorts';

function buildDecisionType(snapshot: InputSnapshot): 'next' | 'plan' {
  const pendingItem = (snapshot.plan as { items?: Array<{ status?: string }> } | null)?.items?.find(
    (item) => item.status === 'pending'
  );

  return pendingItem ? 'next' : 'plan';
}

function buildModelSnapshot(snapshot: InputSnapshot): Record<string, unknown> {
  return {
    mastery: Object.fromEntries(
      snapshot.mastery.map((entry) => [String(entry.topicId), entry.mastery])
    ),
    rule_matches: snapshot.studyRules.map((rule) => ({
      rule: rule.name,
      priority: rule.priority,
      scope: rule.appliedScope,
      definition: rule.definition,
      binding_id: rule.bindingId,
    })),
    eligible_lessons: snapshot.eligibility
      .filter((entry) => entry.eligible)
      .map((entry) => ({
        lesson_id: entry.lessonId,
        topic_id: entry.requiredTopicId,
        min_mastery: entry.minMastery,
        current_mastery: entry.currentMastery,
      })),
    progress: snapshot.progress,
    last_actions: snapshot.lastActions,
    raw_snapshot: snapshot,
  };
}

export class HttpOrchestratorModelClient implements OrchestratorModelClient {
  constructor(
    private readonly endpoint: string = 'http://127.0.0.1:8000/decide',
    private readonly timeoutMs: number = 5 * 60 * 1000
  ) {}

  async decide(snapshot: InputSnapshot): Promise<OrchestratorDecision> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    const requestBody = {
      user_id: snapshot.user.id,
      course_id: snapshot.course.id,
      decision_type: buildDecisionType(snapshot),
      snapshot: buildModelSnapshot(snapshot),
    };

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`Model decide endpoint failed: ${response.status} ${body}`.trim());
      }

      return await response.json() as OrchestratorDecision;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error(`Model decide endpoint timed out after ${this.timeoutMs}ms`);
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
