import { course as enterpriseCourse } from './course';
import { migrationCourse } from './migration';
import type { Course } from '../model/schema';

export const courses: readonly Course[] = [enterpriseCourse, migrationCourse];

export const getCourse = (id: string) => courses.find((course) => course.id === id);
