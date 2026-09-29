import { computed, reactive, type Ref } from 'vue';
import type { Course } from '../../course';
import { useProgressStore } from './store';

// A view of an explicit course; no mutable global "active course" state.
export function useCourseProgress(course: Ref<Course>) {
  const store = useProgressStore();
  const summary = computed(() => store.summary(course.value.id));

  return reactive({
    answers: computed(() => store.answersFor(course.value.id)),
    warning: computed(() => store.warningsByCourse[course.value.id] ?? ''),
    completedLessons: computed(() => summary.value.completedLessons),
    completedSections: computed(() => summary.value.completedSections),
    totalLessons: computed(() => summary.value.totalLessons),
    totalSections: computed(() => summary.value.totalSections),
    percent: computed(() => summary.value.percent),
    courseComplete: computed(() => summary.value.courseComplete),
    nextLesson: computed(() => summary.value.nextLesson),
    submit: (id: string, answers: Record<string, string>) =>
      store.submit(course.value.id, id, answers),
    isComplete: (id: string) => store.isComplete(course.value.id, id),
    sectionStatus: (id: string) => store.sectionStatus(course.value.id, id),
  });
}
