import { API_BASE_URL } from "./apiConfig";

interface ProgressResponse {
  learner_id: string;
  completed_lesson_slugs: string[];
}

function mapProgressResponse(response: ProgressResponse) {
  return {
    learnerId: response.learner_id,
    completedLessonSlugs: response.completed_lesson_slugs,
  };
}

export async function fetchProgress(learnerId: string) {
  const response = await fetch(`${API_BASE_URL}/api/progress/${learnerId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch progress");
  }

  const data = (await response.json()) as ProgressResponse;

  return mapProgressResponse(data);
}

export async function markLessonCompletedApi(
  learnerId: string,
  lessonSlug: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/progress/${learnerId}/lessons/${lessonSlug}`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to mark lesson completed");
  }

  const data = (await response.json()) as ProgressResponse;

  return mapProgressResponse(data);
}

export async function markLessonIncompleteApi(
  learnerId: string,
  lessonSlug: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/progress/${learnerId}/lessons/${lessonSlug}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to mark lesson incomplete");
  }

  const data = (await response.json()) as ProgressResponse;

  return mapProgressResponse(data);
}