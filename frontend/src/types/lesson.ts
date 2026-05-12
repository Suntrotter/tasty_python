import type { HeroVisual } from "./heroVisual";
import type { LessonBlock } from "./lessonBlock";

export type LessonSectionType =
  | "metaphor"
  | "theory"
  | "code_example"
  | "interview"
  | "trap_zone"
  | "practice"
  | "cheat_sheet"
  | "answer_key";

export type LessonImagePosition = "top" | "after_code" | "bottom";

export interface LessonTextItem {
  id?: number;
  title?: string;
  content: string;
  code?: string;
  output?: string;
  afterText?: string;
  imageUrl?: string;
  imageAlt?: string;
}

export interface LessonTable {
  headers: string[];
  rows: string[][];
}

export interface LessonSection {
  id: string;
  type: LessonSectionType;
  title: string;
  paragraphs?: string[];
  code?: string;
  output?: string;
  imageUrl?: string;
  imageAlt?: string;
  imagePosition?: LessonImagePosition;
  items?: LessonTextItem[];
  table?: LessonTable;
  blocks?: LessonBlock[];
}

export interface LessonContent {
  slug: string;
  title: string;
  goal: string;
  imagePrompts?: string[];
  heroVisual?: HeroVisual;
  completionImageUrl?: string;
  completionImageAlt?: string;
  completionKicker?: string;
  completionTitle?: string;
  completionBody?: string;
  sections: LessonSection[];
}