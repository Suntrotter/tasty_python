import { useState } from "react";

const STORAGE_KEY = "tasty-python-progress";

interface StoredProgress {
  completedLessonSlugs: string[];
  updatedAt: string;
}

function readCompletedLessons(): string[] {
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

function saveCompletedLessons(completedLessonSlugs: string[]) {
  const uniqueLessonSlugs = Array.from(new Set(completedLessonSlugs));

  const progress: StoredProgress = {
    completedLessonSlugs: uniqueLessonSlugs,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function useLessonProgress() {
  const [completedLessonSlugs, setCompletedLessonSlugs] =
    useState<string[]>(readCompletedLessons);

  function isLessonCompleted(lessonSlug: string) {
    return completedLessonSlugs.includes(lessonSlug);
  }

  function markLessonCompleted(lessonSlug: string) {
    setCompletedLessonSlugs((currentSlugs) => {
      if (currentSlugs.includes(lessonSlug)) {
        return currentSlugs;
      }

      const updatedSlugs = [...currentSlugs, lessonSlug];
      saveCompletedLessons(updatedSlugs);

      return updatedSlugs;
    });
  }

  function markLessonIncomplete(lessonSlug: string) {
    setCompletedLessonSlugs((currentSlugs) => {
      const updatedSlugs = currentSlugs.filter((slug) => slug !== lessonSlug);
      saveCompletedLessons(updatedSlugs);

      return updatedSlugs;
    });
  }

  function toggleLessonCompletion(lessonSlug: string) {
    if (isLessonCompleted(lessonSlug)) {
      markLessonIncomplete(lessonSlug);
      return;
    }

    markLessonCompleted(lessonSlug);
  }

  return {
    completedLessonSlugs,
    completedLessonsCount: completedLessonSlugs.length,
    isLessonCompleted,
    markLessonCompleted,
    markLessonIncomplete,
    toggleLessonCompletion,
  };
}