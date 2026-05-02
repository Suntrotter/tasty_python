import type {
  LessonContent,
  LessonSection,
  LessonTable,
  LessonTextItem,
} from "../types/lesson";
import { API_BASE_URL } from "./apiConfig";

interface BackendLessonTextItem {
  title?: string | null;
  content: string;
  code?: string | null;
  output?: string | null;
}

interface BackendLessonTable {
  headers: string[];
  rows: string[][];
}

interface BackendLessonSection {
  id: string;
  type: LessonSection["type"];
  title: string;
  paragraphs?: string[] | null;
  code?: string | null;
  output?: string | null;
  items?: BackendLessonTextItem[] | null;
  table?: BackendLessonTable | null;
}

interface BackendLessonContent {
  slug: string;
  title: string;
  goal: string;
  image_prompts?: string[] | null;
  sections: BackendLessonSection[];
}

function mapLessonTextItem(item: BackendLessonTextItem): LessonTextItem {
  return {
    title: item.title ?? undefined,
    content: item.content,
    code: item.code ?? undefined,
    output: item.output ?? undefined,
  };
}

function mapLessonTable(table: BackendLessonTable): LessonTable {
  return {
    headers: table.headers,
    rows: table.rows,
  };
}

function mapLessonSection(section: BackendLessonSection): LessonSection {
  return {
    id: section.id,
    type: section.type,
    title: section.title,
    paragraphs: section.paragraphs ?? undefined,
    code: section.code ?? undefined,
    output: section.output ?? undefined,
    items: section.items?.map(mapLessonTextItem),
    table: section.table ? mapLessonTable(section.table) : undefined,
  };
}

function mapLessonContent(content: BackendLessonContent): LessonContent {
  return {
    slug: content.slug,
    title: content.title,
    goal: content.goal,
    imagePrompts: content.image_prompts ?? undefined,
    sections: content.sections.map(mapLessonSection),
  };
}

export async function fetchLessonContentBySlug(
  lessonSlug: string
): Promise<LessonContent> {
  const response = await fetch(
    `${API_BASE_URL}/api/lessons/${lessonSlug}/content`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch lesson content");
  }

  const data = (await response.json()) as BackendLessonContent;

  return mapLessonContent(data);
}