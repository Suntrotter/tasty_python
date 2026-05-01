export type LessonSectionType =
  | "metaphor"
  | "theory"
  | "code_example"
  | "interview"
  | "trap_zone"
  | "practice"
  | "cheat_sheet"
  | "answer_key";

export interface LessonTextItem {
  title?: string;
  content: string;
  code?: string;
  output?: string;
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
  items?: LessonTextItem[];
  table?: LessonTable;
}

export interface LessonContent {
  slug: string;
  title: string;
  goal: string;
  imagePrompts?: string[];
  sections: LessonSection[];
}