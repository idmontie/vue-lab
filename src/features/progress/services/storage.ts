import { enterpriseCourse, type Course } from '../../course';
import type { Answers } from '../model/completion';

export const STORAGE_KEY = 'vue-architecture-lab:progress:v1';

export function storageKey(course: Course) {
  return course.id === enterpriseCourse.id
    ? STORAGE_KEY
    : `vue-architecture-lab:progress:course:${course.id}`;
}

export interface ProgressRepository {
  load(): { answers: Answers; warning: string };
  save(answers: Answers): boolean;
}

export function createLocalProgressRepository(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  course: Course = enterpriseCourse,
): ProgressRepository {
  return {
    load() {
      try {
        const raw = storage.getItem(storageKey(course));
        if (!raw) return { answers: {}, warning: '' };

        const data: unknown = JSON.parse(raw);

        if (
          !data ||
          typeof data !== 'object' ||
          !('version' in data) ||
          data.version !== course.version ||
          !('answers' in data) ||
          typeof data.answers !== 'object' ||
          !data.answers
        ) {
          return {
            answers: {},
            warning:
              'Saved progress is incompatible with this curriculum. Your current session starts fresh.',
          };
        }

        const answers: Answers = {};

        for (const lesson of course.sections.flatMap((s) => s.lessons)) {
          const saved: unknown = (data.answers as Record<string, unknown>)[lesson.id];
          if (!saved || typeof saved !== 'object') continue;

          for (const question of lesson.questions) {
            if ((saved as Record<string, unknown>)[question.id] === question.correctOptionId) {
              (answers[lesson.id] ??= {})[question.id] = question.correctOptionId;
            }
          }
        }

        return { answers, warning: '' };
      } catch {
        return {
          answers: {},
          warning: 'Saved progress could not be read. You can keep learning in this session.',
        };
      }
    },
    save(answers) {
      try {
        storage.setItem(storageKey(course), JSON.stringify({ version: course.version, answers }));
        return true;
      } catch {
        return false;
      }
    },
  };
}

export function browserRepository(course: Course): ProgressRepository {
  try {
    return createLocalProgressRepository(window.localStorage, course);
  } catch {
    return {
      load: () => ({
        answers: {},
        warning: 'Browser storage is unavailable. Progress will last for this session only.',
      }),
      save: () => false,
    };
  }
}
