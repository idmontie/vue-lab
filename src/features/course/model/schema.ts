export type ContentBlock =
  | { type: 'text'; heading: string; body: string[] }
  | {
      type: 'comparison';
      left: { label: string; text: string };
      right: { label: string; text: string };
    }
  | { type: 'code'; language: 'ts' | 'vue' | 'text'; filename: string; code: string }
  | {
      type: 'video';
      youtubeId: string;
      title: string;
      author: string;
      focus?: string;
      note?: string;
      startSeconds?: number;
    }
  | { type: 'resources'; links: { title: string; url: string }[] };

export interface Question {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  required: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  minutes: number;
  summary: string;
  blocks: ContentBlock[];
  questions: Question[];
}

export interface CourseSection {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  version: number;
  title: string;
  shortTitle: string;
  description: string;
  category: string;
  headline: [string, string];
  audienceNote: string;
  fromLabel: string;
  toLabel: string;
  sections: CourseSection[];
}
