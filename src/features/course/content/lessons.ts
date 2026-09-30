import type { Lesson } from '../model/schema';

export const lessonsBySection: Record<string, Lesson[]> = {
  reactivity: [
    {
      id: 'reactive-graph',
      title: 'From render snapshots to a reactive graph',
      summary: 'Understand setup, refs, and the dependency graph that updates your UI.',
      minutes: 20,
      blocks: [
        {
          type: 'text',
          heading: 'The architectural idea',
          body: [
            'React function components run to produce render snapshots. In Vue, setup runs once per component instance. It establishes reactive state and the effects that subscribe to that state; the render effect can then run again when its dependencies change.',
            'A ref is a stable container with a reactive .value property. Read and write .value in JavaScript; top-level refs are unwrapped in templates. A computed ref describes a derived value. Vue tracks what its getter reads, caches its result, and invalidates it when those dependencies change.',
            'In the example, adding an item updates both the count and total without synchronizing a second piece of state. Keep the items as the source of truth. A computed getter should be pure: no network calls, storage writes, or mutations.',
            'Try it: add a second item with quantity 2 and price 15. Predict the total before running the code. Then change only its quantity. Which computed values depend on quantity and recompute? Both count and total read quantity, so both update when it changes.',
          ],
        },
        {
          type: 'comparison',
          left: {
            label: 'In React',
            text: 'useState owns a value for each render; useMemo computes during rendering with explicit dependencies.',
          },
          right: {
            label: 'In Vue',
            text: 'ref owns reactive state; computed tracks reactive reads. Setup creates the graph once per instance.',
          },
        },
        {
          type: 'code',
          language: 'ts',
          filename: 'reactive-graph.ts',
          code: "import { ref, computed } from 'vue'\n\nconst items = ref([{ price: 30, quantity: 1 }])\nconst count = computed(() =>\n  items.value.reduce((n, item) => n + item.quantity, 0)\n)\nconst total = computed(() =>\n  items.value.reduce((n, item) => n + item.price * item.quantity, 0)\n)\n\nitems.value[0]!.quantity = 3\nconsole.log(count.value, total.value) // 3, 90",
        },
        {
          type: 'video',
          youtubeId: 'NZfNS4sJ8CI',
          title: 'Reactivity in Vue 3 — How does it work?',
          author: 'Vue Mastery',
        },
        {
          type: 'resources',
          links: [
            {
              title: 'Read the official guide',
              url: 'https://vuejs.org/guide/essentials/reactivity-fundamentals',
            },
          ],
        },
      ],
      questions: [
        {
          id: 'reactive-graph-check',
          prompt: 'Where should the cart total live?',
          options: [
            {
              id: '0',
              text: 'In a second ref updated by a watcher',
            },
            {
              id: '1',
              text: 'In a computed getter derived from items',
            },
            {
              id: '2',
              text: 'In localStorage on every render',
            },
          ],
          correctOptionId: '1',
          explanation:
            'The total is derived state. A pure computed getter keeps it consistent with items without a second writable source of truth.',
          required: true,
        },
        {
          id: 'setup-lifetime',
          prompt: 'When does a component’s setup function normally run?',
          options: [
            {
              id: 'a',
              text: 'Once per component instance',
            },
            {
              id: 'b',
              text: 'Every time a ref changes',
            },
            {
              id: 'c',
              text: 'Once globally for the whole application',
            },
          ],
          correctOptionId: 'a',
          explanation:
            'Each component instance establishes its own reactive state in setup. Its render effect can run repeatedly without re-running setup.',
          required: true,
        },
      ],
    },
    {
      id: 'effects',
      title: 'Computed values, watchers & cleanup',
      summary: 'Distinguish derivation from side effects and prevent stale requests.',
      minutes: 15,
      blocks: [
        {
          type: 'text',
          heading: 'The architectural idea',
          body: [
            'Use computed for a value and watch for an effect. A watcher can react to a specific source, with old and new values available. watchEffect tracks synchronous reactive reads automatically; reads made after an await are not included in that initial tracking.',
            'Async work needs a lifetime. If a search term changes before a request finishes, abort the old request. Register cleanup before awaiting. Watchers created synchronously in setup are stopped with their component; resources created outside that lifetime need an explicit owner.',
            'Try it: type two search terms quickly. The first request must not overwrite the second result. Cancellation plus explicit loading and error state should be part of the production composable.',
          ],
        },
        {
          type: 'comparison',
          left: {
            label: 'In React',
            text: 'An effect often combines explicit dependencies with a cleanup function.',
          },
          right: {
            label: 'In Vue',
            text: 'watch accepts a reactive source and a cleanup registrar; reserve it for effects, not derived totals.',
          },
        },
        {
          type: 'code',
          language: 'ts',
          filename: 'effects.ts',
          code: "import { ref, watch } from 'vue'\nconst search = ref('')\nconst results = ref<unknown[]>([])\nwatch(search, async (term, _old, onCleanup) => {\n  const controller = new AbortController()\n  onCleanup(() => controller.abort())\n  try {\n    const response = await fetch('/api/search?q=' + encodeURIComponent(term), {\n      signal: controller.signal\n    })\n    if (!response.ok) throw new Error('Search failed')\n    const data = await response.json()\n    if (!controller.signal.aborted) results.value = data\n  } catch (error) {\n    if (!controller.signal.aborted) console.error(error)\n  }\n})",
        },
        {
          type: 'video',
          youtubeId: 'QkadKspKoJo',
          title: "Vue 3 Watch vs WatchEffect! Watch OUT, you'll probably get this wrong!",
          author: 'Program With Erik',
          focus:
            'Compare explicit watch sources with watchEffect dependency tracking. Then revisit how the lesson cancels obsolete requests.',
          note: 'This video predates Vue 3.5. Use the lesson’s onCleanup example or the current guide for cleanup APIs.',
        },
        {
          type: 'resources',
          links: [
            {
              title: 'Read the official guide',
              url: 'https://vuejs.org/guide/essentials/watchers',
            },
          ],
        },
      ],
      questions: [
        {
          id: 'effects-check',
          prompt:
            'A search changes while its previous request is pending. What should the watcher do?',
          options: [
            {
              id: '0',
              text: 'Keep both results and accept whichever finishes last',
            },
            {
              id: '1',
              text: 'Add the response to a global ref',
            },
            {
              id: '2',
              text: 'Cancel or ignore the obsolete request using cleanup',
            },
          ],
          correctOptionId: '2',
          explanation:
            'Async responses can arrive out of order. Cleanup makes the previous request obsolete and prevents stale results from replacing current data.',
          required: true,
        },
      ],
    },
  ],
  components: [
    {
      id: 'contracts',
      title: 'Component contracts & slots',
      summary: 'Make ownership visible through typed props and events.',
      minutes: 15,
      blocks: [
        {
          type: 'text',
          heading: 'The architectural idea',
          body: [
            'A good component contract names both inputs and intent. Props flow down, and typed events report what happened. The parent owns the resulting state change. Avoid mutating an object prop merely because JavaScript allows it.',
            'Slots let the caller own rendering while the child owns layout or behavior. Scoped slots expose explicit values to that rendering function. For a reusable data table, expose a row to the cell slot instead of accepting dozens of presentation flags.',
          ],
        },
        {
          type: 'comparison',
          left: {
            label: 'In React',
            text: 'Props plus callbacks define a contract; render props customize rendering.',
          },
          right: {
            label: 'In Vue',
            text: 'defineProps and defineEmits type the contract; slots provide caller-owned rendering.',
          },
        },
        {
          type: 'code',
          language: 'ts',
          filename: 'contracts.ts',
          code: '// Inside <script setup lang="ts">\nconst props = defineProps<{ title: string; selected: boolean }>()\nconst emit = defineEmits<{ select: [id: string] }>()\n// Template: <button @click="emit(\'select\', \'architecture\')">\n//             {{ props.title }}\n//           </button>',
        },
        {
          type: 'video',
          youtubeId: 'orGcdmCRCc0',
          title: 'Vue Slots Simplified',
          author: 'LearnVue',
          focus:
            'Notice how named and scoped slots let a parent control rendering without adding presentation flags to the child.',
        },
        {
          type: 'resources',
          links: [
            {
              title: 'Read the official guide',
              url: 'https://vuejs.org/guide/components/events',
            },
          ],
        },
      ],
      questions: [
        {
          id: 'contracts-check',
          prompt: 'A child needs to change the parent’s selection. What is the clearest contract?',
          options: [
            {
              id: '0',
              text: 'Emit a typed selection event',
            },
            {
              id: '1',
              text: 'Mutate the parent object prop',
            },
            {
              id: '2',
              text: 'Import the parent component’s state',
            },
          ],
          correctOptionId: '0',
          explanation:
            'An event communicates intent while leaving ownership in the parent. It also makes the component easier to test and reuse.',
          required: true,
        },
      ],
    },
    {
      id: 'composables',
      title: 'Composables with explicit lifetimes',
      summary: 'Extract behavior without accidentally introducing shared state.',
      minutes: 15,
      blocks: [
        {
          type: 'text',
          heading: 'The architectural idea',
          body: [
            'A composable is a function that assembles reactive behavior. Return refs so callers can destructure them while retaining reactivity. Calling a composable twice should normally create two independent instances unless sharing is intentional and documented.',
            'Place state inside the function for per-call ownership. Register lifecycle hooks synchronously during setup, and dispose timers, subscriptions, and listeners. A module-level ref silently changes the ownership model and can become dangerous in server rendering.',
          ],
        },
        {
          type: 'comparison',
          left: {
            label: 'In React',
            text: 'A custom hook combines reusable stateful behavior under React’s call-order rules.',
          },
          right: {
            label: 'In Vue',
            text: 'A composable combines refs and lifecycle hooks; its state lifetime depends on where it is created.',
          },
        },
        {
          type: 'code',
          language: 'ts',
          filename: 'composables.ts',
          code: "import { ref, onMounted, onUnmounted } from 'vue'\nexport function useOnline() {\n  const online = ref(true)\n  const update = () => { online.value = navigator.onLine }\n  onMounted(() => {\n    update()\n    window.addEventListener('online', update)\n    window.addEventListener('offline', update)\n  })\n  onUnmounted(() => {\n    window.removeEventListener('online', update)\n    window.removeEventListener('offline', update)\n  })\n  return { online }\n}",
        },
        {
          type: 'video',
          youtubeId: 'bcZM3EogPJE',
          title: 'Build your own Custom Composables in Vue',
          author: 'Vue Mastery',
          focus:
            'Identify the inputs and returned refs of a composable. Decide which state belongs to each call and which resources need disposal.',
        },
        {
          type: 'resources',
          links: [
            {
              title: 'Read the official guide',
              url: 'https://vuejs.org/guide/reusability/composables',
            },
          ],
        },
      ],
      questions: [
        {
          id: 'composables-check',
          prompt: 'Where should a ref live when each composable caller needs independent state?',
          options: [
            {
              id: '0',
              text: 'At module scope',
            },
            {
              id: '1',
              text: 'Inside the composable function',
            },
            {
              id: '2',
              text: 'On window',
            },
          ],
          correctOptionId: '1',
          explanation:
            'State created inside the function belongs to that call. Module-scope state is shared across all consumers of the module.',
          required: true,
        },
      ],
    },
  ],
  state: [
    {
      id: 'injection',
      title: 'Scoped dependencies with provide / inject',
      summary: 'Use typed injection for a subtree’s dependencies.',
      minutes: 15,
      blocks: [
        {
          type: 'text',
          heading: 'The architectural idea',
          body: [
            'Provide/inject passes a dependency through a component subtree without prop drilling. A typed InjectionKey aligns the provider and consumer. It is especially useful for a form, editor, or feature-scoped service.',
            'Keep mutations at the provider boundary and expose deliberate commands. Handle missing providers explicitly rather than using non-null assertions everywhere. A readonly ref can expose state without inviting consumers to modify it.',
          ],
        },
        {
          type: 'comparison',
          left: {
            label: 'In React',
            text: 'Context supplies a dependency to a subtree.',
          },
          right: {
            label: 'In Vue',
            text: 'Typed InjectionKey values connect provide and inject; injected refs remain reactive.',
          },
        },
        {
          type: 'code',
          language: 'ts',
          filename: 'injection.ts',
          code: "import { inject, type InjectionKey } from 'vue'\ninterface Notifications { success(message: string): void }\nexport const notificationsKey: InjectionKey<Notifications> = Symbol('notifications')\nexport function useNotifications() {\n  const service = inject(notificationsKey)\n  if (!service) throw new Error('Notifications provider is missing')\n  return service\n}\n// An ancestor calls provide(notificationsKey, service).",
        },
        {
          type: 'video',
          youtubeId: 'dOxjzgZpTfk',
          title: 'Dependency Injection in Vue 3 with Provide and Inject',
          author: 'Justin Brooks',
          focus:
            'Follow the dependency from its provider to a descendant. Apply the lesson’s typed InjectionKey and explicit missing-provider handling.',
        },
        {
          type: 'resources',
          links: [
            {
              title: 'Read the official guide',
              url: 'https://vuejs.org/guide/components/provide-inject',
            },
          ],
        },
      ],
      questions: [
        {
          id: 'injection-check',
          prompt: 'Which dependency is a good fit for provide/inject?',
          options: [
            {
              id: '0',
              text: 'Every server response in the application',
            },
            {
              id: '1',
              text: 'A form controller shared within one form subtree',
            },
            {
              id: '2',
              text: 'A replacement for API authorization',
            },
          ],
          correctOptionId: '1',
          explanation:
            'Injection expresses a scoped dependency. A form controller has a natural provider lifetime and subtree boundary.',
          required: true,
        },
      ],
    },
    {
      id: 'pinia',
      title: 'Shared client state with Pinia',
      summary: 'Build a small store with commands and derived state.',
      minutes: 15,
      blocks: [
        {
          type: 'text',
          heading: 'The architectural idea',
          body: [
            'Pinia is appropriate for client state shared across distant parts of the application: a workspace selection or a draft workflow, for example. Keep transient input local until there is a concrete need to share it.',
            'Setup stores expose refs, computed values, and actions. Use storeToRefs when destructuring state and getters; actions can be destructured directly. Keep server cache ownership separate so Pinia does not become a second cache.',
          ],
        },
        {
          type: 'comparison',
          left: {
            label: 'In React',
            text: 'Zustand or Redux centralizes shared client state and actions.',
          },
          right: {
            label: 'In Vue',
            text: 'A Pinia setup store composes reactive state with explicit commands and computed getters.',
          },
        },
        {
          type: 'code',
          language: 'ts',
          filename: 'pinia.ts',
          code: "import { defineStore, storeToRefs } from 'pinia'\nimport { ref } from 'vue'\nexport const useWorkspaceStore = defineStore('workspace', () => {\n  const selectedId = ref<string | null>(null)\n  function select(id: string) { selectedId.value = id }\n  return { selectedId, select }\n})\n// In setup:\nconst workspace = useWorkspaceStore()\nconst { selectedId } = storeToRefs(workspace)",
        },
        {
          type: 'video',
          youtubeId: 'LfWpPRId5N0',
          title: 'Pinia Simplified',
          author: 'LearnVue',
          focus:
            'Separate state, derived values, and actions. Map the store concepts to the setup-store example in this lesson.',
        },
        {
          type: 'resources',
          links: [
            {
              title: 'Read the official guide',
              url: 'https://pinia.vuejs.org/core-concepts/',
            },
          ],
        },
      ],
      questions: [
        {
          id: 'pinia-check',
          prompt: 'How do you destructure Pinia state while keeping it reactive?',
          options: [
            {
              id: '0',
              text: 'Spread the store into a plain object',
            },
            {
              id: '1',
              text: 'Use JSON serialization',
            },
            {
              id: '2',
              text: 'Use storeToRefs(store)',
            },
          ],
          correctOptionId: '2',
          explanation:
            'storeToRefs preserves references to reactive state and getters. Plain destructuring of an unwrapped primitive loses that connection.',
          required: true,
        },
      ],
    },
  ],
  routing: [
    {
      id: 'route-boundaries',
      title: 'Routes as feature entry points',
      summary: 'Load features at the boundary where they are needed.',
      minutes: 15,
      blocks: [
        {
          type: 'text',
          heading: 'The architectural idea',
          body: [
            'A route is a useful composition boundary: it selects a feature entry page, parses URL inputs, and places the page inside an application layout. Keep business rules out of route configuration.',
            'Dynamic imports let the bundler split route code. Query strings are a good home for shareable filters, sorting, and pagination. Validate route parameters before calling domain services rather than trusting arbitrary strings.',
          ],
        },
        {
          type: 'comparison',
          left: {
            label: 'In React',
            text: 'React Router routes can lazy-load screen modules.',
          },
          right: {
            label: 'In Vue',
            text: 'Vue Router accepts component import functions and maps URL parameters into feature pages.',
          },
        },
        {
          type: 'code',
          language: 'ts',
          filename: 'route-boundaries.ts',
          code: "const routes = [{\n  path: '/projects/:projectId',\n  component: () => import('./features/projects/pages/ProjectPage.vue'),\n  props: true\n}]\n// Validate projectId at the page boundary before requesting data.",
        },
        {
          type: 'video',
          youtubeId: 'jnE5FOYuuDc',
          title: '2 Vue Router Lazy Loading | Vue Router Tutorial',
          author: 'Tony Xhepa',
          focus:
            'Look for dynamic imports at route boundaries and connect them to feature entry pages.',
        },
        {
          type: 'resources',
          links: [
            {
              title: 'Read the official guide',
              url: 'https://router.vuejs.org/guide/advanced/lazy-loading',
            },
          ],
        },
      ],
      questions: [
        {
          id: 'route-boundaries-check',
          prompt: 'Where is a good place to split a large application bundle?',
          options: [
            {
              id: '0',
              text: 'At route-level feature entry points',
            },
            {
              id: '1',
              text: 'At every individual button',
            },
            {
              id: '2',
              text: 'Only after all routes load',
            },
          ],
          correctOptionId: '0',
          explanation:
            'Route-level imports align loading with navigation and create a practical boundary for feature code.',
          required: true,
        },
      ],
    },
    {
      id: 'guards',
      title: 'Navigation guards & authorization',
      summary: 'Use guards for navigation policy while enforcing access on the server.',
      minutes: 15,
      blocks: [
        {
          type: 'text',
          heading: 'The architectural idea',
          body: [
            'A guard can redirect unauthenticated visitors or stop a navigation with unsaved edits. Return a route location to redirect and false to cancel. Wait for session initialization explicitly so an unresolved session is not mistaken for a logged-out session.',
            'A client-side guard improves the experience; it cannot protect data. Every protected API must authorize the authenticated request independently. Avoid redirects that repeatedly send the sign-in route back to itself.',
          ],
        },
        {
          type: 'comparison',
          left: {
            label: 'In React',
            text: 'Protected route wrappers guide users to the right screen.',
          },
          right: {
            label: 'In Vue',
            text: 'Router guards express navigation policy before or during route transitions.',
          },
        },
        {
          type: 'code',
          language: 'ts',
          filename: 'guards.ts',
          code: "// auth.ready() waits for session initialization.\nrouter.beforeEach(async (to) => {\n  await auth.ready()\n  if (to.meta.requiresAuth && !auth.user) {\n    return { name: 'sign-in', query: { redirect: to.fullPath } }\n  }\n})\n// The server still checks access on every protected request.",
        },
        {
          type: 'video',
          youtubeId: 'z23GR2xRP38',
          title: '#28 - Route Guards - Vue 3 (Options API) Tutorial',
          author: 'KoderHQ',
          focus:
            'Compare global and per-route guards, then identify where API authorization still needs to happen.',
          note: 'Uses the Options API. The routing concepts transfer; this course uses return-based guards and the Composition API.',
        },
        {
          type: 'resources',
          links: [
            {
              title: 'Read the official guide',
              url: 'https://router.vuejs.org/guide/advanced/navigation-guards',
            },
          ],
        },
      ],
      questions: [
        {
          id: 'guards-check',
          prompt: 'Does a route guard secure a protected API?',
          options: [
            {
              id: '0',
              text: 'Yes, because the page cannot render',
            },
            {
              id: '1',
              text: 'No; the API must enforce authorization independently',
            },
            {
              id: '2',
              text: 'Only when the route is lazy-loaded',
            },
          ],
          correctOptionId: '1',
          explanation:
            'Client code can be bypassed. API authorization remains a server responsibility regardless of the navigation experience.',
          required: true,
        },
      ],
    },
  ],
  structure: [
    {
      id: 'feature-modules',
      title: 'Organize around features',
      summary: 'Give each feature a small public interface and a clear owner.',
      minutes: 15,
      blocks: [
        {
          type: 'text',
          heading: 'The architectural idea',
          body: [
            'Folders alone do not create architecture. A feature should own a coherent set of behaviors and expose a small public API. Other features should depend on that contract, not reach into its internal components or storage details.',
            'This lab uses app for composition, course for curriculum, and progress for grading and persistence. Progress depends on course through its public entry point. The application shell composes both. This is a deliberate one-way dependency, not a rule that every feature must be completely isolated.',
          ],
        },
        {
          type: 'comparison',
          left: {
            label: 'In React',
            text: 'Feature folders and public entry points work just as well in React.',
          },
          right: {
            label: 'In Vue',
            text: 'Vue SFCs sit beside feature models and services; the framework does not require grouping everything by file type.',
          },
        },
        {
          type: 'code',
          language: 'ts',
          filename: 'feature-modules.ts',
          code: 'src/\n  app/                 # routing, providers, shell\n  features/\n    course/\n      content/         # typed curriculum\n      model/           # content schemas\n      pages/           # route entry components\n      index.ts         # public contract\n    progress/\n      model/           # grading and completion\n      services/        # local persistence adapter\n      index.ts\n  shared/              # framework-neutral utilities only',
        },
        {
          type: 'video',
          youtubeId: 'B5uz-wce-ks',
          title:
            'Scalable Architectures with Vue Micro Frontends: A Developer-Centric Approach - Adam DeHaven',
          author: 'VueConf Toronto',
          focus:
            'Focus on module ownership, shared contracts, and the cost of coupling across teams. Apply those boundaries inside this app’s feature folders.',
          note: 'Architecture case study: the talk uses micro frontends. Separate deployments are not required for the feature-oriented structure taught here.',
        },
        {
          type: 'resources',
          links: [
            {
              title: 'Read the official guide',
              url: 'https://vuejs.org/guide/scaling-up/state-management',
            },
          ],
        },
      ],
      questions: [
        {
          id: 'feature-modules-check',
          prompt: 'Which import best respects a feature boundary?',
          options: [
            {
              id: '0',
              text: 'A public export from features/course',
            },
            {
              id: '1',
              text: 'A sibling feature’s private storage adapter',
            },
            {
              id: '2',
              text: 'A deep import into a page’s internal state',
            },
          ],
          correctOptionId: '0',
          explanation:
            'Public exports make dependencies intentional and allow internal implementation changes without widespread edits.',
          required: true,
        },
      ],
    },
    {
      id: 'api-boundary',
      title: 'Keep transport at the edge',
      summary: 'Convert uncertain network data into trusted domain values.',
      minutes: 15,
      blocks: [
        {
          type: 'text',
          heading: 'The architectural idea',
          body: [
            'TypeScript types disappear at runtime. Casting a fetch response as Project does not validate it at runtime. Treat external data as unknown, validate it, and translate transport-specific details into your domain model.',
            'Put that work behind a narrow service function. Components then focus on user interaction, while tests can replace the service at its boundary. Keep errors useful: distinguish failed transport, malformed data, and a legitimate empty result.',
          ],
        },
        {
          type: 'comparison',
          left: {
            label: 'In React',
            text: 'A typed API client is a useful boundary in either ecosystem.',
          },
          right: {
            label: 'In Vue',
            text: 'Composables coordinate reactive state around services; services can remain framework-independent.',
          },
        },
        {
          type: 'code',
          language: 'ts',
          filename: 'api-boundary.ts',
          code: "type Project = { id: string; name: string }\nexport function parseProject(value: unknown): Project {\n  if (typeof value !== 'object' || value === null ||\n      !('id' in value) || typeof value.id !== 'string' ||\n      !('name' in value) || typeof value.name !== 'string') {\n    throw new Error('Invalid project response')\n  }\n  return { id: value.id, name: value.name }\n}",
        },
        {
          type: 'video',
          youtubeId: 'ZPa9I_pvRU0',
          title: 'Stop Writing Types AND Validation (Use Zod)',
          author: 'Austin Davis',
          focus:
            'Distinguish compile-time types from runtime validation, and consider replacing a hand-written boundary parser with a schema.',
          note: 'Framework-independent TypeScript material. Zod is an optional validation approach, not a dependency of this course app.',
        },
        {
          type: 'resources',
          links: [
            {
              title: 'Read the official guide',
              url: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html',
            },
          ],
        },
      ],
      questions: [
        {
          id: 'api-boundary-check',
          prompt: 'What does an `as Project` assertion do to an API response?',
          options: [
            {
              id: '0',
              text: 'Validates every field at runtime',
            },
            {
              id: '1',
              text: 'Converts malformed data automatically',
            },
            {
              id: '2',
              text: 'Changes the static type without validating the data',
            },
          ],
          correctOptionId: '2',
          explanation:
            'A type assertion only affects the compiler. Validate external data before treating it as a trusted domain object.',
          required: true,
        },
      ],
    },
  ],
  'server-state': [
    {
      id: 'query-ownership',
      title: 'Server cache versus client state',
      summary: 'Let one cache own the remote data lifecycle.',
      minutes: 15,
      blocks: [
        {
          type: 'text',
          heading: 'The architectural idea',
          body: [
            'Remote data has freshness, loading, retry, and invalidation concerns that differ from local UI state. A query cache can coordinate these concerns across consumers. Copying each response into Pinia creates competing owners and synchronization work.',
            'Use query keys to name the data. In Vue Query, preserve reactive inputs rather than passing an already-unwrapped snapshot when the query must follow changes. Keep a draft separate if the user needs to edit a copy before saving.',
          ],
        },
        {
          type: 'comparison',
          left: {
            label: 'In React',
            text: 'TanStack Query separates remote state from a client store.',
          },
          right: {
            label: 'In Vue',
            text: 'Vue Query serves the same role, with reactive refs or getters as changing inputs.',
          },
        },
        {
          type: 'code',
          language: 'ts',
          filename: 'query-ownership.ts',
          code: "import { useQuery } from '@tanstack/vue-query'\nimport type { Ref } from 'vue'\nexport function useProject(id: Ref<string>) {\n  return useQuery({\n    queryKey: ['project', id],\n    queryFn: async ({ signal }) => {\n      const response = await fetch('/api/projects/' + encodeURIComponent(id.value), { signal })\n      if (!response.ok) throw new Error('Could not load project')\n      return response.json() // Validate with a domain parser in production.\n    },\n    staleTime: 60_000\n  })\n}",
        },
        {
          type: 'video',
          youtubeId: 'mg1slc6GU8U',
          title: 'Fetching data the right way | React/Tanstack Query Series - Part 1',
          author: 'Akilesh Rao',
          focus:
            'Focus on why remote data deserves a cache owner instead of ad hoc loading effects. Translate the example into the Vue composable below.',
          note: 'React examples: caching and ownership concepts transfer to TanStack Vue Query. Keep changing Vue inputs as refs or getters and use the current Vue guide for API syntax.',
        },
        {
          type: 'resources',
          links: [
            {
              title: 'Read the official guide',
              url: 'https://tanstack.com/query/latest/docs/framework/vue/reactivity',
            },
          ],
        },
      ],
      questions: [
        {
          id: 'query-ownership-check',
          prompt: 'Why avoid mirroring every query result into Pinia?',
          options: [
            {
              id: '0',
              text: 'Pinia cannot store objects',
            },
            {
              id: '1',
              text: 'It creates a second owner that can become stale',
            },
            {
              id: '2',
              text: 'Query caches cannot be reactive',
            },
          ],
          correctOptionId: '1',
          explanation:
            'Two writable representations of the same remote record create synchronization problems. Let the query cache own remote state.',
          required: true,
        },
      ],
    },
    {
      id: 'mutations',
      title: 'Mutations & invalidation',
      summary: 'Make the read-after-write behavior deliberate.',
      minutes: 15,
      blocks: [
        {
          type: 'text',
          heading: 'The architectural idea',
          body: [
            'After a successful mutation, decide which cached queries are no longer trustworthy. Invalidate affected detail and list keys, or update them from the authoritative mutation response when the result is sufficient.',
            'Optimistic updates improve responsiveness but require a rollback plan and care around concurrent writes. Start with explicit pending and failure feedback, then add optimism where it materially improves the experience.',
          ],
        },
        {
          type: 'comparison',
          left: {
            label: 'In React',
            text: 'Mutation lifecycle callbacks reconcile writes with cached reads.',
          },
          right: {
            label: 'In Vue',
            text: 'Vue Query exposes the same query-client lifecycle from a composable API.',
          },
        },
        {
          type: 'code',
          language: 'ts',
          filename: 'mutations.ts',
          code: "const mutation = useMutation({\n  mutationFn: renameProject,\n  onSuccess: async (_result, variables) => {\n    await Promise.all([\n      queryClient.invalidateQueries({ queryKey: ['project', variables.id] }),\n      queryClient.invalidateQueries({ queryKey: ['projects'] })\n    ])\n  }\n})",
        },
        {
          type: 'video',
          youtubeId: '_EuPZrr3faU',
          title:
            'TanStack React Query v5 - Full Guide (Setup, Mutations, Infinite Loading, Optimistic Updates)',
          author: 'Coding in Flow',
          focus:
            'Use the mutation and optimistic-update parts of this longer guide. Identify the affected query keys, invalidation step, and rollback responsibility.',
          note: 'React Query v5 walkthrough. Apply the shared cache concepts using @tanstack/vue-query and this lesson’s Vue mutation example; watching the entire guide is optional.',
        },
        {
          type: 'resources',
          links: [
            {
              title: 'Read the official guide',
              url: 'https://tanstack.com/query/latest/docs/framework/vue/guides/invalidations-from-mutations',
            },
          ],
        },
      ],
      questions: [
        {
          id: 'mutations-check',
          prompt: 'A rename succeeds. Which caches may need attention?',
          options: [
            {
              id: '0',
              text: 'Only the currently visible text node',
            },
            {
              id: '1',
              text: 'None, because mutations update all queries automatically',
            },
            {
              id: '2',
              text: 'The project detail and any list displaying its name',
            },
          ],
          correctOptionId: '2',
          explanation:
            'A write can affect multiple read models. Reconcile both detail and list views rather than assuming a mutation updates them automatically.',
          required: true,
        },
      ],
    },
  ],
  testing: [
    {
      id: 'test-boundaries',
      title: 'Test rules before rendering',
      summary: 'Make domain behavior cheap to verify.',
      minutes: 15,
      blocks: [
        {
          type: 'text',
          heading: 'The architectural idea',
          body: [
            'Pure functions are ideal for rules such as grading and completion. Exercise the consequential edge cases: a missing answer, a wrong answer, optional questions, and a partially complete section.',
            'A component test should demonstrate what the user can observe, while an integration test proves that layers cooperate. Avoid asserting internal refs or the exact shape of every component instance; those tests make harmless refactoring expensive.',
          ],
        },
        {
          type: 'comparison',
          left: {
            label: 'In React',
            text: 'Test behavior through the narrowest useful boundary.',
          },
          right: {
            label: 'In Vue',
            text: 'Vitest runs pure model tests; Vue Test Utils mounts SFCs when rendering matters.',
          },
        },
        {
          type: 'code',
          language: 'ts',
          filename: 'test-boundaries.ts',
          code: "import { expect, it } from 'vitest'\nit('does not finish a lesson with an unanswered required question', () => {\n  const lesson = { questions: [\n    { id: 'q1', required: true, correctOptionId: 'b' }\n  ] }\n  expect(isLessonComplete(lesson, {})).toBe(false)\n})",
        },
        {
          type: 'video',
          youtubeId: 'snCLQmINqCU',
          title: 'Vitest Simplified',
          author: 'LearnVue',
          focus:
            'Start with a pure grading rule. Identify its inputs, observable result, and the failure case that matters before mounting any UI.',
          note: 'The video demonstrates an earlier Vitest release. Use this project’s current setup and the official guide for installation details.',
        },
        {
          type: 'resources',
          links: [
            {
              title: 'Read the official guide',
              url: 'https://vitest.dev/guide/',
            },
          ],
        },
      ],
      questions: [
        {
          id: 'test-boundaries-check',
          prompt: 'Which test best protects the completion rule?',
          options: [
            {
              id: '0',
              text: 'A snapshot of the entire application HTML',
            },
            {
              id: '1',
              text: 'A pure test verifying that missing required answers prevent completion',
            },
            {
              id: '2',
              text: 'A test of the internal ref variable name',
            },
          ],
          correctOptionId: '1',
          explanation:
            'The completion invariant is a domain rule. A focused pure test verifies it directly and remains stable when the UI changes.',
          required: true,
        },
      ],
    },
    {
      id: 'component-tests',
      title: 'Test interaction & async updates',
      summary: 'Wait for the work your assertion depends on.',
      minutes: 15,
      blocks: [
        {
          type: 'text',
          heading: 'The architectural idea',
          body: [
            'Vue batches DOM updates. Await Vue Test Utils interactions such as trigger and setValue before asserting the resulting DOM. Network promises require their own resolution; a render tick alone does not finish a pending fetch.',
            'Prefer accessible labels and visible messages as the contract. In this lab, component tests select an answer, submit it, and verify correction feedback. Store tests separately verify saved progress and section aggregation.',
          ],
        },
        {
          type: 'comparison',
          left: {
            label: 'In React',
            text: 'React tests use async interaction utilities and await observable updates.',
          },
          right: {
            label: 'In Vue',
            text: 'Vue Test Utils interaction methods await Vue’s update tick; flushPromises handles resolved promise callbacks.',
          },
        },
        {
          type: 'code',
          language: 'ts',
          filename: 'component-tests.ts',
          code: "import { mount } from '@vue/test-utils'\nimport { expect, it } from 'vitest'\nimport Counter from './Counter.vue'\nit('increments the displayed count', async () => {\n  const wrapper = mount(Counter)\n  await wrapper.get('button').trigger('click')\n  expect(wrapper.text()).toContain('Count: 1')\n})",
        },
        {
          type: 'video',
          youtubeId: 'iNl6TA29hBM',
          title: 'Using Vue Test Utils in Vitest',
          author: 'LearnVue',
          focus:
            'Follow mounting, user interaction, and assertions against rendered output. Note where an asynchronous update must be awaited.',
          note: 'Use this project’s current Vitest configuration rather than copying older setup versions from the video.',
        },
        {
          type: 'resources',
          links: [
            {
              title: 'Read the official guide',
              url: 'https://test-utils.vuejs.org/guide/advanced/async-suspense',
            },
          ],
        },
      ],
      questions: [
        {
          id: 'component-tests-check',
          prompt: 'Why await wrapper.trigger() before checking updated text?',
          options: [
            {
              id: '0',
              text: 'Vue batches DOM updates asynchronously',
            },
            {
              id: '1',
              text: 'Every click starts a network request',
            },
            {
              id: '2',
              text: 'It disables reactive dependency tracking',
            },
          ],
          correctOptionId: '0',
          explanation:
            'The event handler may change state immediately, but the DOM update is scheduled. Awaiting the interaction gives Vue time to render the new state.',
          required: true,
        },
      ],
    },
  ],
  production: [
    {
      id: 'resilience',
      title: 'Errors, recovery & observability',
      summary: 'Turn failures into useful states and actionable signals.',
      minutes: 15,
      blocks: [
        {
          type: 'text',
          heading: 'The architectural idea',
          body: [
            'An error handler should make the failure understandable without exposing secrets. Provide a recovery action appropriate to the failed operation and retain the user’s input. A global handler is a final safety net, not a replacement for local error states.',
            'Record operation names and correlation identifiers rather than raw payloads or tokens. Handle rejected event-handler promises and failed route imports explicitly. Decide which errors can be retried and which need a user correction.',
          ],
        },
        {
          type: 'comparison',
          left: {
            label: 'In React',
            text: 'Error boundaries and telemetry contain failures and explain their impact.',
          },
          right: {
            label: 'In Vue',
            text: 'onErrorCaptured and app.config.errorHandler cover Vue errors; async services still need deliberate failure states.',
          },
        },
        {
          type: 'code',
          language: 'ts',
          filename: 'resilience.ts',
          code: "app.config.errorHandler = (_error, _instance, info) => {\n  // Send sanitized metadata through your observability adapter.\n  reportFailure({ operation: 'vue-runtime', context: info })\n}\n// At a feature boundary, keep the draft and expose a retry action.",
        },
        {
          type: 'video',
          youtubeId: 'cl8tPBI4qUc',
          title: 'Sentry 101: Error Monitoring For Frontend Applications',
          author: 'Sentry',
          focus:
            'Connect an error event to the affected user journey. Decide what context is useful and what must be removed before reporting.',
          note: 'Cross-framework observability walkthrough. Sentry is an example tool; no account or integration is needed to complete the lesson.',
        },
        {
          type: 'resources',
          links: [
            {
              title: 'Read the official guide',
              url: 'https://vuejs.org/api/application.html#app-config-errorhandler',
            },
          ],
        },
      ],
      questions: [
        {
          id: 'resilience-check',
          prompt: 'What belongs in a production error report?',
          options: [
            {
              id: '0',
              text: 'The full authorization token',
            },
            {
              id: '1',
              text: 'All form input without filtering',
            },
            {
              id: '2',
              text: 'Sanitized operation metadata and a correlation identifier',
            },
          ],
          correctOptionId: '2',
          explanation:
            'Useful diagnostics identify the operation and trace without unnecessarily collecting credentials or personal payloads.',
          required: true,
        },
      ],
    },
    {
      id: 'performance',
      title: 'Performance, accessibility & i18n',
      summary: 'Measure a real journey before optimizing.',
      minutes: 15,
      blocks: [
        {
          type: 'text',
          heading: 'The architectural idea',
          body: [
            'Start from a user-visible budget: time to route readiness, input response, or a long-list interaction. Profile before adding memoization. Route splitting, stable props, and list virtualization solve different problems.',
            'Treat accessibility and internationalization as architecture concerns. Use semantic controls, visible focus, and associated labels. Format dates and numbers with Intl and put messages behind a translation boundary rather than concatenating fragments.',
          ],
        },
        {
          type: 'comparison',
          left: {
            label: 'In React',
            text: 'Stable props, profiling, and semantic HTML remain valuable across frameworks.',
          },
          right: {
            label: 'In Vue',
            text: 'Vue’s compiler optimizes templates, but payload size and expensive application work still need measurement.',
          },
        },
        {
          type: 'code',
          language: 'ts',
          filename: 'performance.ts',
          code: "export function formatTotal(value: number, locale: string, currency: string) {\n  return new Intl.NumberFormat(locale, {\n    style: 'currency', currency\n  }).format(value)\n}\n// Load large route modules on demand; measure interaction latency.",
        },
        {
          type: 'video',
          youtubeId: '9JRT60ESGiI',
          title: "I Didn't Know This Vue Best Practice...",
          author: 'LearnVue',
          focus:
            'Look at computed stability and dependency updates. Relate this focused optimization to a measured rendering bottleneck.',
          note: 'This video focuses on performance; accessibility and internationalization remain covered by the lesson text and resources.',
        },
        {
          type: 'resources',
          links: [
            {
              title: 'Read the official guide',
              url: 'https://vuejs.org/guide/best-practices/performance',
            },
          ],
        },
      ],
      questions: [
        {
          id: 'performance-check',
          prompt: 'A route feels slow. What is the best first step?',
          options: [
            {
              id: '0',
              text: 'Memoize every component',
            },
            {
              id: '1',
              text: 'Measure the slow user journey and identify the bottleneck',
            },
            {
              id: '2',
              text: 'Move all local state into Pinia',
            },
          ],
          correctOptionId: '1',
          explanation:
            'Measurement distinguishes network, bundle, rendering, and computation costs so the fix targets the actual problem.',
          required: true,
        },
      ],
    },
  ],
  nuxt: [
    {
      id: 'nuxt-boundaries',
      title: 'Nuxt 4: server & browser boundaries',
      summary: 'Keep request state and secrets on the correct side.',
      minutes: 15,
      blocks: [
        {
          type: 'text',
          heading: 'The architectural idea',
          body: [
            'Nuxt adds server rendering and conventions around Vue. In the Nuxt 4 structure, app contains the application UI, server contains server handlers, and shared holds code safe to use in both contexts.',
            'Module-level mutable state on a server can leak across requests. Use request-safe framework primitives for state and keep private runtime configuration on the server. Browser-only APIs belong in client lifecycle hooks or client-only components.',
          ],
        },
        {
          type: 'comparison',
          left: {
            label: 'In React',
            text: 'Next.js introduces server and client concerns beyond a React SPA.',
          },
          right: {
            label: 'In Vue',
            text: 'Nuxt introduces universal rendering and request-scoped conventions beyond a Vue SPA; its boundaries are not identical to React Server Components.',
          },
        },
        {
          type: 'code',
          language: 'ts',
          filename: 'nuxt-boundaries.ts',
          code: "app/\n  pages/\n  layouts/\n  composables/\nserver/\n  api/\nshared/\n  types/\nnuxt.config.ts\n\n// In a Nuxt composable: request-safe shared state\n// const selection = useState<string | null>('selection', () => null)",
        },
        {
          type: 'video',
          youtubeId: 'rCT54d8sMWk',
          title: 'Nuxt 4 - An overview!',
          author: 'Alexander Lichter',
          focus:
            'Compare Nuxt 4’s directory conventions with a client-only Vue app, and locate the boundary between app code and server code.',
        },
        {
          type: 'resources',
          links: [
            {
              title: 'Read the official guide',
              url: 'https://nuxt.com/docs/4.x/guide/directory-structure/app',
            },
          ],
        },
      ],
      questions: [
        {
          id: 'nuxt-boundaries-check',
          prompt: 'Why is a mutable module-level user ref dangerous during SSR?',
          options: [
            {
              id: '0',
              text: 'It makes CSS larger',
            },
            {
              id: '1',
              text: 'Server modules may be shared between different requests',
            },
            {
              id: '2',
              text: 'It prevents TypeScript compilation',
            },
          ],
          correctOptionId: '1',
          explanation:
            'Server processes reuse modules. Request-specific state must not be stored in a singleton that another user’s request can observe.',
          required: true,
        },
      ],
    },
    {
      id: 'nuxt-data',
      title: 'SSR data, layers & hydration',
      summary: 'Reuse server-fetched data and share architecture deliberately.',
      minutes: 15,
      blocks: [
        {
          type: 'text',
          heading: 'The architectural idea',
          body: [
            'useFetch and useAsyncData participate in Nuxt’s payload flow so server-fetched data can be reused during hydration. A raw fetch in setup does not by itself provide the same coordination and may duplicate work.',
            'Layers can share Nuxt conventions and configuration across applications; ordinary packages are useful for portable domain code. Prefer a small explicit extension surface. Do not turn a shared layer into a place for every application’s business rules.',
          ],
        },
        {
          type: 'comparison',
          left: {
            label: 'In React',
            text: 'Framework-level data primitives coordinate fetching with rendering.',
          },
          right: {
            label: 'In Vue',
            text: 'Nuxt useFetch and useAsyncData bridge SSR and hydration through the Nuxt payload.',
          },
        },
        {
          type: 'code',
          language: 'ts',
          filename: 'nuxt-data.ts',
          code: "// In a Nuxt page, during setup:\nconst { data, status, error, refresh } = await useFetch('/api/projects')\n// Render pending, error, empty, and success states.\n// A retry button calls refresh().\n// Keep secrets in server handlers, never in public runtime config.",
        },
        {
          type: 'video',
          youtubeId: '0X-aOpSGabA',
          title: 'useAsyncData vs. useFetch 🤯',
          author: 'Alexander Lichter',
          focus:
            'Explain when useFetch is convenient and when useAsyncData gives more control. Connect both to SSR payload reuse during hydration.',
          note: 'Recorded for Nuxt 3. The core data-fetching distinction carries forward; use the linked Nuxt 4 guide for current defaults and behavior.',
        },
        {
          type: 'resources',
          links: [
            {
              title: 'Read the official guide',
              url: 'https://nuxt.com/docs/4.x/getting-started/data-fetching',
            },
          ],
        },
      ],
      questions: [
        {
          id: 'nuxt-data-check',
          prompt: 'Why use Nuxt useFetch for SSR page data?',
          options: [
            {
              id: '0',
              text: 'It makes every request private automatically',
            },
            {
              id: '1',
              text: 'It removes the need for error handling',
            },
            {
              id: '2',
              text: 'It coordinates data fetching with SSR and hydration',
            },
          ],
          correctOptionId: '2',
          explanation:
            'Nuxt’s data primitives carry server results into the client payload, helping avoid duplicate fetching during hydration.',
          required: true,
        },
      ],
    },
  ],
};
