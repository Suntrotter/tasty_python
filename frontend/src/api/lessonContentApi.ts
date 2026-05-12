import type { HeroVisual } from "../types/heroVisual";
import type { LessonBlock, LessonBlockType } from "../types/lessonBlock";
import type {
  LessonContent,
  LessonImagePosition,
  LessonSection,
  LessonTable,
  LessonTextItem,
} from "../types/lesson";
import { API_BASE_URL } from "./apiConfig";

interface BackendLessonTextItem {
  id?: number | null;
  title?: string | null;
  content: string;
  code?: string | null;
  output?: string | null;
  after_text?: string | null;
  image_url?: string | null;
  image_alt?: string | null;
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
  image_url?: string | null;
  image_alt?: string | null;
  image_position?: LessonImagePosition | null;
  items?: BackendLessonTextItem[] | null;
  table?: BackendLessonTable | null;
  blocks?: BackendLessonBlock[] | null;
}

interface BackendLessonBlock {
  id?: number | null;
  key: string;
  type: LessonBlockType;
  order: number;
  data?: Record<string, unknown> | null;
  blocks?: BackendLessonBlock[] | null;
}

interface BackendLessonContent {
  slug: string;
  title: string;
  goal: string;
  image_prompts?: string[] | null;
  hero_visual?: HeroVisual | null;
  completion_image_url?: string | null;
  completion_image_alt?: string | null;
  completion_kicker?: string | null;
  completion_title?: string | null;
  completion_body?: string | null;
  sections: BackendLessonSection[];
}

function mapLessonBlock(block: BackendLessonBlock): LessonBlock {
  return {
    id: block.id ?? undefined,
    key: block.key,
    type: block.type,
    order: block.order,
    data: block.data ?? {},
  };
}

function mapLessonTextItem(item: BackendLessonTextItem): LessonTextItem {
  return {
    id: item.id ?? undefined,
    title: item.title ?? undefined,
    content: item.content,
    code: item.code ?? undefined,
    output: item.output ?? undefined,
    afterText: item.after_text ?? undefined,
    imageUrl: item.image_url ?? undefined,
    imageAlt: item.image_alt ?? undefined,
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
    imageUrl: section.image_url ?? undefined,
    imageAlt: section.image_alt ?? undefined,
    imagePosition: section.image_position ?? undefined,
    items: section.items?.map(mapLessonTextItem),
    table: section.table ? mapLessonTable(section.table) : undefined,
    blocks: section.blocks?.map(mapLessonBlock),
  };
}

function mapLessonContent(content: BackendLessonContent): LessonContent {
  return {
    slug: content.slug,
    title: content.title,
    goal: content.goal,
    imagePrompts: content.image_prompts ?? undefined,
    heroVisual: content.hero_visual ?? undefined,
    completionImageUrl: content.completion_image_url ?? undefined,
    completionImageAlt: content.completion_image_alt ?? undefined,
    completionKicker: content.completion_kicker ?? undefined,
    completionTitle: content.completion_title ?? undefined,
    completionBody: content.completion_body ?? undefined,
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