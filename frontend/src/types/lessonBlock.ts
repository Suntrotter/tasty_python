export type LessonBlockType =
  | "rich_text"
  | "code"
  | "callout"
  | "image"
  | "table"
  | "practice_single"
  | "practice_multi"
  | "practice_code"
  | "accordion";

export type CalloutTone = "info" | "success" | "warning" | "danger";

export interface LessonBlock {
  id?: number;
  key: string;
  type: LessonBlockType;
  order: number;
  data: Record<string, unknown>;
}

export interface RichTextBlockData {
  markdown?: string;
}

export interface CodeBlockData {
  language?: string;
  code?: string;
  title?: string;
}

export interface CalloutBlockData {
  tone?: CalloutTone;
  title?: string;
  markdown?: string;
  codeLanguage?: string;
  codeTitle?: string;
  code?: string;
  afterMarkdown?: string;
}

export interface ImageBlockData {
  imageUrl?: string;
  imageAlt?: string;
  caption?: string;
}

export interface TableBlockData {
  headers?: string[];
  rows?: string[][];
}

export interface AccordionBlockData {
  title?: string;
  markdown?: string;
}

export interface PracticeOption {
  key: string;
  text: string;
}

export interface PracticeSingleBlockData {
  question?: string;
  code?: string;
  options?: PracticeOption[];
  correctAnswer?: string;
  explanation?: string;
}

export interface PracticeMultiBlockData {
  question?: string;
  code?: string;
  options?: PracticeOption[];
  correctAnswers?: string[];
  explanation?: string;
}

export interface PracticeCodeBlockData {
  task?: string;
  starterCode?: string;
  expectedOutput?: string;
  explanation?: string;
}