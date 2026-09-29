import type { Course } from '../model/schema';

export const migrationCourse: Course = {
  id: 'vue-2-to-3',
  version: 1,
  title: 'Vue 2 → Vue 3: a practical upgrade',
  shortTitle: 'Vue 2 → Vue 3',
  description:
    'Understand the breaking changes, choose a realistic upgrade path, and plan a verified rollout. Six focused lessons for an existing Vue project.',
  category: 'MIGRATION · SHORT COURSE',
  headline: ['Understand the change.', 'Plan the upgrade.'],
  audienceNote:
    'You can keep the Options API while upgrading Vue. Separate required compatibility work from optional refactors, and use a real project’s dependency inventory to choose your path.',
  fromLabel: '2',
  toLabel: '3',
  sections: [
    {
      id: 'differences',
      title: 'What changes in Vue 3',
      subtitle: 'Runtime & component contracts',
      description: 'Identify the changes that matter without turning an upgrade into a rewrite.',
      tag: 'UNDERSTAND',
      lessons: [
        {
          id: 'what-changes',
          title: 'What changes—and what can stay',
          summary: 'Separate a framework upgrade from an optional application rewrite.',
          minutes: 15,
          blocks: [
            {
              type: 'text',
              heading: 'Upgrade the runtime, keep a deliberate scope',
              body: [
                'Vue 3 changes the runtime, some component contracts, and the surrounding ecosystem. It does not require you to rewrite every Options API component into Composition API, move every store to Pinia, adopt TypeScript, or switch build tools in the same pull request. Those may be useful follow-up projects; separate them so you can explain a regression.',
                'Vue 2 reached end of life on December 31, 2023. Vue 2.7 can be a temporary preparation step for older applications, but it is still Vue 2 and is not a long-term substitute for a supported Vue 3 destination. Decide who owns the transition and what dependencies prevent it.',
                'Vue 2 observes objects with getters/setters. Vue 3 uses proxies for reactive objects, so adding object properties and writing array indices no longer require Vue.set for change detection. Ref values use their own tracking mechanism. A Vue 2.7 Composition API backport does not replace Vue 2’s underlying reactivity behavior.',
              ],
            },
            {
              type: 'comparison',
              left: {
                label: 'Vue 2',
                text: 'Common entry: new Vue(...). Global plugins and configuration are attached to the Vue constructor.',
              },
              right: {
                label: 'Vue 3',
                text: 'createApp(...) creates an application instance. Install plugins and configuration on that app; an Options API root component still works.',
              },
            },
            {
              type: 'code',
              filename: 'main.before-and-after.ts',
              code: "// BEFORE: Vue 2\n// import Vue from 'vue'\n// Vue.use(plugin)\n// new Vue({ render: h => h(App) }).$mount('#app')\n\n// AFTER: Vue 3 (App can still use the Options API)\nimport { createApp } from 'vue'\nimport App from './App.vue'\nimport plugin from './plugin' // must support Vue 3\n\nconst app = createApp(App)\napp.use(plugin)\napp.mount('#app')",
              language: 'ts',
            },
            {
              type: 'text',
              heading: 'Try it in an upgrade branch',
              body: [
                'Pick one existing Options API component with data, computed, and methods. Keep that structure. List the specific breaking APIs it uses and change only those. In your PR description, separate required compatibility changes from optional refactors. The result should be reviewable as a framework upgrade.',
              ],
            },
            {
              type: 'video',
              youtubeId: 'A5cVyjrKx_Q',
              title: "Vue 3 - What's New? What Changed?",
              author: 'Academind',
              focus:
                'Compare the new application API, reactivity, and component capabilities. Identify improvements you can adopt later rather than turning them all into migration prerequisites.',
              startSeconds: 0,
              note: 'Historical walkthrough: use it for concepts and migration experience. Follow the linked current documentation for package versions and support status.',
            },
            {
              type: 'resources',
              links: [
                {
                  title: 'Composition API and Options API FAQ',
                  url: 'https://vuejs.org/guide/extras/composition-api-faq.html',
                },
                {
                  title: 'Vue 2 end of life',
                  url: 'https://v2.vuejs.org/eol/',
                },
                {
                  title: 'Vue 2.7 migration and reactivity caveats',
                  url: 'https://v2.vuejs.org/v2/guide/migration-vue-2-7',
                },
                {
                  title: 'Application-instance global API',
                  url: 'https://v3-migration.vuejs.org/breaking-changes/global-api.html',
                },
              ],
            },
          ],
          questions: [
            {
              id: 'rewrite-required',
              prompt: 'Must every Options API component be rewritten before moving to Vue 3?',
              options: [
                {
                  id: '0',
                  text: 'Yes, Composition API is mandatory',
                },
                {
                  id: '1',
                  text: 'No; keep supported Options API code and fix actual breaking changes',
                },
                {
                  id: '2',
                  text: 'Only if the application uses routes',
                },
              ],
              correctOptionId: '1',
              explanation:
                'A runtime upgrade does not require a wholesale API-style rewrite. Keeping the scope narrow makes regressions easier to isolate.',
              required: true,
            },
            {
              id: 'vue27-destination',
              prompt: 'What role can Vue 2.7 play in an upgrade plan?',
              options: [
                {
                  id: '0',
                  text: 'A temporary preparation step that still has Vue 2 runtime limitations',
                },
                {
                  id: '1',
                  text: 'A permanently supported equivalent of Vue 3',
                },
                {
                  id: '2',
                  text: 'A replacement for testing third-party dependencies',
                },
              ],
              correctOptionId: '0',
              explanation:
                'Vue 2.7 backports features, but remains on the Vue 2 runtime and the Vue 2 line is end-of-life.',
              required: true,
            },
          ],
        },
        {
          id: 'component-changes',
          title: 'Component contracts that break',
          summary: 'Update v-model, events, attributes, slots, and removed APIs deliberately.',
          minutes: 15,
          blocks: [
            {
              type: 'text',
              heading: 'Start with boundaries, not syntax churn',
              body: [
                'For a custom component’s default v-model, Vue 2 typically pairs a value prop with an input event; Vue 3 pairs modelValue with update:modelValue. Update both ends of the contract. Vue 3 also supports named models, replacing many .sync patterns. For migration work, explicit props and emits make the before/after easy to inspect.',
                'Declare emitted events. The .native modifier is removed, and listeners not declared as component events can fall through as attributes. A wrapper that both forwards an undeclared listener and emits the same event can fire it twice. Test the user interaction instead of only checking compilation.',
                'Filters and instance event-bus methods such as $on and $off are removed. Replace a display filter with a function or computed value; replace implicit event-bus ownership with explicit events, a scoped service, or a deliberately managed emitter. Slots now use a unified function-based API; wrapper components also need attention because $listeners is merged into $attrs and class/style participate in attributes.',
              ],
            },
            {
              type: 'comparison',
              left: {
                label: 'Vue 2',
                text: 'The parent’s <PriceInput v-model="price" /> expands to value + input in the child’s default contract.',
              },
              right: {
                label: 'Vue 3',
                text: 'The same parent syntax uses modelValue + update:modelValue. A single-file component may remain Options API.',
              },
            },
            {
              type: 'code',
              filename: 'PriceInput.vue',
              code: "<script>\nexport default {\n  props: { modelValue: { type: String, default: '' } },\n  emits: ['update:modelValue'],\n  methods: {\n    update(event) {\n      this.$emit('update:modelValue', event.target.value)\n    }\n  }\n}\n</script>\n\n<template>\n  <input :value=\"modelValue\" @input=\"update\" />\n</template>",
              language: 'vue',
            },
            {
              type: 'text',
              heading: 'Audit one real component',
              body: [
                'Choose a form wrapper with a slot and a model binding. Write a test that types a value, checks the parent state, and verifies one emitted event. Add a class, an aria-label, and a click listener from the parent; verify where each lands. Search the wider codebase for filters, $listeners, $scopedSlots, .native, and .sync, then record which results require a manual decision.',
              ],
            },
            {
              type: 'video',
              youtubeId: '_Zu7m5Xdcuc',
              title: 'Upgrading your app to Vue 3',
              author: 'Vue Mastery',
              focus:
                'Look for concrete changes to components and app setup. Compare each example with the current breaking-change reference before copying it.',
              startSeconds: 0,
              note: 'Historical walkthrough: use it for concepts and migration experience. Follow the linked current documentation for package versions and support status.',
            },
            {
              type: 'resources',
              links: [
                {
                  title: 'v-model migration',
                  url: 'https://v3-migration.vuejs.org/breaking-changes/v-model.html',
                },
                {
                  title: 'emits and duplicate native events',
                  url: 'https://v3-migration.vuejs.org/breaking-changes/emits-option.html',
                },
                {
                  title: 'Slots unification',
                  url: 'https://v3-migration.vuejs.org/breaking-changes/slots-unification.html',
                },
                {
                  title: 'Removed filters',
                  url: 'https://v3-migration.vuejs.org/breaking-changes/filters.html',
                },
                {
                  title: 'Removed events API',
                  url: 'https://v3-migration.vuejs.org/breaking-changes/events-api.html',
                },
                {
                  title: 'Full breaking-change checklist',
                  url: 'https://v3-migration.vuejs.org/breaking-changes/',
                },
              ],
            },
          ],
          questions: [
            {
              id: 'model-contract',
              prompt: 'Which pair is the default custom-component v-model contract in Vue 3?',
              options: [
                {
                  id: '0',
                  text: 'value and input',
                },
                {
                  id: '1',
                  text: 'modelValue and update:modelValue',
                },
                {
                  id: '2',
                  text: 'value and change',
                },
              ],
              correctOptionId: '1',
              explanation:
                'The prop and emitted event must change together. Named v-model bindings use their corresponding named prop and update event.',
              required: true,
            },
            {
              id: 'duplicate-click',
              prompt:
                'A wrapper forwards an undeclared click listener and also emits click. What deserves a regression test?',
              options: [
                {
                  id: '0',
                  text: 'Whether the handler fires twice',
                },
                {
                  id: '1',
                  text: 'Whether all components use script setup',
                },
                {
                  id: '2',
                  text: 'Whether the store was renamed',
                },
              ],
              correctOptionId: '0',
              explanation:
                'Listener fallthrough and component emission can both invoke the parent handler. Declare the intended event contract and test a single user action.',
              required: true,
            },
          ],
        },
      ],
    },
    {
      id: 'upgrade-paths',
      title: 'Choose your upgrade path',
      subtitle: 'Audit, direct upgrade & compat',
      description:
        'Build a dependency inventory and choose between a direct upgrade, compatibility bridge, or staged replacement.',
      tag: 'PLAN & MIGRATE',
      lessons: [
        {
          id: 'choose-a-path',
          title: 'Audit the project and choose a path',
          summary:
            'Choose direct upgrade, compatibility build, or staged replacement from evidence.',
          minutes: 15,
          blocks: [
            {
              type: 'text',
              heading: 'Make the dependency inventory first',
              body: [
                'Create a table for the runtime, router, store, UI library, custom plugins, build chain, test utilities, and any SSR framework. Record the installed version, a Vue 3-compatible target, breaking changes, replacement cost, and owner. A package marked “supports Vue 3” still needs a test of the features your app actually uses.',
                'Path A — direct upgrade: choose this when the app is small enough to migrate as one bounded change and its dependencies already have a workable Vue 3 path. Update the runtime, matching SFC compiler, loader/plugin, app entry, and affected contracts; exercise key routes before expanding the scope.',
                'Path B — compatibility build: choose this for a larger application whose dependencies and build chain can run on @vue/compat. Use warnings to track remaining work while upgrading components incrementally. Compatibility does not make private Vue 2 internals, unsupported UI libraries, or IE11 work in Vue 3.',
                'Path C — staged replacement: when a critical dependency blocks an in-place migration, replace that dependency or move an isolated area behind an explicit boundary. Separate entry points or independently mounted apps are a possible design, not a promise that Vue 2 and Vue 3 components can be nested freely. Plan navigation, shared data, styles, and rollback at that boundary.',
              ],
            },
            {
              type: 'code',
              filename: 'migration-inventory.txt',
              code: 'Area         Current        Vue 3 destination       Proof required\nRuntime      vue 2.x        chosen Vue 3 release    boot + key routes\nCompiler     Vue 2 tool     matching compiler-sfc   all SFCs compile\nRouter       router 3       router 4                guards + deep links\nState        vuex 3         vuex 4 (or later Pinia)  state persistence\nUI kit       record version supported release      forms + dialogs\nTests        VTU 1          VTU 2                   behavior assertions\nSSR/Nuxt     record version framework upgrade path  hydration + server\n\nDecision: direct / compat / staged replacement\nBlocker: ...  Owner: ...  First vertical slice: ...',
              language: 'text',
            },
            {
              type: 'text',
              heading: 'A practical direct-upgrade sequence',
              body: [
                '1. Save a reproducible lockfile and a green baseline for critical journeys. 2. Choose a compatible set of framework, compiler, router, and tooling versions; read each package’s migration guide. 3. Replace the entry point and update a representative route, form, and plugin. 4. Fix build and runtime errors, then test navigation, submission, and reload. 5. Roll out only after the validation gates in the final lesson pass. Use small commits so a failed step has an identifiable cause.',
                'Exercise: imagine a 40-screen app with a maintained router but an abandoned table component that reads private VNode fields. Which dependency should you prove or replace first? Write a two-sentence decision and a one-route spike plan before selecting the migration build.',
              ],
            },
            {
              type: 'video',
              youtubeId: 'lPfp9XZINrg',
              title: 'How to migrate a large app to Vue 3',
              author: 'Vue Mastery',
              focus:
                'Start at Phase 1: Prepare (7:38). Notice how preparation separates dependency and application work from the runtime switch.',
              startSeconds: 458,
              note: 'Historical walkthrough: use it for concepts and migration experience. Follow the linked current documentation for package versions and support status.',
            },
            {
              type: 'resources',
              links: [
                {
                  title: 'Migration build limitations',
                  url: 'https://v3-migration.vuejs.org/migration-build',
                },
                {
                  title: 'Framework-level upgrade recommendations',
                  url: 'https://v3-migration.vuejs.org/recommendations',
                },
                {
                  title: 'Nuxt upgrade guidance',
                  url: 'https://nuxt.com/docs/4.x/getting-started/upgrade',
                },
              ],
            },
          ],
          questions: [
            {
              id: 'compat-blocker',
              prompt:
                'A critical UI dependency relies on private Vue 2 VNode internals. What should you do before committing to compat?',
              options: [
                {
                  id: '0',
                  text: 'Assume compat fixes every dependency',
                },
                {
                  id: '1',
                  text: 'Prove compatibility or plan a supported replacement',
                },
                {
                  id: '2',
                  text: 'Convert only CSS class names',
                },
              ],
              correctOptionId: '1',
              explanation:
                'The compatibility build targets documented behavior. An incompatible dependency can block the runtime switch regardless of your component syntax.',
              required: true,
            },
            {
              id: 'scope-upgrade',
              prompt: 'Which plan makes a regression easiest to isolate?',
              options: [
                {
                  id: '0',
                  text: 'Upgrade Vue, rewrite all stores, replace CSS, and adopt TypeScript at once',
                },
                {
                  id: '1',
                  text: 'Keep unrelated refactors separate and validate one representative vertical slice',
                },
                {
                  id: '2',
                  text: 'Skip the baseline because the app currently works',
                },
              ],
              correctOptionId: '1',
              explanation:
                'A small, behavior-tested slice gives you evidence about the chosen path without mixing unrelated architectural changes.',
              required: true,
            },
          ],
        },
        {
          id: 'compat-upgrade',
          title: 'Run Vue 3 with the migration build',
          summary: 'Configure compat, resolve warnings, and move to the standard runtime.',
          minutes: 15,
          blocks: [
            {
              type: 'text',
              heading: 'Use compatibility as a temporary bridge',
              body: [
                '@vue/compat is a Vue 3 runtime with configurable Vue 2 behavior. Select the same exact release for vue, @vue/compat, and @vue/compiler-sfc. Replace the Vue 2 template compiler and choose a compatible loader or Vue plugin. Do not copy old package pins from a historical talk.',
                'Alias vue to @vue/compat, configure the template compiler for MODE: 2, and start the app. Compiler behavior and runtime compatibility are distinct: runtime configureCompat calls cannot fix a template already compiled with the wrong options. The example below is for an existing Vite-compatible setup; adapt the official configuration for webpack/Vue CLI instead of changing bundlers just to copy it.',
                'Group warnings by feature and owner. Fix a component’s behavior, test it, then opt that component into MODE: 3. Track dependencies that still require compatibility. Check transitions and visual behavior explicitly; a silent console is not proof that every behavior has been exercised.',
              ],
            },
            {
              type: 'code',
              filename: 'vite.config.ts',
              code: "import { defineConfig } from 'vite'\nimport vue from '@vitejs/plugin-vue'\n\nexport default defineConfig({\n  resolve: { alias: { vue: '@vue/compat' } },\n  plugins: [vue({\n    template: {\n      compilerOptions: { compatConfig: { MODE: 2 } }\n    }\n  })]\n})\n\n// After fixing and testing a component, in its options:\n// export default { compatConfig: { MODE: 3 }, ... }",
              language: 'ts',
            },
            {
              type: 'text',
              heading: 'Close the bridge deliberately',
              body: [
                'Create one issue per warning family with a reproduction route, owner, failing behavior test, and completion criterion. Keep any temporary compatibility flag beside the reason it exists. Avoid suppressing every warning and declaring the upgrade done.',
                'When application code and dependencies no longer rely on compatibility, remove the alias, @vue/compat dependency, compiler compatibility settings, and temporary compat flags. Run the full verification suite against the standard Vue 3 runtime, build a release candidate, and compare the key user journeys again. Treat that final switch as an explicit acceptance gate.',
              ],
            },
            {
              type: 'video',
              youtubeId: 'lPfp9XZINrg',
              title: 'How to migrate a large app to Vue 3',
              author: 'Vue Mastery',
              focus:
                'Start at Phase 2: Upgrade (13:50). Compare the real migration process with your warning inventory and component-by-component plan.',
              startSeconds: 830,
              note: 'Historical walkthrough: use it for concepts and migration experience. Follow the linked current documentation for package versions and support status.',
            },
            {
              type: 'resources',
              links: [
                {
                  title: 'Official migration-build configuration and workflow',
                  url: 'https://v3-migration.vuejs.org/migration-build',
                },
                {
                  title: 'Transition class changes',
                  url: 'https://v3-migration.vuejs.org/breaking-changes/transition.html',
                },
              ],
            },
          ],
          questions: [
            {
              id: 'compat-compiler',
              prompt: 'Why set compiler compatibility options as well as runtime behavior?',
              options: [
                {
                  id: '0',
                  text: 'Template compilation has compatibility decisions that runtime settings cannot retroactively change',
                },
                {
                  id: '1',
                  text: 'The compiler automatically removes incompatible dependencies',
                },
                {
                  id: '2',
                  text: 'It makes Vue 3 support IE11',
                },
              ],
              correctOptionId: '0',
              explanation:
                'The template compiler and runtime have different responsibilities. Configure the relevant layer and validate the generated behavior.',
              required: true,
            },
            {
              id: 'compat-done',
              prompt: 'When is the compat path finished?',
              options: [
                {
                  id: '0',
                  text: 'When warnings are globally silenced',
                },
                {
                  id: '1',
                  text: 'When the app boots once',
                },
                {
                  id: '2',
                  text: 'When dependencies and code work on standard Vue 3 after compat is removed and verification passes',
                },
              ],
              correctOptionId: '2',
              explanation:
                'Booting in compatibility mode is a milestone. The target is a verified application on the standard runtime without compatibility dependencies.',
              required: true,
            },
          ],
        },
      ],
    },
    {
      id: 'delivery',
      title: 'Complete the migration',
      subtitle: 'Ecosystem, verification & rollout',
      description:
        'Upgrade the supporting libraries, prove key journeys, and prepare a safe recovery path.',
      tag: 'VERIFY & SHIP',
      lessons: [
        {
          id: 'ecosystem-upgrade',
          title: 'Upgrade the surrounding ecosystem',
          summary: 'Handle routing, stores, tests, and SSR as explicit workstreams.',
          minutes: 15,
          blocks: [
            {
              type: 'text',
              heading: 'The runtime version is only one dependency',
              body: [
                'Vue Router 4 targets Vue 3. Replace constructor-based setup with createRouter and a history implementation. Review catch-all routes, guards, scroll behavior, router readiness, and router-view slots for transitions or keep-alive. A direct URL reload must work as well as a client-side click.',
                'Existing Vuex applications can move from Vuex 3 to Vuex 4 while largely retaining their store API. Install the store on the application instance. Pinia is a separate state-architecture choice; it does not have to be part of the runtime upgrade.',
                'Vue Test Utils v2 targets Vue 3; the v1 line targets Vue 2. Update mount configuration and plugins under global where applicable, inspect changed wrapper APIs, and keep assertions about user-visible behavior. Jest or Vitest is a separate runner decision; switching runners is not itself proof that the app works.',
                'For SSR or Nuxt, follow the framework’s migration path rather than aliasing Vue underneath it. Include server rendering, hydration, request-scoped state, data fetching, modules, and deployment in the audit. A framework migration is more than replacing the browser runtime.',
              ],
            },
            {
              type: 'code',
              filename: 'router-and-store.ts',
              code: "import { createApp } from 'vue'\nimport { createRouter, createWebHistory } from 'vue-router'\nimport { createStore } from 'vuex'\nimport App from './App.vue'\n\nconst router = createRouter({\n  history: createWebHistory(),\n  routes: [{ path: '/projects/:id', component: () => import('./ProjectPage.vue') }]\n})\nconst store = createStore({\n  state: () => ({ selectedProjectId: null })\n})\nconst app = createApp(App)\napp.use(store).use(router)\nrouter.isReady().then(() => app.mount('#app'))\n// Configure the server to serve the app for valid history-mode deep links.",
              language: 'ts',
            },
            {
              type: 'text',
              heading: 'Prove the boundary',
              body: [
                'Choose a route that loads remote data, uses a store, and renders a UI-library component. Verify initial load, internal navigation, browser Back, page reload, and an unauthorized API response. If it uses SSR, also inspect the initial HTML and hydration. Record the exact package versions that passed; avoid a matrix of individually “compatible” packages that has never run together.',
              ],
            },
            {
              type: 'video',
              youtubeId: '_Zu7m5Xdcuc',
              title: 'Upgrading your app to Vue 3',
              author: 'Vue Mastery',
              focus:
                'Revisit the upgrade walkthrough with the ecosystem inventory in hand. Identify which app-level integrations need their own migration guide.',
              startSeconds: 0,
              note: 'Historical walkthrough: use it for concepts and migration experience. Follow the linked current documentation for package versions and support status.',
            },
            {
              type: 'resources',
              links: [
                {
                  title: 'Vue Router 4 migration',
                  url: 'https://router.vuejs.org/guide/migration/',
                },
                {
                  title: 'Vuex 4 migration',
                  url: 'https://vuex.vuejs.org/guide/migrating-to-4-0-from-3-x',
                },
                {
                  title: 'Vue Test Utils v2 migration',
                  url: 'https://test-utils.vuejs.org/migration/',
                },
                {
                  title: 'Nuxt migration overview',
                  url: 'https://nuxt.com/docs/4.x/migration/overview',
                },
              ],
            },
          ],
          questions: [
            {
              id: 'vuex-path',
              prompt: 'What is a valid low-scope state-management path for an existing Vuex 3 app?',
              options: [
                {
                  id: '0',
                  text: 'Migrate to Vuex 4 for Vue 3, then evaluate Pinia separately',
                },
                {
                  id: '1',
                  text: 'Rewrite every store into Pinia before any Vue 3 work',
                },
                {
                  id: '2',
                  text: 'Keep the Vue 2 runtime hidden inside Vuex',
                },
              ],
              correctOptionId: '0',
              explanation:
                'Vuex 4 supports Vue 3. Separating state redesign from runtime compatibility reduces the number of moving parts.',
              required: true,
            },
            {
              id: 'test-utils-version',
              prompt: 'Which Vue Test Utils major targets Vue 3?',
              options: [
                {
                  id: '0',
                  text: 'v1',
                },
                {
                  id: '1',
                  text: 'v2',
                },
                {
                  id: '2',
                  text: 'Either major targets both runtimes without changes',
                },
              ],
              correctOptionId: '1',
              explanation:
                'Vue Test Utils v2 is for Vue 3. Its migration guide covers changed mounting and wrapper APIs.',
              required: true,
            },
          ],
        },
        {
          id: 'verify-and-rollout',
          title: 'Verify, release, and keep a rollback path',
          summary: 'Turn the migration into a controlled delivery plan.',
          minutes: 15,
          blocks: [
            {
              type: 'text',
              heading: 'Define done before shipping',
              body: [
                'Create acceptance gates for build output, types, behavior tests, routing, visual interactions, and production-like execution. Your most important journeys might be signing in, editing a record, submitting a form once, opening a modal, and revisiting a deep link. A compiler cannot verify these outcomes.',
                'Exercise both success and failure paths. Cover a rejected save, a cancelled navigation, an empty list, and stale async work. Check focus, keyboard interaction, and transitions. When using compat, include the final no-compat build as a separate check rather than assuming MODE: 3 components prove the whole application.',
                'Save the previous deployable artifact, its configuration, and a clear recovery procedure. Prefer a staged rollout when your hosting and traffic controls support it. Define observable stop conditions such as an increase in failed submissions or broken navigation, and name the person who can roll back.',
                'Frontend rollback does not reverse a database migration. Keep API and data changes backward compatible across the release window, or plan their compatibility explicitly. After rollout, remove stale compatibility settings and document the supported dependency set.',
              ],
            },
            {
              type: 'code',
              filename: 'upgrade-release-plan.txt',
              code: 'Before rollout\n[ ] Baseline and new artifact can both be deployed\n[ ] Standard Vue 3 build passes without compat\n[ ] Route reload, Back, guards, and not-found verified\n[ ] Forms update parent state and emit once\n[ ] UI kit dialogs, slots, and focus checked\n[ ] Store restoration and async failure paths checked\n[ ] SSR/hydration checked when applicable\n[ ] API/data changes support rollback window\n\nDuring rollout\nOwner: ...  Health signals: ...  Stop threshold: ...\nRollback: redeploy previous artifact + compatible config\n\nAfter rollout\nRemove temporary compatibility code; update runbook.',
              language: 'text',
            },
            {
              type: 'text',
              heading: 'Your migration deliverable',
              body: [
                'Write a one-page plan for a project you know: current stack; target package set; chosen direct, compat, or staged path; first vertical slice; top three blockers with owners; test gates; and a rollback procedure. Keep this as a planning exercise—answering this course’s quiz does not mean your real project has been verified.',
                'If you cannot name the first slice or explain why its dependencies will run on Vue 3, return to the audit lesson. If you can, use that bounded spike to estimate the rest of the migration instead of assigning a deadline from the number of components alone.',
              ],
            },
            {
              type: 'video',
              youtubeId: 'lPfp9XZINrg',
              title: 'How to migrate a large app to Vue 3',
              author: 'Vue Mastery',
              focus:
                'Start at Phase 3: Deploy (30:39). Compare the team’s rollout discussion with the evidence and rollback gates in your own plan.',
              startSeconds: 1839,
              note: 'Historical walkthrough: use it for concepts and migration experience. Follow the linked current documentation for package versions and support status.',
            },
            {
              type: 'resources',
              links: [
                {
                  title: 'Vue testing guide',
                  url: 'https://vuejs.org/guide/scaling-up/testing.html',
                },
                {
                  title: 'Vue Test Utils asynchronous behavior',
                  url: 'https://test-utils.vuejs.org/guide/advanced/async-suspense',
                },
                {
                  title: 'SSR considerations',
                  url: 'https://vuejs.org/guide/scaling-up/ssr.html',
                },
              ],
            },
          ],
          questions: [
            {
              id: 'release-proof',
              prompt: 'Which evidence is strongest before releasing the upgraded application?',
              options: [
                {
                  id: '0',
                  text: 'The package install completed',
                },
                {
                  id: '1',
                  text: 'Representative user journeys pass on the final runtime, with a deployable rollback artifact',
                },
                {
                  id: '2',
                  text: 'The compatibility warnings are hidden',
                },
              ],
              correctOptionId: '1',
              explanation:
                'Installation and a quiet console are insufficient. Verify behavior on the actual release target and prepare recovery.',
              required: true,
            },
            {
              id: 'rollback-data',
              prompt:
                'What must you consider when rolling back a frontend that shipped with API or data changes?',
              options: [
                {
                  id: '0',
                  text: 'Frontend rollback automatically restores the database',
                },
                {
                  id: '1',
                  text: 'The previous frontend must still work with the API and data during the rollback window',
                },
                {
                  id: '2',
                  text: 'Only CSS needs to match',
                },
              ],
              correctOptionId: '1',
              explanation:
                'Recovery crosses service boundaries. A previous bundle is useful only if the surrounding system remains compatible with it.',
              required: true,
            },
          ],
        },
      ],
    },
  ],
};
