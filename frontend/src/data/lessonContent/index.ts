import type { LessonContent } from "../../types/lesson";
import { mutableVsImmutableLesson } from "./mutableVsImmutable";
import { variablesAndAssignmentLesson } from "./variablesAndAssignment";

export const lessonContents: LessonContent[] = [
  variablesAndAssignmentLesson,
  mutableVsImmutableLesson,
];

export function getLessonContentBySlug(slug: string) {
  return lessonContents.find((lesson) => lesson.slug === slug);
}