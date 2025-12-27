import type { Course } from './Course';

export interface CourseRepository {
    findAll(): Promise<Course[]>;
    findById(id: number): Promise<Course | null>;
    findByCode(code: string): Promise<Course | null>;
}