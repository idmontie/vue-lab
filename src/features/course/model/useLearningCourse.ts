import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { getCourse } from '../content/catalog';

export function useLearningCourse() {
  const route = useRoute();

  const course = computed(() => {
    const result = getCourse(String(route.params.courseId));
    if (!result) throw new Error('Course route has no valid course');
    return result;
  });

  const courseUrl = computed(() => '/courses/' + course.value.id);

  return { course, courseUrl };
}
