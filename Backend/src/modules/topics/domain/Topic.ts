/**
 * Entidad base de Topic
 */
export interface Topic {
  id: number;
  courseId: number;
  name: string;
  description: string | null;
  parentTopicId: number | null;
  level: number;
  isActive: boolean;
}

/**
 * Topic con hijos (para árbol jerárquico)
 */
export interface TopicWithChildren extends Topic {
  children: TopicWithChildren[];
}

/**
 * Item del breadcrumb
 */
export interface BreadcrumbItem {
  id: number;
  name: string;
  level: number;
}

/**
 * Topic con breadcrumb e hijos (para detalle)
 */
export interface TopicWithBreadcrumb extends Topic {
  breadcrumb: BreadcrumbItem[];
  children: Topic[];
}
