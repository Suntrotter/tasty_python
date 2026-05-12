import { API_BASE_URL } from "./apiConfig";

export interface HomeSummaryLesson {
  id: string;
  slug: string;
  title: string;
  lessonNumber?: number | null;
  level?: string | null;
  duration?: string | null;
  summary?: string | null;
}

export interface HomeSummaryResponse {
  userId: number;
  hasProgress: boolean;
  completedLessonsCount: number;
  totalLessonsCount: number;
  allLessonsCompleted: boolean;

  nextLesson: HomeSummaryLesson | null;

  heroBite: {
    kicker: string;
    title: string;
    lines: string[];
    description: string;
  };

  primaryCta: {
    label: string;
    to: string;
  };

  secondaryCta: {
    label: string;
    to: string;
  };
}

export async function fetchHomeSummary(
  idToken: string
): Promise<HomeSummaryResponse> {
  const response = await fetch(`${API_BASE_URL}/api/progress/me/home-summary`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch home summary");
  }

  return response.json() as Promise<HomeSummaryResponse>;
}