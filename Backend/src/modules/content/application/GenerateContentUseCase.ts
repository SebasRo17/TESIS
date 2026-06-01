import { AppError } from '../../../core/errors/AppError';
import { err, ok, type Result } from '../../../utils/result';
import type { ContentRepository } from '../domain/ContentPorts';
import type { ContentVariant } from '../domain/Content';

export type GenerateContentMode = 'explicar' | 'generar_ejercicio' | 'evaluar_respuesta';

export interface GenerateContentInput {
  userId: number;
  lessonId: number;
  modo: GenerateContentMode;
  query?: string | undefined;
}

export interface GenerateContentOutput {
  variant: ContentVariant;
  orchestratorResponse: {
    route: string;
    latencyCls: number;
    latencySp: number;
    modelVersion: string;
  };
}

const MODE_LABELS: Record<GenerateContentMode, string> = {
  explicar: 'Explicacion',
  generar_ejercicio: 'Ejercicios',
  evaluar_respuesta: 'Evaluacion',
};

/**
 * Caso de uso: Generar contenido con el modelo especialista
 * Llama al orquestador /query, recibe contenido del LLM y lo persiste como content_variant
 */
export class GenerateContentUseCase {
  constructor(
    private readonly contentRepo: ContentRepository,
    private readonly orchestratorEndpoint: string = 'http://127.0.0.1:8000/query',
    private readonly timeoutMs: number = 3 * 60 * 1000
  ) {}

  async execute(input: GenerateContentInput): Promise<Result<GenerateContentOutput, AppError>> {
    try {
      // Validar leccion
      const lesson = await this.contentRepo.findLessonReferenceById(input.lessonId);
      if (!lesson || !lesson.isActive) {
        return err(new AppError('Leccion no encontrada', 404));
      }

      // Obtener nombre de la leccion y topic para el query
      const lessonInfo = await this.contentRepo.findLessonWithTopic(input.lessonId);
      const queryText = input.query || (lessonInfo
        ? `${lessonInfo.title} - ${lessonInfo.topicName || ''}`
        : `Contenido para la leccion ${input.lessonId}`);

      // Llamar al orquestador
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

      let orchestratorResult: any;
      try {
        const response = await fetch(this.orchestratorEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: input.userId,
            query: queryText,
            modo: input.modo,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const body = await response.text().catch(() => '');
          return err(new AppError(`Orquestador error: ${response.status} ${body}`, 502));
        }

        orchestratorResult = await response.json();
      } finally {
        clearTimeout(timeout);
      }

      if (orchestratorResult.error) {
        return err(new AppError(`Modelo error: ${orchestratorResult.error}`, 502));
      }

      const generatedContent = orchestratorResult.response || orchestratorResult.content || '';
      if (!generatedContent) {
        return err(new AppError('El modelo no genero contenido', 502));
      }

      // Convertir a HTML
      const bodyHtml = this.contentToHtml(generatedContent, input.modo, queryText);

      // Guardar como content_variant
      const variant = await this.contentRepo.createContentVariant({
        lessonId: input.lessonId,
        modality: `ai_${input.modo}`,
        difficultyProfile: 'adaptive',
        readingLevel: 'B1',
        bodyHtml,
        estimatedMinutes: Math.ceil(generatedContent.length / 500),
      });

      // Registrar evento de generacion
      await this.contentRepo.createContentEvent({
        userId: input.userId,
        contentVariantId: variant.id,
        eventType: 'ai_generated',
        eventValue: {
          modo: input.modo,
          route: orchestratorResult.route_to,
          latencyCls: orchestratorResult.latency_cls_s,
          latencySp: orchestratorResult.latency_sp_s,
          modelVersion: orchestratorResult.model_version,
          generatedAt: new Date().toISOString(),
        },
      });

      return ok({
        variant,
        orchestratorResponse: {
          route: orchestratorResult.route_to || 'unknown',
          latencyCls: orchestratorResult.latency_cls_s || 0,
          latencySp: orchestratorResult.latency_sp_s || 0,
          modelVersion: orchestratorResult.model_version || 'unknown',
        },
      });
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return err(new AppError('Timeout al generar contenido', 504));
      }
      return err(new AppError('Error al generar contenido', 500));
    }
  }

  private async buildQueryFromLesson(lessonId: number): Promise<string> {
    // Usa Prisma directamente via el repo pattern no lo permite,
    // pero podemos usar un query generico
    // Fallback: usar el lessonId como referencia
    return `Contenido para la leccion ${lessonId}`;
  }

  private contentToHtml(content: string, modo: GenerateContentMode, topic: string): string {
    const title = MODE_LABELS[modo] || 'Contenido';
    const escapedContent = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br/>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\$(.*?)\$/g, '<code class="math">$1</code>');

    return `<article class="ai-generated" data-modo="${modo}">
<header>
<h2>${title}: ${topic.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h2>
<p class="meta">Generado por modelo especialista EPN</p>
</header>
<section class="content">
${escapedContent}
</section>
</article>`;
  }
}
