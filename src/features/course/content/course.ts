import { lessonsBySection } from './lessons';
import type { Course } from '../model/schema';

export const course: Course = {
  id: 'enterprise-vue',
  version: 1,
  title: 'Enterprise Vue for React engineers',
  shortTitle: 'Enterprise Vue',
  description:
    'An architecture-first path for experienced React engineers. Connect what you know. Practice what’s different.',
  category: 'ARCHITECTURE',
  headline: ['Think in Vue.', 'Build for scale.'],
  audienceNote:
    'Your component design, TypeScript, and testing instincts already transfer. Focus on the execution model and ownership decisions that change.',
  fromLabel: 'R',
  toLabel: 'V',
  sections: [
    {
      id: 'reactivity',
      title: 'The Vue mental model',
      subtitle: 'Reactivity & the Composition API',
      description:
        'Trade render snapshots for a reactive graph. Learn what changes, what stays familiar, and where React instincts need a reset.',
      tag: 'FOUNDATIONS',
      lessons: lessonsBySection['reactivity'] ?? [],
    },
    {
      id: 'components',
      title: 'Component architecture',
      subtitle: 'Contracts, slots & composables',
      description: 'Design component APIs and reusable behavior with clear ownership.',
      tag: 'FOUNDATIONS',
      lessons: lessonsBySection['components'] ?? [],
    },
    {
      id: 'state',
      title: 'State & dependency architecture',
      subtitle: 'Provide / inject & Pinia',
      description: 'Put state in the right place, from a single component to the entire app.',
      tag: 'APPLICATION DESIGN',
      lessons: lessonsBySection['state'] ?? [],
    },
    {
      id: 'routing',
      title: 'Routing & application boundaries',
      subtitle: 'Layouts, guards & lazy loading',
      description: 'Make navigation a deliberate part of your application architecture.',
      tag: 'APPLICATION DESIGN',
      lessons: lessonsBySection['routing'] ?? [],
    },
    {
      id: 'structure',
      title: 'Enterprise project structure',
      subtitle: 'Features, domains & public APIs',
      description: 'Organize for change with enforceable boundaries and small public interfaces.',
      tag: 'APPLICATION DESIGN',
      lessons: lessonsBySection['structure'] ?? [],
    },
    {
      id: 'server-state',
      title: 'Server-state architecture',
      subtitle: 'Queries, caching & mutations',
      description: 'Separate remote data from client state and make freshness explicit.',
      tag: 'AT SCALE',
      lessons: lessonsBySection['server-state'] ?? [],
    },
    {
      id: 'testing',
      title: 'Testing with confidence',
      subtitle: 'Vitest & Vue Test Utils',
      description: 'Test observable behavior across pure logic, components, and user journeys.',
      tag: 'AT SCALE',
      lessons: lessonsBySection['testing'] ?? [],
    },
    {
      id: 'production',
      title: 'Production architecture',
      subtitle: 'Resilience, performance & visibility',
      description: 'Build the feedback loops and safeguards your production app needs.',
      tag: 'AT SCALE',
      lessons: lessonsBySection['production'] ?? [],
    },
    {
      id: 'nuxt',
      title: 'Nuxt 4 architecture',
      subtitle: 'SSR, layers & shared packages',
      description: 'Extend your Vue architecture across the server and browser boundary.',
      tag: 'FULL STACK',
      lessons: lessonsBySection['nuxt'] ?? [],
    },
  ],
};
