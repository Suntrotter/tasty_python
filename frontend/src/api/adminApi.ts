import type { LessonPreview, LessonStatus } from "../types/curriculum";
import { mapBackendLesson } from "./lessonsApi";
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
}

export async function updateLessonStatus(
  lessonSlug: string,
  status: LessonStatus
): Promise<LessonPreview> {
  const response = await fetch(
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