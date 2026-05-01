import type { LessonPreview } from "../types/curriculum";

export const lessons: LessonPreview[] = [
  {
    slug: "variables-and-assignment",
    trackSlug: "python-core",
    order: 1,
    title: "Variables and Assignment",
    status: "published",
    difficulty: "beginner",
    estimatedTime: "10–15 min",
    shortDescription:
      "Understand what variables are, how assignment works, and what reassignment means.",
  },
  {
    slug: "mutable-vs-immutable-objects",
    trackSlug: "python-core",
    order: 2,
    title: "Mutable vs Immutable Objects",
    status: "in_progress",
    difficulty: "beginner",
    estimatedTime: "15–20 min",
    shortDescription:
      "Learn why some Python objects can change and others cannot.",
  },
  {
    slug: "dynamic-typing-in-python",
    trackSlug: "python-core",
    order: 3,
    title: "Dynamic Typing in Python",
    status: "coming_soon",
    difficulty: "beginner",
    estimatedTime: "10–15 min",
    shortDescription:
      "Understand why variable names in Python are not locked to one type.",
  },
  {
    slug: "is-vs-equals",
    trackSlug: "python-core",
    order: 4,
    title: "is vs ==",
    status: "coming_soon",
    difficulty: "beginner",
    estimatedTime: "15 min",
    shortDescription:
      "Learn the difference between identity comparison and value comparison.",
  },
  {
    slug: "truthy-and-falsy-values",
    trackSlug: "python-core",
    order: 5,
    title: "Truthy and Falsy Values",
    status: "planned",
    difficulty: "beginner",
    estimatedTime: "10–15 min",
    shortDescription:
      "Learn how Python decides whether a value behaves like True or False.",
  },
  {
    slug: "basic-input-output",
    trackSlug: "python-core",
    order: 6,
    title: "Basic Input / Output",
    status: "planned",
    difficulty: "beginner",
    estimatedTime: "10–15 min",
    shortDescription:
      "Work with print(), input(), and simple user interaction.",
  },
  {
    slug: "what-is-a-class",
    trackSlug: "oop",
    order: 1,
    title: "What Is a Class?",
    status: "planned",
    difficulty: "beginner",
    estimatedTime: "15 min",
    shortDescription:
      "Understand classes as blueprints for creating objects.",
  },
  {
    slug: "what-is-an-object",
    trackSlug: "oop",
    order: 2,
    title: "What Is an Object?",
    status: "planned",
    difficulty: "beginner",
    estimatedTime: "15 min",
    shortDescription:
      "Learn how objects combine data and behavior.",
  },
  {
    slug: "defining-functions",
    trackSlug: "functions",
    order: 1,
    title: "Defining Functions",
    status: "planned",
    difficulty: "beginner",
    estimatedTime: "15 min",
    shortDescription:
      "Learn how to create reusable blocks of Python code with def.",
  },
];

export function getLessonsByTrackSlug(trackSlug: string) {
  return lessons
    .filter((lesson) => lesson.trackSlug === trackSlug)
    .sort((a, b) => a.order - b.order);
}

export function getLessonBySlug(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug);
}