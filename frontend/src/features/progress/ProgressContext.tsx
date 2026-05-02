import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchProgress,
  markLessonCompletedApi,
  markLessonIncompleteApi,
} from "../../api/progressApi";
import { getOrCreateLearnerId } from "./learnerId";

const STORAGE_KEY = "tasty-python-progress";

interface StoredProgress {
  completedLessonSlugs: string[];
  updatedAt: string;
}

type ProgressSource = "checking" | "backend" | "local";

interface ProgressContextValue {
  learnerId: string;
  completedLessonSlugs: string[];
  completedLessonsCount: number;
  progressSource: ProgressSource;
  isProgressLoading: boolean;
  isLessonCompleted: (lessonSlug: string) => boolean;
  markLessonCompleted: (lessonSlug: string) => Promise<void>;
  markLessonIncomplete: (lessonSlug: string) => Promise<void>;
  toggleLessonCompletion: (lessonSlug: string) => Promise<void>;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(
  undefined
);

function readCompletedLessonsFromLocalStorage(): string[] {
  try {
    const rawProgress = localStorage.getItem(STORAGE_KEY);

    if (!rawProgress) {
      return [];
    }

    const parsedProgress = JSON.parse(rawProgress) as StoredProgress;

    if (!Array.isArray(parsedProgress.completedLessonSlugs)) {
      return [];
    }

    return parsedProgress.completedLessonSlugs;
  } catch {
    return [];
  }
}

function saveCompletedLessonsToLocalStorage(completedLessonSlugs: string[]) {
  const uniqueLessonSlugs = Array.from(new Set(completedLessonSlugs));

  const progress: StoredProgress = {
    completedLessonSlugs: uniqueLessonSlugs,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

interface ProgressProviderProps {
  children: ReactNode;
}

export function ProgressProvider({ children }: ProgressProviderProps) {
  const [learnerId] = useState(getOrCreateLearnerId);

  const [completedLessonSlugs, setCompletedLessonSlugs] = useState<string[]>(
    readCompletedLessonsFromLocalStorage
  );

  const [progressSource, setProgressSource] =
    useState<ProgressSource>("checking");

  const [isProgressLoading, setIsProgressLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      try {
        const progress = await fetchProgress(learnerId);

        setCompletedLessonSlugs(progress.completedLessonSlugs);
        saveCompletedLessonsToLocalStorage(progress.completedLessonSlugs);
        setProgressSource("backend");
      } catch {
        const localCompletedLessons = readCompletedLessonsFromLocalStorage();

        setCompletedLessonSlugs(localCompletedLessons);
        setProgressSource("local");
      } finally {
        setIsProgressLoading(false);
      }
    }

    loadProgress();
  }, [learnerId]);

  function isLessonCompleted(lessonSlug: string) {
    return completedLessonSlugs.includes(lessonSlug);
  }

  async function markLessonCompleted(lessonSlug: string) {
    const optimisticSlugs = Array.from(
      new Set([...completedLessonSlugs, lessonSlug])
    );

    setCompletedLessonSlugs(optimisticSlugs);
    saveCompletedLessonsToLocalStorage(optimisticSlugs);

    try {
      const progress = await markLessonCompletedApi(learnerId, lessonSlug);

      setCompletedLessonSlugs(progress.completedLessonSlugs);
      saveCompletedLessonsToLocalStorage(progress.completedLessonSlugs);
      setProgressSource("backend");
    } catch {
      setProgressSource("local");
    }
  }

  async function markLessonIncomplete(lessonSlug: string) {
    const optimisticSlugs = completedLessonSlugs.filter(
      (slug) => slug !== lessonSlug
    );

    setCompletedLessonSlugs(optimisticSlugs);
    saveCompletedLessonsToLocalStorage(optimisticSlugs);

    try {
      const progress = await markLessonIncompleteApi(learnerId, lessonSlug);

      setCompletedLessonSlugs(progress.completedLessonSlugs);
      saveCompletedLessonsToLocalStorage(progress.completedLessonSlugs);
      setProgressSource("backend");
    } catch {
      setProgressSource("local");
    }
  }

  async function toggleLessonCompletion(lessonSlug: string) {
    if (isLessonCompleted(lessonSlug)) {
      await markLessonIncomplete(lessonSlug);
      return;
    }

    await markLessonCompleted(lessonSlug);
  }

  const value = useMemo(
    () => ({
      learnerId,
      completedLessonSlugs,
      completedLessonsCount: completedLessonSlugs.length,
      progressSource,
      isProgressLoading,
      isLessonCompleted,
      markLessonCompleted,
      markLessonIncomplete,
      toggleLessonCompletion,
    }),
    [learnerId, completedLessonSlugs, progressSource, isProgressLoading]
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgressContext() {
  const context = useContext(ProgressContext);

  if (!context) {
    throw new Error("useProgressContext must be used inside ProgressProvider");
  }

  return context;
}