import {
  getAdminAuthHeaders,
  logoutAdmin,
} from "../features/admin/adminAuth";
import type { LessonBlock, LessonBlockType } from "../types/lessonBlock";
import type {
  LessonContent,
  LessonImagePosition,
  LessonSection,
  LessonTable,
  LessonTextItem,
} from "../types/lesson";
import type {
  LessonDifficulty,
  LessonPreview,
  LessonStatus,
  Track,
  TrackStatus,
} from "../types/curriculum";
import { API_BASE_URL } from "./apiConfig";
import { mapBackendLesson } from "./lessonsApi";
import type { HeroVisual } from "../types/heroVisual";

interface BackendLessonPreview {
  slug: string;
  track_slug: string;
  order: number;
  title: string;
  status: LessonPreview["status"];
  difficulty: LessonPreview["difficulty"];
  estimated_time: string;
  short_description: string;
  has_content?: boolean;
}

interface BackendLessonBlock {
  id?: number | null;
  key: string;
  type: LessonBlockType;
  order: number;
  data?: Record<string, unknown> | null;
}

interface LessonMetadataPayload {
  title: string;
  shortDescription: string;
  difficulty: LessonDifficulty;
  estimatedTime: string;
  order: number;
}

interface TrackMetadataPayload {
  title: string;
  description: string;
  status: TrackStatus;
  lessonCount: number;
}

interface LessonBlockPayload {
  type: LessonBlockType;
  data: Record<string, unknown>;
}

interface LessonContentBasicsPayload {
  title: string;
  goal: string;
  imagePrompts: string[];
  heroVisual?: HeroVisual;
  completionImageUrl?: string;
  completionImageAlt?: string;
  completionKicker?: string;
  completionTitle?: string;
  completionBody?: string;
}

interface LessonMarkdownImportPayload {
  markdown: string;
}

interface LessonItemPayload {
  title?: string;
  content: string;
  code?: string;
  output?: string;
  afterText?: string;
  imageUrl?: string;
  imageAlt?: string;
}

interface LessonItemUpdatePayload {
  title?: string;
  content: string;
  code?: string;
  output?: string;
  afterText?: string;
  imageUrl?: string;
  imageAlt?: string;
}

interface LessonTablePayload {
  headers: string[];
  rows: string[][];
}

interface LessonSectionUpdatePayload {
  type: LessonSection["type"];
  title: string;
  paragraphs: string[];
  code?: string;
  output?: string;
  imageUrl?: string;
  imageAlt?: string;
  imagePosition?: LessonImagePosition;
}

interface LessonSectionPayload {
  type: LessonSection["type"];
  title: string;
  paragraphs: string[];
  code?: string;
  output?: string;
  imageUrl?: string;
  imageAlt?: string;
  imagePosition?: LessonImagePosition;
}

interface BackendTrack {
  slug: string;
  title: string;
  description: string;
  status: TrackStatus;
  lesson_count: number;
}

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

function buildAdminHeaders(headers?: HeadersInit) {
  const nextHeaders = new Headers(headers);
  const adminHeaders = getAdminAuthHeaders();

  Object.entries(adminHeaders).forEach(([key, value]) => {
    nextHeaders.set(key, value);
  });

  return nextHeaders;
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

function handleUnauthorizedAdminRequest() {
  logoutAdmin();

  const currentPath = window.location.pathname + window.location.search;
  const redirectUrl = `/admin-login?from=${encodeURIComponent(currentPath)}`;

  window.location.assign(redirectUrl);
}

async function adminFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const response = await fetch(input, {
    ...init,
    headers: buildAdminHeaders(init.headers),
  });

  if (response.status === 401) {
    handleUnauthorizedAdminRequest();
    throw new Error("Admin session expired. Please log in again.");
  }

  return response;
}

function mapBackendTrack(track: BackendTrack): Track {
  return {
    slug: track.slug,
    title: track.title,
    description: track.description,
    status: track.status,
    lessonCount: track.lesson_count,
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

export async function importLessonMarkdown(
  lessonSlug: string,
  payload: LessonMarkdownImportPayload
): Promise<LessonContent> {
  const response = await adminFetch(
    `${API_BASE_URL}/api/admin/lessons/${lessonSlug}/import-markdown`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        markdown: payload.markdown,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to import lesson markdown");
  }

  const data = (await response.json()) as BackendLessonContent;

  return mapLessonContent(data);
}

export async function upsertLessonSectionTable(
  lessonSlug: string,
  sectionKey: string,
  payload: LessonTablePayload
): Promise<LessonContent> {
  const response = await adminFetch(
    `${API_BASE_URL}/api/admin/lessons/${lessonSlug}/sections/${encodeURIComponent(
      sectionKey
    )}/table`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        headers: payload.headers,
        rows: payload.rows,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update lesson section table");
  }

  const data = (await response.json()) as BackendLessonContent;

  return mapLessonContent(data);
}

export async function createLessonSectionItem(
  lessonSlug: string,
  sectionKey: string,
  payload: LessonItemPayload
): Promise<LessonContent> {
  const response = await adminFetch(
    `${API_BASE_URL}/api/admin/lessons/${lessonSlug}/sections/${encodeURIComponent(
      sectionKey
    )}/items`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: payload.title || null,
        content: payload.content,
        code: payload.code || null,
        output: payload.output || null,
        after_text: payload.afterText || null,
        image_url: payload.imageUrl || null,
        image_alt: payload.imageAlt || null,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create lesson section item");
  }

  const data = (await response.json()) as BackendLessonContent;

  return mapLessonContent(data);
}

export async function updateLessonSectionItem(
  lessonSlug: string,
  sectionKey: string,
  itemId: number,
  payload: LessonItemUpdatePayload
): Promise<LessonContent> {
  const response = await adminFetch(
    `${API_BASE_URL}/api/admin/lessons/${lessonSlug}/sections/${encodeURIComponent(
      sectionKey
    )}/items/${itemId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: payload.title || null,
        content: payload.content,
        code: payload.code || null,
        output: payload.output || null,
        after_text: payload.afterText || null,
        image_url: payload.imageUrl || null,
        image_alt: payload.imageAlt || null,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update lesson section item");
  }

  const data = (await response.json()) as BackendLessonContent;

  return mapLessonContent(data);
}

export async function deleteLessonSectionItem(
  lessonSlug: string,
  sectionKey: string,
  itemId: number
): Promise<LessonContent> {
  const response = await adminFetch(
    `${API_BASE_URL}/api/admin/lessons/${lessonSlug}/sections/${encodeURIComponent(
      sectionKey
    )}/items/${itemId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete lesson section item");
  }

  const data = (await response.json()) as BackendLessonContent;

  return mapLessonContent(data);
}

export async function updateLessonSection(
  lessonSlug: string,
  sectionKey: string,
  payload: LessonSectionUpdatePayload
): Promise<LessonContent> {
  const response = await adminFetch(
    `${API_BASE_URL}/api/admin/lessons/${lessonSlug}/sections/${encodeURIComponent(
      sectionKey
    )}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: payload.type,
        title: payload.title,
        paragraphs: payload.paragraphs,
        code: payload.code || null,
        output: payload.output || null,
        image_url: payload.imageUrl || null,
        image_alt: payload.imageAlt || null,
        image_position: payload.imagePosition || null,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update lesson section");
  }

  const data = (await response.json()) as BackendLessonContent;

  return mapLessonContent(data);
}

export async function updateLessonStatus(
  lessonSlug: string,
  status: LessonStatus
): Promise<LessonPreview> {
  const response = await adminFetch(
    `${API_BASE_URL}/api/admin/lessons/${lessonSlug}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update lesson status");
  }

  const data = (await response.json()) as BackendLessonPreview;

  return mapBackendLesson(data);
}

export async function updateLessonMetadata(
  lessonSlug: string,
  payload: LessonMetadataPayload
): Promise<LessonPreview> {
  const response = await adminFetch(
    `${API_BASE_URL}/api/admin/lessons/${lessonSlug}/metadata`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: payload.title,
        short_description: payload.shortDescription,
        difficulty: payload.difficulty,
        estimated_time: payload.estimatedTime,
        order: payload.order,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update lesson metadata");
  }

  const data = (await response.json()) as BackendLessonPreview;

  return mapBackendLesson(data);
}

export async function deleteLessonSection(
  lessonSlug: string,
  sectionKey: string
): Promise<LessonContent> {
  const response = await adminFetch(
    `${API_BASE_URL}/api/admin/lessons/${lessonSlug}/sections/${encodeURIComponent(
      sectionKey
    )}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete lesson section");
  }

  const data = (await response.json()) as BackendLessonContent;

  return mapLessonContent(data);
}

export async function updateLessonContentBasics(
  lessonSlug: string,
  payload: LessonContentBasicsPayload
): Promise<LessonContent> {
  const response = await adminFetch(
    `${API_BASE_URL}/api/admin/lessons/${lessonSlug}/content-basics`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: payload.title,
        goal: payload.goal,
        image_prompts: payload.imagePrompts,
        hero_visual: payload.heroVisual || null,
        completion_image_url: payload.completionImageUrl || null,
        completion_image_alt: payload.completionImageAlt || null,
        completion_kicker: payload.completionKicker || null,
        completion_title: payload.completionTitle || null,
        completion_body: payload.completionBody || null,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update lesson content basics");
  }

  const data = (await response.json()) as BackendLessonContent;

  return mapLessonContent(data);
}

export async function updateTrackMetadata(
  trackSlug: string,
  payload: TrackMetadataPayload
): Promise<Track> {
  const response = await adminFetch(
    `${API_BASE_URL}/api/admin/tracks/${trackSlug}/metadata`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: payload.title,
        description: payload.description,
        status: payload.status,
        lesson_count: payload.lessonCount,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update track metadata");
  }

  const data = (await response.json()) as BackendTrack;

  return mapBackendTrack(data);
}

export async function createLessonSection(
  lessonSlug: string,
  payload: LessonSectionPayload
): Promise<LessonContent> {
  const response = await adminFetch(
    `${API_BASE_URL}/api/admin/lessons/${lessonSlug}/sections`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: payload.type,
        title: payload.title,
        paragraphs: payload.paragraphs,
        code: payload.code || null,
        output: payload.output || null,
        image_url: payload.imageUrl || null,
        image_alt: payload.imageAlt || null,
        image_position: payload.imagePosition || null,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create lesson section");
  }

  const data = (await response.json()) as BackendLessonContent;

  return mapLessonContent(data);
}

export async function createLessonSectionBlock(
  lessonSlug: string,
  sectionKey: string,
  payload: LessonBlockPayload
): Promise<LessonContent> {
  const response = await adminFetch(
    `${API_BASE_URL}/api/admin/lessons/${lessonSlug}/sections/${encodeURIComponent(
      sectionKey
    )}/blocks`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: payload.type,
        data: payload.data,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create lesson block");
  }

  const data = (await response.json()) as BackendLessonContent;

  return mapLessonContent(data);
}

export async function updateLessonSectionBlock(
  lessonSlug: string,
  sectionKey: string,
  blockId: number,
  payload: LessonBlockPayload
): Promise<LessonContent> {
  const response = await adminFetch(
    `${API_BASE_URL}/api/admin/lessons/${lessonSlug}/sections/${encodeURIComponent(
      sectionKey
    )}/blocks/${blockId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: payload.type,
        data: payload.data,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update lesson block");
  }

  const data = (await response.json()) as BackendLessonContent;

  return mapLessonContent(data);
}

export async function deleteLessonSectionBlock(
  lessonSlug: string,
  sectionKey: string,
  blockId: number
): Promise<LessonContent> {
  const response = await adminFetch(
    `${API_BASE_URL}/api/admin/lessons/${lessonSlug}/sections/${encodeURIComponent(
      sectionKey
    )}/blocks/${blockId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete lesson block");
  }

  const data = (await response.json()) as BackendLessonContent;

  return mapLessonContent(data);
}

export async function duplicateLessonSectionBlock(
  lessonSlug: string,
  sectionKey: string,
  blockId: number
): Promise<LessonContent> {
  const response = await adminFetch(
    `${API_BASE_URL}/api/admin/lessons/${lessonSlug}/sections/${encodeURIComponent(
      sectionKey
    )}/blocks/${blockId}/duplicate`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to duplicate lesson block");
  }

  const data = (await response.json()) as BackendLessonContent;

  return mapLessonContent(data);
}

export async function reorderLessonSectionBlocks(
  lessonSlug: string,
  sectionKey: string,
  blockIds: number[]
): Promise<LessonContent> {
  const response = await adminFetch(
    `${API_BASE_URL}/api/admin/lessons/${lessonSlug}/sections/${encodeURIComponent(
      sectionKey
    )}/blocks/reorder`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        block_ids: blockIds,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to reorder lesson blocks");
  }

  const data = (await response.json()) as BackendLessonContent;

  return mapLessonContent(data);
}