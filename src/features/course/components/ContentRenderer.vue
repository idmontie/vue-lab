<script setup lang="ts">
import { ref } from 'vue';
import { Play, ExternalLink } from 'lucide-vue-next';
import type { ContentBlock } from '../model/schema';

defineProps<{ blocks: ContentBlock[] }>();

const loadedVideos = ref<Record<string, boolean>>({});
</script>

<template>
  <div class="lesson-content">
    <template v-for="(block, i) in blocks" :key="i">
      <section v-if="block.type === 'text'" class="text-block">
        <h2>{{ block.heading }}</h2>
        <p v-for="paragraph in block.body" :key="paragraph">{{ paragraph }}</p>
      </section>

      <div v-else-if="block.type === 'comparison'" class="comparison">
        <div>
          <span class="overline">{{ block.left.label }}</span>
          <p>{{ block.left.text }}</p>
        </div>
        <div>
          <span class="overline">{{ block.right.label }}</span>
          <p>{{ block.right.text }}</p>
        </div>
      </div>

      <figure v-else-if="block.type === 'code'" class="code-block">
        <figcaption>
          <span>{{ block.filename }}</span>
          <span>{{ block.language }}</span>
        </figcaption>
        <pre tabindex="0" aria-label="Code example"><code>{{ block.code }}</code></pre>
      </figure>

      <section v-else-if="block.type === 'video'" class="video-block">
        <h2>Watch &amp; connect</h2>
        <p v-if="block.focus" class="video-focus">{{ block.focus }}</p>
        <p v-if="block.note" class="video-note">{{ block.note }}</p>

        <div class="video-frame">
          <iframe
            v-if="loadedVideos[block.youtubeId]"
            :src="
              'https://www.youtube-nocookie.com/embed/' +
              block.youtubeId +
              '?start=' +
              (block.startSeconds ?? 0)
            "
            :title="block.title"
            allow="
              accelerometer;
              autoplay;
              clipboard-write;
              encrypted-media;
              gyroscope;
              picture-in-picture;
            "
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>

          <button v-else class="video-placeholder" @click="loadedVideos[block.youtubeId] = true">
            <span class="video-play"><Play :size="23" fill="currentColor" /></span>
            <strong>{{ block.title }}</strong>
            <span>{{ block.author }} · Load YouTube video</span>
          </button>
        </div>

        <p class="video-caption">
          Video unavailable here?
          <a
            :href="
              'https://www.youtube.com/watch?v=' +
              block.youtubeId +
              '&t=' +
              (block.startSeconds ?? 0)
            "
            target="_blank"
            rel="noopener noreferrer"
          >
            Watch on YouTube
            <ExternalLink :size="13" />
          </a>
        </p>
      </section>

      <section v-else-if="block.type === 'resources'" class="resource-block">
        <h2>Go deeper</h2>
        <a
          v-for="link in block.links"
          :key="link.url"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ link.title }}
          <ExternalLink :size="16" />
        </a>
      </section>
    </template>
  </div>
</template>
