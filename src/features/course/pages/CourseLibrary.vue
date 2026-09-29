<script setup lang="ts">
import { BookOpen, Clock3, CheckCircle2 } from 'lucide-vue-next';
import { courses } from '../content/catalog';
import { useProgressStore } from '../../progress';

const progress = useProgressStore();

function minutes(courseId: string) {
  return courses
    .find((c) => c.id === courseId)!
    .sections.flatMap((s) => s.lessons)
    .reduce((sum, l) => sum + l.minutes, 0);
}
</script>

<template>
  <div class="eyebrow">YOUR COURSE LIBRARY</div>

  <div class="page-heading library-heading">
    <h1>
      One workspace.
      <br />
      <span>Your next skill.</span>
    </h1>
    <p>
      Build your Vue toolkit, one course at a time.
      <br />
      Choose a path and pick up where you left off.
    </p>
  </div>

  <div class="library-courses">
    <article
      v-for="(course, i) in courses"
      :key="course.id"
      class="library-course"
      :class="{ 'migration-card': course.id === 'vue-2-to-3' }"
    >
      <div class="library-card-top">
        <span class="pill">{{ course.category }}</span>
        <span class="library-number">{{ String(i + 1).padStart(2, '0') }}</span>
      </div>

      <h2>{{ course.title }}</h2>
      <p class="library-description">{{ course.description }}</p>

      <div class="library-meta">
        <span>
          <BookOpen :size="16" />
          {{ course.sections.length }} sections ·
          {{ progress.summary(course.id).totalLessons }} lessons
        </span>
        <span>
          <Clock3 :size="16" />
          {{ minutes(course.id) }} min + optional videos
        </span>
      </div>

      <ul class="course-topics">
        <li v-for="section in course.sections" :key="section.id">{{ section.title }}</li>
      </ul>

      <div class="library-progress">
        <div>
          <span>
            {{ progress.summary(course.id).completedLessons }} /
            {{ progress.summary(course.id).totalLessons }} lessons complete
          </span>
          <strong>{{ progress.summary(course.id).percent }}%</strong>
        </div>
        <div class="track">
          <span :style="{ width: progress.summary(course.id).percent + '%' }"></span>
        </div>
      </div>

      <p v-if="progress.summary(course.id).courseComplete" class="library-complete">
        <CheckCircle2 :size="16" />
        Course complete
      </p>

      <RouterLink :to="'/courses/' + course.id" class="button primary">
        {{
          progress.summary(course.id).courseComplete
            ? 'Review course'
            : progress.summary(course.id).completedLessons
              ? 'Continue course'
              : 'Explore course'
        }}
      </RouterLink>
    </article>
  </div>

  <p class="library-footnote">
    Each course has its own progress. Correct answers complete lessons, sections, and then the
    course. Saved on this browser and device.
  </p>
</template>
