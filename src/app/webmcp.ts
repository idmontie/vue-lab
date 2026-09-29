import type { Router } from 'vue-router';
import { nextTick } from 'vue';
import { courses, getCourse } from '../features/course';
import { useProgressStore } from '../features/progress';

interface WebTool {
  name: string;
  description: string;
  inputSchema: object;
  annotations: { readOnlyHint: boolean };
  execute(input: unknown): unknown;
}

interface ModelContext {
  registerTool(tool: WebTool, options: { signal: AbortSignal }): void | Promise<void>;
}

export function registerCourseTools(router: Router) {
  const context = (document as Document & { modelContext?: ModelContext }).modelContext;
  if (!context) return () => {};

  const controller = new AbortController();
  const progress = useProgressStore();

  const register = (tool: WebTool) => {
    try {
      void Promise.resolve(context.registerTool(tool, { signal: controller.signal })).catch(
        () => {},
      );
    } catch {
      /* Optional browser capability. */
    }
  };

  register({
    name: 'read_course_progress',
    description:
      'Read separate progress and identifiers for every course without changing answers.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
    execute() {
      return {
        courses: courses.map((course) => ({
          id: course.id,
          title: course.title,
          percent: progress.summary(course.id).percent,
          completedLessons: progress.summary(course.id).completedLessons,
          sections: course.sections.map((s) => ({
            id: s.id,
            title: s.title,
            ...progress.sectionStatus(course.id, s.id),
            lessons: s.lessons.map((l) => ({
              id: l.id,
              title: l.title,
              complete: progress.isComplete(course.id, l.id),
            })),
          })),
        })),
      };
    },
  });

  register({
    name: 'open_course_lesson',
    description:
      'Navigate to a lesson in the specified course. This does not answer questions or complete the lesson.',
    inputSchema: {
      type: 'object',
      properties: { courseId: { type: 'string' }, lessonId: { type: 'string' } },
      required: ['courseId', 'lessonId'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false },
    async execute(input) {
      if (
        !input ||
        typeof input !== 'object' ||
        !('courseId' in input) ||
        typeof input.courseId !== 'string' ||
        !('lessonId' in input) ||
        typeof input.lessonId !== 'string'
      ) {
        throw new Error('courseId and lessonId are required');
      }

      const course = getCourse(input.courseId);
      const section = course?.sections.find((s) => s.lessons.some((l) => l.id === input.lessonId));

      if (!course || !section) throw new Error('Unknown course or lesson');

      await router.push(
        '/courses/' + course.id + '/sections/' + section.id + '/lessons/' + input.lessonId,
      );
      await nextTick();

      return { courseId: course.id, lessonId: input.lessonId, opened: true };
    },
  });

  return () => controller.abort();
}
