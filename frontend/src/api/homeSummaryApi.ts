import { API_BASE_URL } from "./apiConfig";

interface BackendHomeSummaryLesson {
  id?: string;
  slug?: string;
  title?: string;
  lesson_number?: number;
  lessonNumber?: number;
  level?: string;
  difficulty?: string;
  duration?: string;
  estimated_time?: string;
  estimatedTime?: string;
  summary?: string;
  short_description?: string;
  shortDescription?: string;
}

interface BackendHeroBite {
  kicker?: string;
  title?: string;
  lines?: string[];
  description?: string;
}

interface BackendCta {
  label?: string;
  to?: string;
  href?: string;
  url?: string;
}

interface BackendHomeSummaryResponse {
  learner_id?: string;
  learnerId?: string;
  has_progress?: boolean;
  hasProgress?: boolean;
  completed_lessons_count?: number;
  completedLessonsCount?: number;
  total_lessons_count?: number;
  totalLessonsCount?: number;
  all_lessons_completed?: boolean;
  allLessonsCompleted?: boolean;
  next_lesson?: BackendHomeSummaryLesson | null;
  nextLesson?: BackendHomeSummaryLesson | null;
  hero_bite?: BackendHeroBite;
  heroBite?: BackendHeroBite;
  primary_cta?: BackendCta;
  primaryCta?: BackendCta;
  secondary_cta?: BackendCta;
  secondaryCta?: BackendCta;
}

export interface HomeSummaryLesson {
  id: string;
  slug: string;
  title: string;
  lessonNumber?: number;
  level?: string;
  duration?: string;
  summary?: string;
}

export interface HomeSummaryCta {
  label: string;
  to: string;
}

export interface HomeSummary {
  learnerId?: string;
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
  primaryCta: HomeSummaryCta;
  secondaryCta: HomeSummaryCta;
}

function mapLesson(
  lesson: BackendHomeSummaryLesson | null | undefined
): HomeSummaryLesson | null {
  if (!lesson) {
    return null;
  }

  const slug = lesson.slug ?? "";

  return {
    id: String(lesson.id ?? slug ?? lesson.title ?? ""),
    slug,
    title: lesson.title ?? "Untitled lesson",
    lessonNumber: lesson.lessonNumber ?? lesson.lesson_number,
    level: lesson.level ?? lesson.difficulty,
    duration: lesson.duration ?? lesson.estimatedTime ?? lesson.estimated_time,
    summary: lesson.summary ?? lesson.shortDescription ?? lesson.short_description,
  };
}

function mapCta(
  cta: BackendCta | undefined,
  fallback: HomeSummaryCta
): HomeSummaryCta {
  return {
    label: cta?.label ?? fallback.label,
    to: cta?.to ?? cta?.href ?? cta?.url ?? fallback.to,
  };
}

function buildLessonLink(lesson: HomeSummaryLesson | null) {
  if (!lesson?.slug) {
    return "/tracks";
  }

  return `/lessons/${lesson.slug}`;
}

function mapHomeSummaryResponse(
  response: BackendHomeSummaryResponse
): HomeSummary {
  const completedLessonsCount =
    response.completedLessonsCount ?? response.completed_lessons_count ?? 0;

  const totalLessonsCount =
    response.totalLessonsCount ?? response.total_lessons_count ?? 0;

  const nextLesson = mapLesson(response.nextLesson ?? response.next_lesson);

  const hasProgress =
    response.hasProgress ?? response.has_progress ?? completedLessonsCount > 0;

  const allLessonsCompleted =
    response.allLessonsCompleted ??
    response.all_lessons_completed ??
    (totalLessonsCount > 0 && completedLessonsCount >= totalLessonsCount);

  const defaultPrimaryCta: HomeSummaryCta = allLessonsCompleted
    ? {
        label: "Review progress",
        to: "/dashboard",
      }
    : {
        label: hasProgress ? "Continue learning" : "Start learning",
        to: buildLessonLink(nextLesson),
      };

  const defaultSecondaryCta: HomeSummaryCta = hasProgress
    ? {
        label: "Practice interview answers",
        to: "/interview-mode",
      }
    : {
        label: "See how it works",
        to: "#how-it-works",
      };

  const rawHeroBite = response.heroBite ?? response.hero_bite;

  return {
    learnerId: response.learnerId ?? response.learner_id,
    hasProgress,
    completedLessonsCount,
    totalLessonsCount,
    allLessonsCompleted,
    nextLesson,
    heroBite: {
      kicker:
        rawHeroBite?.kicker ??
        (allLessonsCompleted
          ? "Course complete"
          : hasProgress
          ? "Your next bite"
          : "Your first bite"),
      title:
        rawHeroBite?.title ??
        (allLessonsCompleted
          ? "Review your Python core"
          : nextLesson?.title ?? "Variables are labels"),
      lines:
        rawHeroBite?.lines && rawHeroBite.lines.length > 0
          ? rawHeroBite.lines
          : ['flavor = "mango"', 'flavor = "chocolate"'],
      description:
        rawHeroBite?.description ??
        (allLessonsCompleted
          ? "You have completed the available lessons. Review your progress or practice interview answers."
          : "A name can point to a value. Reassignment moves the label. Simple, visual, memorable."),
    },
    primaryCta: mapCta(
      response.primaryCta ?? response.primary_cta,
      defaultPrimaryCta
    ),
    secondaryCta: mapCta(
      response.secondaryCta ?? response.secondary_cta,
      defaultSecondaryCta
    ),
  };
}

export async function fetchHomeSummary(idToken: string): Promise<HomeSummary> {
  const response = await fetch(`${API_BASE_URL}/api/progress/me/home-summary`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch homepage summary");
  }

  const data = (await response.json()) as BackendHomeSummaryResponse;

  return mapHomeSummaryResponse(data);
}