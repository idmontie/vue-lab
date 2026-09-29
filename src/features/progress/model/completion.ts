import type { CourseSection, Lesson } from '../../course';

export type Answers = Record<string, Record<string, string>>;

export function isLessonComplete(lesson: Lesson, answers: Answers): boolean {
  const required = lesson.questions.filter((q) => q.required);

  return (
    required.length > 0 && required.every((q) => answers[lesson.id]?.[q.id] === q.correctOptionId)
  );
}

export function sectionProgress(section: CourseSection, answers: Answers) {
  const completed = section.lessons.filter((l) => isLessonComplete(l, answers)).length;

  return {
    completed,
    total: section.lessons.length,
    complete: section.lessons.length > 0 && completed === section.lessons.length,
  };
}
