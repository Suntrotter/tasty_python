export type LessonStatus =
  | "planned"
  | "in_progress"
  | "published"
  | "premium"
  | "coming_soon";

export type TrackStatus = "planned" | "in_progress" | "published";

export type LessonDifficulty = "beginner" | "easy" | "medium";

export interface Track {
  slug: string;
  title: string;
  description: string;
  status: TrackStatus;
  lessonCount: number;
}

export interface LessonPreview {
  slug: string;
  trackSlug: string;
  order: number;
  title: string;
  status: LessonStatus;
  difficulty: LessonDifficulty;
  estimatedTime: string;
  shortDescription: string;
}