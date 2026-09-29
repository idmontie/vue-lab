<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Clock3, CheckCircle2 } from 'lucide-vue-next';
import { useLearningCourse } from '../model/useLearningCourse';
import { useCourseProgress } from '../../progress';
import ContentRenderer from '../components/ContentRenderer.vue';
import KnowledgeCheck from '../components/KnowledgeCheck.vue';

const route = useRoute();
const { course, courseUrl } = useLearningCourse();
const progress = useCourseProgress(course);

const section = computed(() => course.value.sections.find((s) => s.id === route.params.sectionId));
const lesson = computed(() => section.value?.lessons.find((l) => l.id === route.params.lessonId));

const allLessons = computed(() =>
  course.value.sections.flatMap((s) => s.lessons.map((l) => ({ sectionId: s.id, lesson: l }))),
);

const next = computed(
  () => allLessons.value[allLessons.value.findIndex((l) => l.lesson.id === lesson.value?.id) + 1],
);

function submit(answers: Record<string, string>) {
  if (lesson.value) progress.submit(lesson.value.id, answers);
}
</script>

<template>
  <template v-if="lesson && section">
    <div class="breadcrumbs">
      <RouterLink to="/">Course library</RouterLink>
      <span>/</span>
      <RouterLink :to="courseUrl">Overview</RouterLink>
      <span>/</span>
      <RouterLink :to="courseUrl + '/sections/' + section.id">{{ section.title }}</RouterLink>
      <span>/</span>
      <span>Lesson {{ section.lessons.findIndex((l) => l.id === lesson!.id) + 1 }}</span>
    </div>

    <div class="lesson-layout">
      <article>
        <div class="eyebrow">{{ section.subtitle }}</div>
        <h1 class="lesson-title">{{ lesson.title }}</h1>
        <p class="lesson-description">{{ lesson.summary }}</p>

        <div class="lesson-meta title-meta">
          <span><Clock3 :size="15" /> {{ lesson.minutes }} min</span>
          <span>{{ lesson.questions.length }} knowledge checks</span>
          <span v-if="progress.isComplete(lesson.id)" class="green">
            <CheckCircle2 :size="15" />
            Complete
          </span>
        </div>

        <ContentRenderer :key="course.id + ':' + lesson.id" :blocks="lesson.blocks" />

        <KnowledgeCheck
          :key="course.id + ':' + lesson.id"
          :lesson="lesson"
          :saved="progress.answers[lesson.id] ?? {}"
          @submit="submit"
        />

        <div class="lesson-next">
          <RouterLink :to="courseUrl + '/sections/' + section.id" class="button secondary">
            Back to section
          </RouterLink>

          <RouterLink
            v-if="progress.isComplete(lesson.id) && next"
            :to="courseUrl + '/sections/' + next.sectionId + '/lessons/' + next.lesson.id"
            class="button primary"
          >
            Next lesson
          </RouterLink>

          <RouterLink
            v-else-if="progress.isComplete(lesson.id)"
            :to="courseUrl"
            class="button primary"
          >
            View course progress
          </RouterLink>
        </div>
      </article>

      <aside class="lesson-outline">
        <span class="overline">IN THIS SECTION</span>

        <RouterLink
          v-for="(item, i) in section.lessons"
          :key="item.id"
          :to="courseUrl + '/sections/' + section.id + '/lessons/' + item.id"
        >
          <span>{{ String(i + 1).padStart(2, '0') }}</span>
          {{ item.title }}
          <CheckCircle2 v-if="progress.isComplete(item.id)" :size="16" />
        </RouterLink>

        <div class="outline-note">
          Progress follows understanding.
          <br />
          Complete the required knowledge checks to finish a lesson.
        </div>
      </aside>
    </div>
  </template>
</template>
