import { ref } from 'vue';
import { defineStore } from 'pinia';
import { courses, getCourse } from '../../course';
import { browserRepository } from '../services/storage';
import { isLessonComplete, sectionProgress, type Answers } from './completion';

export const useProgressStore = defineStore('learning-progress', () => {
  const repositories = new Map(courses.map((course) => [course.id, browserRepository(course)]));

  const answersByCourse = ref<Record<string, Answers>>({});
  const warningsByCourse = ref<Record<string, string>>({});

  for (const course of courses) {
    const initial = repositories.get(course.id)!.load();
    answersByCourse.value[course.id] = initial.answers;
    warningsByCourse.value[course.id] = initial.warning;
  }

  function requireCourse(courseId: string) {
    const course = getCourse(courseId);
    if (!course) throw new Error('Unknown course');
    return course;
  }

  function answersFor(courseId: string): Answers {
    requireCourse(courseId);
    return answersByCourse.value[courseId] ?? {};
  }

  function summary(courseId: string) {
    const course = requireCourse(courseId);
    const answers = answersFor(courseId);
    const lessons = course.sections.flatMap((section) => section.lessons);
    const completedLessons = lessons.filter((lesson) => isLessonComplete(lesson, answers)).length;
    const completedSections = course.sections.filter(
      (section) => sectionProgress(section, answers).complete,
    ).length;

    return {
      completedLessons,
      completedSections,
      totalLessons: lessons.length,
      totalSections: course.sections.length,
      percent: lessons.length ? Math.round((completedLessons / lessons.length) * 100) : 0,
      courseComplete: course.sections.length > 0 && completedSections === course.sections.length,
      nextLesson: lessons.find((lesson) => !isLessonComplete(lesson, answers)) ?? lessons[0],
    };
  }

  function submit(courseId: string, lessonId: string, submitted: Record<string, string>) {
    const course = requireCourse(courseId);
    const lesson = course.sections.flatMap((s) => s.lessons).find((l) => l.id === lessonId);

    if (!lesson) throw new Error('Unknown lesson in this course');

    for (const [id, answer] of Object.entries(submitted)) {
      const question = lesson.questions.find((q) => q.id === id);
      if (!question || !question.options.some((o) => o.id === answer))
        throw new Error('Invalid answer');
    }

    const answers = (answersByCourse.value[courseId] ??= {});

    for (const question of lesson.questions) {
      if (submitted[question.id] === question.correctOptionId) {
        (answers[lessonId] ??= {})[question.id] = question.correctOptionId;
      }
    }

    warningsByCourse.value[courseId] = repositories.get(courseId)!.save(answers)
      ? ''
      : 'Progress is available in this session, but could not be saved. Check your browser storage settings.';

    return isLessonComplete(lesson, answers);
  }

  function isComplete(courseId: string, lessonId: string) {
    const lesson = requireCourse(courseId)
      .sections.flatMap((s) => s.lessons)
      .find((l) => l.id === lessonId);

    return !!lesson && isLessonComplete(lesson, answersFor(courseId));
  }

  function sectionStatus(courseId: string, sectionId: string) {
    const section = requireCourse(courseId).sections.find((s) => s.id === sectionId);

    return section
      ? sectionProgress(section, answersFor(courseId))
      : { completed: 0, total: 0, complete: false };
  }

  return {
    answersByCourse,
    warningsByCourse,
    answersFor,
    summary,
    submit,
    isComplete,
    sectionStatus,
  };
});
