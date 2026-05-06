const PRACTICE_STORAGE_KEY = "tasty-python-practice-attempts";

export type PracticeExerciseType = "multiple_choice" | "coding";

export interface PracticeAttempt {
  id: string;
  lessonSlug: string;
  sectionId: string;
  itemKey: string;
  itemTitle: string;
  exerciseType: PracticeExerciseType;
  isCorrect: boolean;
  firstAttempt: boolean;
  selectedAnswer?: string;
  correctAnswer?: string;
  actualOutput?: string;
  expectedOutput?: string;
  errorOutput?: string;
  attemptedAt: string;
}

export interface PracticeAttemptInput {
  lessonSlug: string;
  sectionId: string;
  itemKey: string;
  itemTitle: string;
  exerciseType: PracticeExerciseType;
  isCorrect: boolean;
  selectedAnswer?: string;
  correctAnswer?: string;
  actualOutput?: string;
  expectedOutput?: string;
  errorOutput?: string;
}

export interface LessonPracticeStats {
  lessonSlug: string;
  totalFirstAttempts: number;
  correctFirstAttempts: number;
  accuracy: number | null;
}

function createAttemptId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function readPracticeAttempts(): PracticeAttempt[] {
  try {
    const rawAttempts = localStorage.getItem(PRACTICE_STORAGE_KEY);

    if (!rawAttempts) {
      return [];
    }

    const parsedAttempts = JSON.parse(rawAttempts);

    if (!Array.isArray(parsedAttempts)) {
      return [];
    }

    return parsedAttempts;
  } catch {
    return [];
  }
}

function savePracticeAttempts(attempts: PracticeAttempt[]) {
  localStorage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(attempts));
}

export function hasFirstPracticeAttempt(
  lessonSlug: string,
  itemKey: string
): boolean {
  return readPracticeAttempts().some(
    (attempt) =>
      attempt.lessonSlug === lessonSlug &&
      attempt.itemKey === itemKey &&
      attempt.firstAttempt
  );
}

export function recordPracticeAttempt(input: PracticeAttemptInput) {
  const previousAttempts = readPracticeAttempts();

  const alreadyHasFirstAttempt = previousAttempts.some(
    (attempt) =>
      attempt.lessonSlug === input.lessonSlug &&
      attempt.itemKey === input.itemKey &&
      attempt.firstAttempt
  );

  const nextAttempt: PracticeAttempt = {
    id: createAttemptId(),
    ...input,
    firstAttempt: !alreadyHasFirstAttempt,
    attemptedAt: new Date().toISOString(),
  };

  const nextAttempts = [...previousAttempts, nextAttempt];

  savePracticeAttempts(nextAttempts);

  return nextAttempt;
}

export function getLessonPracticeStats(
  lessonSlug: string
): LessonPracticeStats {
  const firstAttempts = readPracticeAttempts().filter(
    (attempt) => attempt.lessonSlug === lessonSlug && attempt.firstAttempt
  );

  const totalFirstAttempts = firstAttempts.length;
  const correctFirstAttempts = firstAttempts.filter(
    (attempt) => attempt.isCorrect
  ).length;

  return {
    lessonSlug,
    totalFirstAttempts,
    correctFirstAttempts,
    accuracy:
      totalFirstAttempts > 0
        ? Math.round((correctFirstAttempts / totalFirstAttempts) * 100)
        : null,
  };
}

export function getAllLessonPracticeStats(): LessonPracticeStats[] {
  const attempts = readPracticeAttempts();
  const lessonSlugs = Array.from(
    new Set(attempts.map((attempt) => attempt.lessonSlug))
  );

  return lessonSlugs.map((lessonSlug) => getLessonPracticeStats(lessonSlug));
}

export function clearPracticeAttempts() {
  localStorage.removeItem(PRACTICE_STORAGE_KEY);
}