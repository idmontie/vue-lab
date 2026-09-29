import { createRouter, createWebHashHistory } from 'vue-router';
import { getCourse, enterpriseCourse } from '../features/course';

export const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      name: 'library',
      component: () => import('../features/course/pages/CourseLibrary.vue'),
    },
    {
      path: '/courses/:courseId',
      name: 'course',
      component: () => import('../features/course/pages/CourseHome.vue'),
    },
    {
      path: '/courses/:courseId/sections/:sectionId',
      name: 'section',
      component: () => import('../features/course/pages/SectionPage.vue'),
    },
    {
      path: '/courses/:courseId/sections/:sectionId/lessons/:lessonId',
      name: 'lesson',
      component: () => import('../features/course/pages/LessonPage.vue'),
    },
    // Preserve bookmarked URLs from the single-course release.
    {
      path: '/sections/:sectionId',
      redirect: (to) => ({
        name: 'section',
        params: { ...to.params, courseId: enterpriseCourse.id },
        query: to.query,
      }),
    },
    {
      path: '/sections/:sectionId/lessons/:lessonId',
      redirect: (to) => ({
        name: 'lesson',
        params: { ...to.params, courseId: enterpriseCourse.id },
        query: to.query,
      }),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../features/course/pages/NotFound.vue'),
    },
  ],
});

router.beforeEach((to) => {
  if (!['course', 'section', 'lesson'].includes(String(to.name))) return;

  const course = getCourse(String(to.params.courseId));
  const section = course?.sections.find((s) => s.id === to.params.sectionId);
  const invalid =
    !course ||
    (to.name !== 'course' && !section) ||
    (to.name === 'lesson' && !section?.lessons.some((l) => l.id === to.params.lessonId));

  if (invalid) return { name: 'not-found', params: { pathMatch: ['not-found'] } };
});

router.afterEach((to) => {
  const course = getCourse(String(to.params.courseId));
  const section = course?.sections.find((s) => s.id === to.params.sectionId);
  const lesson = section?.lessons.find((l) => l.id === to.params.lessonId);

  document.title = `${lesson?.title ?? section?.title ?? course?.title ?? (to.name === 'not-found' ? 'Page not found' : 'Course library')} · Vue Architecture Lab`;
});
