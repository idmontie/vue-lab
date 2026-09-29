<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { CheckCircle2 } from 'lucide-vue-next';
import type { Lesson } from '../model/schema';

const props = defineProps<{ lesson: Lesson; saved: Record<string, string> }>();
const emit = defineEmits<{ submit: [answers: Record<string, string>] }>();

const choices = reactive<Record<string, string>>({ ...props.saved });
const submitted = ref(false);

const ready = computed(() =>
  props.lesson.questions
    .filter((q) => q.required)
    .every((q) => !!(props.saved[q.id] || choices[q.id])),
);

const complete = computed(() =>
  props.lesson.questions
    .filter((q) => q.required)
    .every((q) => props.saved[q.id] === q.correctOptionId),
);

function submit() {
  if (!ready.value) return;
  submitted.value = true;
  emit('submit', { ...choices });
}
</script>

<template>
  <section class="knowledge-check">
    <div class="check-header">
      <div>
        <span class="eyebrow">PUT IT INTO PRACTICE</span>
        <h2>Check your understanding</h2>
      </div>
      <CheckCircle2 :size="25" />
    </div>

    <p class="check-intro">
      Answer every required question correctly to complete this lesson. You can retry as often as
      you need.
    </p>

    <form @submit.prevent="submit">
      <fieldset
        v-for="(question, i) in lesson.questions"
        :key="question.id"
        :disabled="saved[question.id] === question.correctOptionId"
      >
        <legend>
          {{ i + 1 }}. {{ question.prompt }}
          <span class="required-label">{{ question.required ? 'Required' : 'Optional' }}</span>
        </legend>

        <label
          v-for="option in question.options"
          :key="option.id"
          class="answer-option"
          :class="{
            selected: choices[question.id] === option.id,
            correct: saved[question.id] === option.id,
          }"
        >
          <input
            type="radio"
            :name="question.id"
            :value="option.id"
            v-model="choices[question.id]"
            @change="submitted = false"
          />
          <span>{{ option.text }}</span>
          <CheckCircle2 v-if="saved[question.id] === option.id" :size="17" />
        </label>

        <p
          v-if="saved[question.id] === question.correctOptionId || submitted"
          class="answer-feedback"
          :class="{ incorrect: saved[question.id] !== question.correctOptionId }"
          role="status"
        >
          <strong>
            {{
              saved[question.id] === question.correctOptionId
                ? 'Correct.'
                : 'Not quite — try again.'
            }}
          </strong>
          {{ question.explanation }}
        </p>
      </fieldset>

      <div class="check-actions">
        <button v-if="!complete" type="submit" class="button dark-button" :disabled="!ready">
          Check answers
        </button>

        <div v-else class="completion-message" role="status">
          <CheckCircle2 :size="19" />
          Lesson complete. Nicely reasoned.
        </div>

        <span v-if="!ready" class="hint">Choose an answer for each required question.</span>
      </div>
    </form>
  </section>
</template>
