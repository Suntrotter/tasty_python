import type { LessonPreview } from "../types/curriculum";
import { API_BASE_URL } from "./apiConfig";

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

export function mapBackendLesson(lesson: BackendLessonPreview): LessonPreview {
  return {
    slug: lesson.slug,
    trackSlug: lesson.track_slug,
    order: lesson.order,
    title: lesson.title,
    status: lesson.status,
    difficulty: lesson.difficulty,
    estimatedTime: lesson.estimated_time,
    shortDescription: lesson.short_description,
    hasContent: lesson.has_content ?? false,
  };
}

export async function fetchLessons(): Promise<LessonPreview[]> {
  const response = await fetch(`${API_BASE_URL}/api/lessons`);

  if (!response.ok) {
    throw new Error("Failed to fetch lessons");
  }

  const data = (await response.json()) as BackendLessonPreview[];

  return data.map(mapBackendLesson);
}

export async function fetchLessonsByTrackSlug(
  trackSlug: string
): Promise<LessonPreview[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/tracks/${trackSlug}/lessons`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch track lessons");
  }

  const data = (await response.json()) as BackendLessonPreview[];

  return data.map(mapBackendLesson);
}

export async function fetchLessonBySlug(
  lessonSlug: string
): Promise<LessonPreview> {
  const response = await fetch(`${API_BASE_URL}/api/lessons/${lessonSlug}`);

  if (!response.ok) {
    throw new Error("Failed to fetch lesson");
  }

  const data = (await response.json()) as BackendLessonPreview;

  return mapBackendLesson(data);
}