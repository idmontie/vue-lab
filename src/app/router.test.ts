import { expect, it, vi } from 'vitest';

vi.stubGlobal('scrollTo', vi.fn());

import { router } from './router';
import { courses, enterpriseCourse } from '../features/course';

it('navigates every course, section, and lesson with course-scoped IDs', async () => {
  for (const course of courses) {
    const base = '/courses/' + course.id;

    await router.push(base);
    expect(router.currentRoute.value.name).toBe('course');
    expect(document.title).toContain(course.title);

    for (const section of course.sections) {
      await router.push(base + '/sections/' + section.id);
      expect(router.currentRoute.value.name).toBe('section');

      for (const lesson of section.lessons) {
        await router.push(base + '/sections/' + section.id + '/lessons/' + lesson.id);
        expect(router.currentRoute.value.name).toBe('lesson');
        expect(document.title).toContain(lesson.title);
      }
    }
  }
});

it('redirects legacy bookmarks to the enterprise course', async () => {
  await router.push('/sections/reactivity');
  expect(router.currentRoute.value.path).toBe('/courses/enterprise-vue/sections/reactivity');

  await router.push('/sections/reactivity/lessons/reactive-graph?from=bookmark');
  expect(router.currentRoute.value.params.courseId).toBe(enterpriseCourse.id);
  expect(router.currentRoute.value.name).toBe('lesson');
  expect(router.currentRoute.value.query.from).toBe('bookmark');
});

it('rejects invalid course, section, and cross-course lesson combinations', async () => {
  for (const path of [
    '/courses/missing',
    '/courses/vue-2-to-3/sections/reactivity',
    '/courses/enterprise-vue/sections/reactivity/lessons/what-changes',
    '/sections/missing',
    '/missing',
  ]) {
    await router.push(path);
    expect(router.currentRoute.value.name).toBe('not-found');
  }
});

it('enforces complete curriculum contracts per course', () => {
  expect(new Set(courses.map((c) => c.id)).size).toBe(courses.length);

  for (const course of courses) {
    const lessons = course.sections.flatMap((s) => s.lessons);

    expect(lessons.length).toBeGreaterThan(0);
    expect(new Set(course.sections.map((s) => s.id)).size).toBe(course.sections.length);
    expect(new Set(lessons.map((l) => l.id)).size).toBe(lessons.length);

    for (const lesson of lessons) {
      expect(lesson.questions.some((q) => q.required)).toBe(true);
      expect(lesson.blocks.some((b) => b.type === 'video')).toBe(true);

      for (const q of lesson.questions) {
        expect(q.options.some((o) => o.id === q.correctOptionId)).toBe(true);
      }
    }
  }
});
