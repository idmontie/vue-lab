# Vue Architecture Lab

Interactive Vue 3 courses in the browser—read lessons, try short knowledge checks, and pick up where you left off. Built with Vue 3, TypeScript, Vue Router, Pinia, and Vite.

If you already know React (or Vue 2) and want a structured path into modern Vue architecture, this repo is for you. It is a **learning app**, not a migration tool for your production codebase.

## Courses

| Course                                 | What you get           | Rough reading time |
| -------------------------------------- | ---------------------- | ------------------ |
| **Enterprise Vue for React engineers** | 9 sections, 18 lessons | ~275 min           |
| **Vue 2 → Vue 3: a practical upgrade** | 3 sections, 6 lessons  | ~90 min            |

Each lesson mixes explanations, code samples, links, optional YouTube videos, and quiz questions. Videos are extras—they are not required to mark a lesson complete. The migration track covers runtime differences, component contracts, dependency audits, direct upgrades, the compatibility build, ecosystem updates, verification, and rollout planning.

## Quick start

**Requirements:** Node 22.12+ (Node 22 LTS is a safe choice).

```sh
git clone <your-fork-or-upstream-url>
cd vue-architecture-lab
npm ci
npm run dev
```

Open the URL Vite prints in the terminal (by default on `127.0.0.1`). Run the test suite and production build anytime:

```sh
npm test
npm run build
```

The built site lives in `dist/` and can be served as static files.

## How it works

- Open the **course library** at the app root, choose a course, and work through sections and lessons.
- **Required** quiz questions must be answered correctly to finish a lesson; you can retry until you get them right.
- Progress is saved in your browser (`localStorage`) for each course separately. Clearing site data or using another browser starts fresh—there is no account or cloud sync.
- URLs use hash routing (for example `/#/courses/enterprise-vue/...`), so bookmarks and refresh work on simple static hosts without special server config.

## React → Vue at a glance

Handy if you are taking the enterprise course:

| React                   | Vue                           | Note                                                 |
| ----------------------- | ----------------------------- | ---------------------------------------------------- |
| Function component      | SFC `script setup` + template | Setup runs once per instance.                        |
| `useState`              | `ref` / `reactive`            | Use `.value` for refs in JS.                         |
| `useMemo`               | `computed`                    | Keep getters pure.                                   |
| `useEffect`             | `watch` / `watchEffect`       | Prefer computed for derived state; clean up effects. |
| Custom hook             | Composable                    | Create state inside for per-instance data.           |
| Context                 | `provide` / `inject`          | Scoped dependency injection.                         |
| Redux / Zustand         | Pinia                         | Use `storeToRefs` when destructuring state.          |
| Render props / children | Slots                         | Caller supplies rendering via the child’s contract.  |
| React Router            | Vue Router                    | Lazy routes as feature entry points.                 |
| TanStack React Query    | TanStack Vue Query            | Keep query inputs reactive.                          |
| Next.js                 | Nuxt 4                        | Similar ideas, different framework conventions.      |

## Project layout

```text
src/
  app/           # App shell, router, global styles
  features/
    course/      # Lessons, pages, content renderer, quizzes
    progress/    # Completion rules and browser persistence
```

The app is intentionally small: typed course content, a shared renderer, and progress stored locally. For architecture rules, content editing, tests, and optional browser agent hooks, see **[AGENTS.md](./AGENTS.md)**.

## Learn more (official docs)

Lessons point to primary sources, including the [Vue guide](https://vuejs.org/guide/), [Pinia](https://pinia.vuejs.org/), [Vue Router](https://router.vuejs.org/), [Vitest](https://vitest.dev/), [Vue Test Utils](https://test-utils.vuejs.org/), [TanStack Vue Query](https://tanstack.com/query/latest/docs/framework/vue/overview), and [Nuxt 4](https://nuxt.com/docs/4.x/). The migration course centers on the [Vue 3 migration guide](https://v3-migration.vuejs.org/).

## Contributing

Issues and pull requests welcome. Before opening a PR, run `npm test`, `npm run build`, and `npm run format:check`. Content and structural conventions are documented in [AGENTS.md](./AGENTS.md).

## License

[MIT](./LICENSE)
