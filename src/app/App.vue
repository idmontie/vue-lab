<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { BookOpen, Library, Layers, Check, Code2 } from 'lucide-vue-next';
import { courses, getCourse } from '../features/course';
import { useProgressStore } from '../features/progress';

const route = useRoute();
const router = useRouter();
const progress = useProgressStore();

const activeCourse = computed(() => getCourse(String(route.params.courseId)));

const warning = computed(() =>
  activeCourse.value
    ? progress.warningsByCourse[activeCourse.value.id]
    : Object.values(progress.warningsByCourse).filter(Boolean).join(' '),
);

function switchCourse(event: Event) {
  const id = (event.target as HTMLSelectElement).value;
  if (getCourse(id)) void router.push('/courses/' + id);
}

function focusMain() {
  document.getElementById('main')?.focus();
}
</script>

<template>
  <div class="app-shell">
    <a class="skip" href="#main" @click.prevent="focusMain">Skip to content</a>

    <aside class="sidebar">
      <RouterLink to="/" class="brand">
        <span class="brand-mark">V</span>
        <span>
          Vue Architecture
          <span class="brand-sub">THE LEARNING LAB</span>
        </span>
      </RouterLink>

      <div class="sidebar-label">YOUR WORKSPACE</div>

      <RouterLink to="/" class="overview-link">
        <Library :size="18" />
        Course library
      </RouterLink>

      <template v-if="activeCourse">
        <label class="sidebar-label switch-label" for="course-switch">CURRENT COURSE</label>

        <select
          id="course-switch"
          class="course-switch"
          :value="activeCourse.id"
          @change="switchCourse"
        >
          <option v-for="course in courses" :key="course.id" :value="course.id">
            {{ course.shortTitle }}
          </option>
        </select>

        <RouterLink :to="'/courses/' + activeCourse.id" class="overview-link">
          <BookOpen :size="18" />
          Course overview
        </RouterLink>

        <div class="sidebar-label curriculum-label">
          CURRICULUM
          <span>{{ String(activeCourse.sections.length).padStart(2, '0') }}</span>
        </div>

        <nav aria-label="Course sections">
          <RouterLink
            v-for="(section, i) in activeCourse.sections"
            :key="section.id"
            :to="'/courses/' + activeCourse.id + '/sections/' + section.id"
            class="nav-section"
            :class="{ 'section-active': route.params.sectionId === section.id }"
          >
            <span class="nav-number">
              {{
                progress.sectionStatus(activeCourse.id, section.id).complete
                  ? '✓'
                  : String(i + 1).padStart(2, '0')
              }}
            </span>
            <span>{{ section.title }}</span>
          </RouterLink>
        </nav>
      </template>

      <template v-else>
        <div class="sidebar-label curriculum-label">
          YOUR COURSES
          <span>{{ courses.length }}</span>
        </div>

        <nav aria-label="Courses">
          <RouterLink
            v-for="(course, i) in courses"
            :key="course.id"
            :to="'/courses/' + course.id"
            class="nav-section"
          >
            <span class="nav-number">{{ String(i + 1).padStart(2, '0') }}</span>
            <span>{{ course.shortTitle }}</span>
          </RouterLink>
        </nav>
      </template>

      <div class="sidebar-footer">
        <Code2 :size="19" />
        <div>
          Built with Vue. Learned by doing.
          <small>Vue 3 · TypeScript · Composition API</small>
        </div>
      </div>
    </aside>

    <div class="main-shell">
      <header class="topbar">
        <span>
          <Layers :size="16" />
          PERSONAL LEARNING SPACE
        </span>
        <span class="save-status">
          <Check :size="14" />
          {{ warning ? 'Check saved progress' : 'Saved in this browser' }}
        </span>
      </header>

      <main id="main" tabindex="-1">
        <div v-if="warning" class="storage-warning" role="alert">{{ warning }}</div>
        <RouterView :key="String(route.params.courseId ?? 'library')" />
      </main>

      <footer class="main-footer">
        Learn the architecture. Practice the decisions.
        <span>VUE ARCHITECTURE LAB</span>
      </footer>
    </div>
  </div>
</template>
