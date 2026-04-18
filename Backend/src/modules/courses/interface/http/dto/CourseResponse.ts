export interface CourseResponse {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  status: string;
}