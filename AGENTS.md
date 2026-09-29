# Agent and maintainer guide

This document is for people and coding agents changing the repo. Learners can ignore it.

## Commands

Requires Node 22.12+ (Node 22 LTS recommended).

```sh
npm ci
npm run dev      # Vite dev server (127.0.0.1)
npm test         # Vitest
npm run build    # vue-tsc --noEmit && vite build
npm run format:check
```

Run `npm test` and `npm run build` before considering a change complete.

## Routing and deployment

- Hash routing (`/#/courses/...`) so static hosting works without rewrite rules.
- Library: `/#/`; courses: `/#/courses/:courseId`, plus section and lesson segments.
- Legacy `/#/sections/...` bookmarks redirect into the enterprise course.
- Course, section, and lesson routes are lazy-loaded; unknown IDs show the not-found page.
- Production output is `dist/`. Static hosting metadata for OpenAI Sites is in `.openai/hosting.json`.

## Architecture

```text
src/
  app/                    # composition root, router, shell, theme, optional WebMCP
  features/
    course/
      model/schema.ts     # discriminated content union and course contracts
      content/            # catalog.ts registers typed course datasets
      components/         # content renderer and controlled knowledge-check UI
      pages/              # home, section, lesson, not-found route entries
      index.ts            # public API
    progress/
      model/              # pure rules, course-scoped store and reactive view
      services/storage.ts # localStorage adapter, validation, versioning, failures
      index.ts            # public API
```

**Dependency direction:** `app → course + progress`; `progress → course` public API only; pages coordinate progress through that API. Course schemas and content never import progress.

- `KnowledgeCheck` accepts saved answers and emits submissions; it does not know storage or Pinia.
- The store owns grading and commands; `storage.ts` owns serialization.
- No backend or TanStack Query dependency in this app—remote-state examples in lessons are instructional snippets only.

This repo demonstrates feature ownership, typed boundaries, lazy routes, pure domain functions, and a replaceable persistence adapter. Folder boundaries are conventions; a larger team should enforce them with import rules or packages. Code samples that mention `router`, `auth`, or `queryClient` are focused excerpts, not runnable mini-apps.

## Add or extend a lesson

| Course                             | Content module                             |
| ---------------------------------- | ------------------------------------------ |
| Enterprise Vue for React engineers | `src/features/course/content/lessons.ts`   |
| Vue 2 → Vue 3 migration            | `src/features/course/content/migration.ts` |

Add a lesson with a course-unique `id`, title, duration, summary, `blocks`, and `questions`. Section IDs must be unique within the course; question IDs within the lesson; course IDs globally unique.

`ContentBlock` is a discriminated union: `text`, `comparison`, `code`, `video`, `resources`. TypeScript enforces required fields. Page components usually do not need changes.

**Questions:** stable option IDs, one `correctOptionId`, explanation, `required` flag. Every lesson needs at least one required question.

**Comparison blocks:** labeled `left` and `right` (React/Vue or Vue 2/Vue 3).

**Video blocks:** YouTube video ID, title, attribution; optional `focus`, `note`, `startSeconds` (chapter). Embeds load after click with an external fallback. Chapter offsets apply to embed and fallback.

Use trusted editorial content only. Text uses Vue interpolation, not raw HTML. Keep IDs stable to preserve learner progress.

Bump `course.version` when changes invalidate saved answers; incompatible storage starts a fresh session with a visible warning. This curriculum is representative starter material, not a full multi-day course.

## Add another course

Export a `Course` from a new module and register it in `src/features/course/content/catalog.ts`. Provide stable IDs, presentation metadata, nonempty sections, lessons, and required checks. No router, page, or store changes required. Progress keys derive from course ID; each course owns its curriculum version. Content edits that do not invalidate answers should leave `version` unchanged.

## Completion and persistence

- Only submitted **correct** answers persist. Wrong answers show feedback and can be retried.
- Correct answers stay locked in the form once earned.
- Lesson complete when all **required** questions have correct saved answers.
- Section complete when all its lessons complete; course complete when all sections complete.
- Percent progress uses that course’s lesson count; a partial lesson does not count as finished.
- Completion flags are **derived**, never stored separately.

**Storage keys**

- Enterprise course: `vue-architecture-lab:progress:v1` (original shape preserved for existing learners).
- Other courses: `vue-architecture-lab:progress:course:<courseId>`.

Documents are validated against the course’s current IDs and answer keys on load. Corrupting one course’s data does not reset another. Store commands require an explicit `courseId`; `useCourseProgress` scopes reactivity per course (no global active-course singleton).

Handle corrupt storage, unavailable storage, and quota errors with visible warnings while keeping in-session state usable. Progress is per browser origin; no cloud sync; answer keys are client-side by design.

## Verification

`npm test` covers required/optional grading, retries, partial vs complete sections, full-course aggregation, persistence across store init, corrupt storage, save failures, atomic invalid-submission rejection, content integrity, every course/section/lesson route, legacy redirects, invalid cross-course IDs, persisted enterprise progress, independent course completion, isolated corruption, and interactive course-switch/quiz flow (Vue Test Utils).

## WebMCP (optional)

Feature-detected in `src/app/webmcp.ts` via `document.modelContext`. Unsupported browsers are unaffected.

| Tool                   | Behavior                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| `read_course_progress` | Read-only array of courses with progress; does not change answers.                          |
| `open_course_lesson`   | Requires `courseId` and `lessonId`; navigates via the real router. Does not submit answers. |

Uses the real Pinia store and router.

## Curriculum references

Lessons link to official docs. Primary sources: [Vue guide](https://vuejs.org/guide/), [Pinia](https://pinia.vuejs.org/), [Vue Router](https://router.vuejs.org/), [TanStack Vue Query](https://tanstack.com/query/latest/docs/framework/vue/overview), [Vitest](https://vitest.dev/), [Vue Test Utils](https://test-utils.vuejs.org/), [Nuxt 4](https://nuxt.com/docs/4.x/).

Migration course also uses the [Vue 3 migration guide](https://v3-migration.vuejs.org/), [Vue 2 EOL](https://v2.vuejs.org/eol/), and linked router/Vuex/Test Utils/Nuxt migration pages. Historical videos are labeled; old package pins in talks are not current guidance.

## Video catalog

Titles and creators were checked against YouTube oEmbed on 2026-09-29. Availability can vary by region or creator settings; players include “Watch on YouTube.” Videos are optional for completion.

| Lesson                                    | Video                                                                                                                 | Creator           |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------- |
| From render snapshots to a reactive graph | [Reactivity in Vue 3 — How does it work?](https://www.youtube.com/watch?v=NZfNS4sJ8CI)                                | Vue Mastery       |
| Computed values, watchers & cleanup       | [Vue 3 Watch vs WatchEffect! Watch OUT, you'll probably get this wrong!](https://www.youtube.com/watch?v=QkadKspKoJo) | Program With Erik |
| Component contracts & slots               | [Vue Slots Simplified](https://www.youtube.com/watch?v=orGcdmCRCc0)                                                   | LearnVue          |
| Composables with explicit lifetimes       | [Build your own Custom Composables in Vue](https://www.youtube.com/watch?v=bcZM3EogPJE)                               | Vue Mastery       |
| Scoped dependencies with provide / inject | [Dependency Injection in Vue 3 with Provide and Inject](https://www.youtube.com/watch?v=dOxjzgZpTfk)                  | Justin Brooks     |
| Shared client state with Pinia            | [Pinia Simplified](https://www.youtube.com/watch?v=LfWpPRId5N0)                                                       | LearnVue          |
| Routes as feature entry points            | [2 Vue Router Lazy Loading — Vue Router Tutorial](https://www.youtube.com/watch?v=jnE5FOYuuDc)                        | Tony Xhepa        |
| Navigation guards & authorization         | [#28 - Route Guards - Vue 3 (Options API) Tutorial](https://www.youtube.com/watch?v=z23GR2xRP38)                      | KoderHQ           |
| Organize around features                  | [Scalable Architectures with Vue Micro Frontends…](https://www.youtube.com/watch?v=B5uz-wce-ks)                       | VueConf Toronto   |
| Keep transport at the edge                | [Stop Writing Types AND Validation (Use Zod)](https://www.youtube.com/watch?v=ZPa9I_pvRU0)                            | Austin Davis      |
| Server cache versus client state          | [Fetching data the right way — React/Tanstack Query Series - Part 1](https://www.youtube.com/watch?v=mg1slc6GU8U)     | Akilesh Rao       |
| Mutations & invalidation                  | [TanStack React Query v5 - Full Guide…](https://www.youtube.com/watch?v=_EuPZrr3faU)                                  | Coding in Flow    |
| Test rules before rendering               | [Vitest Simplified](https://www.youtube.com/watch?v=snCLQmINqCU)                                                      | LearnVue          |
| Test interaction & async updates          | [Using Vue Test Utils in Vitest](https://www.youtube.com/watch?v=iNl6TA29hBM)                                         | LearnVue          |
| Errors, recovery & observability          | [Sentry 101: Error Monitoring For Frontend Applications](https://www.youtube.com/watch?v=cl8tPBI4qUc)                 | Sentry            |
| Performance, accessibility & i18n         | [I Didn't Know This Vue Best Practice...](https://www.youtube.com/watch?v=9JRT60ESGiI)                                | LearnVue          |
| Nuxt 4: server & browser boundaries       | [Nuxt 4 - An overview!](https://www.youtube.com/watch?v=rCT54d8sMWk)                                                  | Alexander Lichter |
| SSR data, layers & hydration              | [useAsyncData vs. useFetch 🤯](https://www.youtube.com/watch?v=0X-aOpSGabA)                                           | Alexander Lichter |

**Migration course videos**

- Differences: [Vue 3 — What’s New? What Changed?](https://www.youtube.com/watch?v=A5cVyjrKx_Q), Academind.
- Ecosystem: [Upgrading your app to Vue 3](https://www.youtube.com/watch?v=_Zu7m5Xdcuc), Vue Mastery.
- Planning / compat / release: [How to migrate a large app to Vue 3](https://www.youtube.com/watch?v=lPfp9XZINrg), Vue Mastery (chapters at 7:38, 13:50, 30:39).

The six migration lessons reuse chapters from the case-study video; question completion is learning progress only, not migration certification.

When adding or changing videos, verify titles via oEmbed and keep `startSeconds` aligned with chapter links.
