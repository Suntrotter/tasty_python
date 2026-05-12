import { API_BASE_URL } from "./apiConfig";

interface BackendProgressResponse {
  completed_lesson_slugs: string[];
}

export interface ProgressData {
  completedLessonSlugs: string[];
}

function mapProgressResponse(response: BackendProgressResponse): ProgressData {
  return {
    completedLessonSlugs: response.completed_lesson_slugs,
  };
}

function getAuthHeaders(idToken: string) {
  return {
    Authorization: `Bearer ${idToken}`,
    "Content-Type": "application/json",
  };
}

export async function fetchProgress(idToken: string): Promise<ProgressData> {
  const response = await fetch(`${API_BASE_URL}/api/progress/me`, {
    headers: getAuthHeaders(idToken),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch progress");
  }

  const data = (await response.json()) as BackendProgressResponse;

  return mapProgressResponse(data);
}

export async function updateLessonProgressApi(
  idToken: string,
  lessonSlug: string,
  isCompleted: boolean
): Promise<ProgressData> {
  const response = await fetch(
    `${API_BASE_URL}/api/progress/me/lessons/${lessonSlug}`,
    {
      method: "PUT",
      headers: getAuthHeaders(idToken),
      body: JSON.stringify({
        is_completed: isCompleted,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update lesson progress");
  }

  const data = (await response.json()) as BackendProgressResponse;

  return mapProgressResponse(data);
}

export async function markLessonCompletedApi(
  idToken: string,
  lessonSlug: string
): Promise<ProgressData> {
  return updateLessonProgressApi(idToken, lessonSlug, true);
}

export async function markLessonIncompleteApi(
  idToken: string,
  lessonSlug: string
): Promise<ProgressData> {
  return updateLessonProgressApi(idToken, lessonSlug, false);
}