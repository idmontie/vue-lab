import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { enterpriseCourse as course, courses, type Lesson } from '../../course';
import { useProgressStore } from './store';
import { isLessonComplete } from './completion';
import { createLocalProgressRepository, STORAGE_KEY, storageKey } from '../services/storage';

const first = course.sections[0]!.lessons[0]!;

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
});

describe('progress invariants', () => {
  it('requires every required answer and retains successful answers across retries', () => {
    const store = useProgressStore();

    expect(store.isComplete(course.id, first.id)).toBe(false);

    store.submit(course.id, first.id, {
      [first.questions[0]!.id]: '0',
      [first.questions[1]!.id]: 'a',
    });
    expect(store.isComplete(course.id, first.id)).toBe(false);
    expect(store.summary(course.id).completedLessons).toBe(0);

    store.submit(course.id, first.id, { [first.questions[0]!.id]: '1' });
    expect(store.isComplete(course.id, first.id)).toBe(true);
    expect(store.summary(course.id).completedLessons).toBe(1);
    expect(store.summary(course.id).completedSections).toBe(0);

    setActivePinia(createPinia());
    expect(useProgressStore().isComplete(course.id, first.id)).toBe(true);
  });

  it('only completes the course after every section is complete', () => {
    const store = useProgressStore();
    const lessons = course.sections.flatMap((s) => s.lessons);

    for (const lesson of lessons.slice(0, -1)) {
      store.submit(
        course.id,
        lesson.id,
        Object.fromEntries(lesson.questions.map((q) => [q.id, q.correctOptionId])),
      );
    }

    expect(store.summary(course.id).courseComplete).toBe(false);
    expect(store.summary(course.id).completedSections).toBe(8);

    const last = lessons.at(-1)!;
    store.submit(
      course.id,
      last.id,
      Object.fromEntries(last.questions.map((q) => [q.id, q.correctOptionId])),
    );

    expect(store.summary(course.id).courseComplete).toBe(true);
    expect(store.summary(course.id).percent).toBe(100);
    expect(store.summary(course.id).completedSections).toBe(9);
  });

  it('ignores optional questions and never auto-completes empty lessons', () => {
    const lesson: Lesson = {
      ...first,
      questions: [
        { ...first.questions[0]!, required: true },
        { ...first.questions[1]!, required: false },
      ],
    };

    expect(isLessonComplete(lesson, { [lesson.id]: { [lesson.questions[0]!.id]: '1' } })).toBe(
      true,
    );
    expect(isLessonComplete({ ...lesson, questions: [] }, {})).toBe(false);
  });

  it('rejects invalid submissions atomically', () => {
    const store = useProgressStore();

    expect(() =>
      store.submit(course.id, first.id, { [first.questions[0]!.id]: '1', unknown: 'x' }),
    ).toThrow();
    expect(store.answersFor(course.id)).toEqual({});
    expect(() => store.submit(course.id, 'missing', {})).toThrow();
  });

  it('handles corrupt or unavailable storage', () => {
    localStorage.setItem(STORAGE_KEY, '{bad');
    expect(useProgressStore().warningsByCourse[course.id]).toContain('could not be read');

    const repository = createLocalProgressRepository({
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('full');
      },
    });

    expect(repository.load().answers).toEqual({});
    expect(repository.save({})).toBe(false);
  });

  it('keeps current progress on save failure and warns the learner', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('quota');
    });

    const store = useProgressStore();
    store.submit(
      course.id,
      first.id,
      Object.fromEntries(first.questions.map((q) => [q.id, q.correctOptionId])),
    );

    expect(store.isComplete(course.id, first.id)).toBe(true);
    expect(store.warningsByCourse[course.id]).toContain('could not be saved');
    vi.restoreAllMocks();
  });

  it('hydrates only valid correct answers from the current curriculum', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        answers: {
          [first.id]: { [first.questions[0]!.id]: '0', [first.questions[1]!.id]: 'a', fake: '1' },
          fake: { q: '1' },
        },
      }),
    );

    const store = useProgressStore();
    expect(store.answersFor(course.id)).toEqual({ [first.id]: { [first.questions[1]!.id]: 'a' } });
  });
});

it('preserves legacy enterprise progress and isolates the second course across reloads', () => {
  const migration = courses.find((c) => c.id === 'vue-2-to-3')!;
  const answers = Object.fromEntries(first.questions.map((q) => [q.id, q.correctOptionId]));

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: course.version, answers: { [first.id]: answers } }),
  );

  const store = useProgressStore();
  expect(store.summary(course.id).completedLessons).toBe(1);
  expect(store.summary(migration.id).completedLessons).toBe(0);

  const original = localStorage.getItem(STORAGE_KEY);

  for (const lesson of migration.sections.flatMap((s) => s.lessons)) {
    store.submit(
      migration.id,
      lesson.id,
      Object.fromEntries(lesson.questions.map((q) => [q.id, q.correctOptionId])),
    );
  }

  expect(store.summary(migration.id)).toMatchObject({
    completedLessons: 6,
    completedSections: 3,
    percent: 100,
    courseComplete: true,
  });
  expect(store.summary(course.id)).toMatchObject({
    completedLessons: 1,
    completedSections: 0,
    courseComplete: false,
  });
  expect(localStorage.getItem(STORAGE_KEY)).toBe(original);

  setActivePinia(createPinia());
  expect(useProgressStore().summary(migration.id).courseComplete).toBe(true);
  expect(useProgressStore().summary(course.id).completedLessons).toBe(1);
});

it('does not accept a lesson from the wrong course', () => {
  const store = useProgressStore();

  expect(() => store.submit('vue-2-to-3', first.id, {})).toThrow('Unknown lesson');
  expect(() => store.submit('missing', first.id, {})).toThrow('Unknown course');
  expect(store.summary('vue-2-to-3').completedLessons).toBe(0);
});

it('contains corruption and incompatible versions within their own course', () => {
  const migration = courses.find((c) => c.id === 'vue-2-to-3')!;
  const firstMigration = migration.sections[0]!.lessons[0]!;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: 1,
      answers: {
        [first.id]: Object.fromEntries(first.questions.map((q) => [q.id, q.correctOptionId])),
      },
    }),
  );
  localStorage.setItem(
    storageKey(migration),
    JSON.stringify({
      version: 999,
      answers: {
        [firstMigration.id]: Object.fromEntries(
          firstMigration.questions.map((q) => [q.id, q.correctOptionId]),
        ),
      },
    }),
  );

  const store = useProgressStore();
  expect(store.summary(course.id).completedLessons).toBe(1);
  expect(store.warningsByCourse[course.id]).toBe('');
  expect(store.warningsByCourse[migration.id]).toContain('incompatible');
  expect(store.summary(migration.id).completedLessons).toBe(0);
});

it('namespaces reused lesson IDs by course at the persistence boundary', () => {
  const anotherCourse = { ...course, id: 'another-course' };
  const repo = createLocalProgressRepository(localStorage, anotherCourse);

  repo.save({
    [first.id]: Object.fromEntries(first.questions.map((q) => [q.id, q.correctOptionId])),
  });

  expect(createLocalProgressRepository(localStorage, course).load().answers).toEqual({});
  expect(repo.load().answers[first.id]).toBeDefined();
});
