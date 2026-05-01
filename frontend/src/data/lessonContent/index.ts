import type { LessonContent } from "../../types/lesson";
import { variablesAndAssignmentLesson } from "./variablesAndAssignment";

export const lessonContents: LessonContent[] = [variablesAndAssignmentLesson];

export function getLessonContentBySlug(slug: string) {
  return lessonContents.find((lesson) => lesson.slug === slug);
}