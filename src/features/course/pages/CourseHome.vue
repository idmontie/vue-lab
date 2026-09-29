<script setup lang="ts">
import { Play, Clock3, BookOpen, CheckCircle2 } from 'lucide-vue-next';
import { computed } from 'vue';
import { useLearningCourse } from '../model/useLearningCourse';
import { useCourseProgress } from '../../progress';

const { course, courseUrl } = useLearningCourse();
const progress = useCourseProgress(course);

const nextSection = computed(() =>
  course.value.sections.find((s) => s.lessons.some((l) => l.id === progress.nextLesson?.id)),
);

const nextUrl = computed(() =>
  nextSection.value && progress.nextLesson
    ? courseUrl.value + '/sections/' + nextSection.value.id + '/lessons/' + progress.nextLesson.id
    : courseUrl.value,
);
</script>

<template>
  <div class="breadcrumbs">
    <RouterLink to="/">Course library</RouterLink>
    <span>/</span>
    <span>{{ course.shortTitle }}</span>
  </div>

  <div class="eyebrow">{{ course.category }}</div>

  <div class="page-heading">
    <h1>
      {{ course.headline[0] }}
      <br />
      <span>{{ course.headline[1] }}</span>
    </h1>
    <p>{{ course.description }}</p>
  </div>

  <div class="home-top">
    <section class="continue-card">
      <div class="pill">
        {{
          progress.courseComplete
            ? 'COURSE COMPLETE'
            : progress.completedLessons
              ? 'KEEP YOUR MOMENTUM'
              : 'START YOUR JOURNEY'
        }}
      </div>

      <div class="continue-body">
        <div>
          <span class="overline">
            {{ nextSection?.title.toUpperCase() ?? course.title.toUpperCase() }}
          </span>
          <h2>
            {{ progress.courseComplete ? 'Your next skill. Earned.' : progress.nextLesson?.title }}
          </h2>
          <p>
            {{
              progress.courseComplete
                ? 'All required knowledge checks are complete. Revisit any lesson.'
                : progress.nextLesson?.summary
            }}
          </p>

          <RouterLink class="button primary" :to="nextUrl">
            <Play :size="15" fill="currentColor" />
            {{
              progress.courseComplete
                ? 'Review course'
                : progress.completedLessons
                  ? 'Continue learning'
                  : 'Start learning'
            }}
          </RouterLink>
        </div>

        <div class="framework-symbol" aria-hidden="true">
          <span>{{ course.fromLabel }}</span>
          <i>↗</i>
          <b>{{ course.toLabel }}</b>
        </div>
      </div>

      <div class="continue-meta">
        <span><Clock3 :size="14" /> Bite-sized lessons</span>
        <span><BookOpen :size="14" /> Learn · practice · check</span>
      </div>
    </section>

    <section class="progress-card">
      <div class="overline">YOUR PROGRESS</div>

      <div class="progress-dial" :style="{ '--progress': progress.percent + '%' }">
        <strong>{{ progress.percent }}<span>%</span></strong>
      </div>

      <h3>
        {{ progress.courseComplete ? 'Course complete. Well done.' : 'One lesson at a time.' }}
      </h3>
      <p>
        Complete knowledge checks
        <br />
        to make each lesson count.
      </p>

      <div class="progress-bottom">
        <CheckCircle2 :size="16" />
        {{ progress.completedSections }} of {{ progress.totalSections }} sections complete
      </div>
    </section>
  </div>

  <div class="mobile-progress">
    <strong>{{ progress.percent }}% complete</strong>
    <span>
      {{ progress.completedLessons }} / {{ progress.totalLessons }} lessons ·
      {{ progress.completedSections }} / {{ progress.totalSections }} sections
    </span>
  </div>

  <div v-if="progress.courseComplete" class="success-banner" role="status">
    Course complete — all {{ progress.totalLessons }} lessons and
    {{ progress.totalSections }} sections finished.
  </div>

  <div class="section-heading">
    <div>
      <h2>Your learning path</h2>
      <p>
        {{ progress.totalLessons }} lessons · {{ progress.totalSections }} sections · Learn at your
        own pace.
      </p>
    </div>
    <span class="section-count"
      >{{ String(progress.totalSections).padStart(2, '0') }} SECTIONS</span
    >
  </div>

  <div class="course-grid">
    <RouterLink
      v-for="(section, i) in course.sections"
      :key="section.id"
      class="section-card"
      :to="courseUrl + '/sections/' + section.id"
    >
      <div class="card-top">
        <span class="section-number">{{ String(i + 1).padStart(2, '0') }}</span>
        <span class="tag">{{ section.tag }}</span>
      </div>
      <h3>{{ section.title }}</h3>
      <p>{{ section.description }}</p>
      <div class="card-bottom">
        <span>
          {{ progress.sectionStatus(section.id).completed }} / {{ section.lessons.length }} lessons
          complete
        </span>
        <span class="tiny-circle">
          {{ progress.sectionStatus(section.id).complete ? '✓' : '+' }}
        </span>
      </div>
    </RouterLink>
  </div>
</template>
