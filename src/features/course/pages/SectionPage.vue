<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { CheckCircle2, Clock3, BookOpen } from 'lucide-vue-next';
import { useLearningCourse } from '../model/useLearningCourse';
import { useCourseProgress } from '../../progress';

const route = useRoute();
const { course, courseUrl } = useLearningCourse();
const progress = useCourseProgress(course);

const section = computed(() => course.value.sections.find((s) => s.id === route.params.sectionId));
const index = computed(() => course.value.sections.findIndex((s) => s.id === section.value?.id));
const status = computed(() => progress.sectionStatus(section.value?.id ?? ''));
</script>

<template>
  <template v-if="section">
    <div class="breadcrumbs">
      <RouterLink to="/">Course library</RouterLink>
      <span>/</span>
      <RouterLink :to="courseUrl">Course overview</RouterLink>
      <span>/</span>
      <span>Section {{ String(index + 1).padStart(2, '0') }}</span>
    </div>

    <div class="eyebrow">{{ section.tag }}</div>
    <h1 class="section-title">{{ section.title }}</h1>
    <p class="section-description">{{ section.description }}</p>

    <div class="section-summary">
      <span><BookOpen :size="17" /> {{ section.lessons.length }} lessons</span>
      <span>
        <Clock3 :size="17" />
        {{ section.lessons.reduce((n, l) => n + l.minutes, 0) }} min of starter material
      </span>
      <span>
        <CheckCircle2 :size="17" />
        {{ status.completed }} / {{ status.total }} complete
      </span>
    </div>

    <div class="track">
      <span :style="{ width: (status.completed / status.total) * 100 + '%' }"></span>
    </div>

    <div v-if="status.complete" class="success-banner" role="status">
      <CheckCircle2 :size="20" />
      Section complete. Your progress counts toward the full course.
    </div>

    <div class="section-heading">
      <div>
        <h2>Inside this section</h2>
        <p>Learn the concept, inspect the code, then check your reasoning.</p>
      </div>
    </div>

    <div class="lesson-list">
      <RouterLink
        v-for="(lesson, i) in section.lessons"
        :key="course.id + ':' + lesson.id"
        :to="courseUrl + '/sections/' + section.id + '/lessons/' + lesson.id"
        class="lesson-row"
      >
        <span class="lesson-index">
          <CheckCircle2 v-if="progress.isComplete(lesson.id)" :size="23" />
          <template v-else>{{ String(i + 1).padStart(2, '0') }}</template>
        </span>

        <div>
          <h3>{{ lesson.title }}</h3>
          <p>{{ lesson.summary }}</p>
          <span class="lesson-meta">
            {{ lesson.minutes }} min · {{ lesson.questions.length }}
            {{ lesson.questions.length === 1 ? 'question' : 'questions' }}
            <template v-if="lesson.blocks.some((b) => b.type === 'video')">
              · Video included
            </template>
          </span>
        </div>

        <span class="lesson-state">
          {{ progress.isComplete(lesson.id) ? 'Review lesson' : 'Open lesson' }}
        </span>
      </RouterLink>
    </div>

    <aside class="bridge-note">
      <span class="eyebrow">KEEP THE PURPOSE IN VIEW</span>
      <p>{{ course.audienceNote }}</p>
    </aside>

    <div class="section-navigation">
      <RouterLink :to="courseUrl" class="button secondary">Course overview</RouterLink>

      <RouterLink
        v-if="course.sections[index + 1]"
        :to="courseUrl + '/sections/' + course.sections[index + 1]!.id"
        class="button secondary"
      >
        Next section
      </RouterLink>
    </div>
  </template>
</template>
