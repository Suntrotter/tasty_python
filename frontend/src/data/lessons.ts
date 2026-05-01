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
    status: "published",
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
    slug: "type-conversion",
    trackSlug: "python-core",
    order: 7,
    title: "Type Conversion",
    status: "planned",
    difficulty: "beginner",
    estimatedTime: "10–15 min",
    shortDescription:
      "Learn how to convert values with int(), float(), str(), bool(), and avoid common conversion errors.",
  },
  {
    slug: "string-methods",
    trackSlug: "python-core",
    order: 8,
    title: "String Methods",
    status: "planned",
    difficulty: "beginner",
    estimatedTime: "15–20 min",
    shortDescription:
      "Practice useful string methods like lower(), upper(), strip(), replace(), split(), and join().",
  },
  {
    slug: "string-formatting",
    trackSlug: "python-core",
    order: 9,
    title: "String Formatting",
    status: "planned",
    difficulty: "beginner",
    estimatedTime: "15 min",
    shortDescription:
      "Compare f-strings, .format(), and older % formatting in Python.",
  },
  {
    slug: "slicing-strings-and-lists",
    trackSlug: "python-core",
    order: 10,
    title: "Slicing Strings and Lists",
    status: "planned",
    difficulty: "beginner",
    estimatedTime: "15–20 min",
    shortDescription:
      "Understand start, stop, step, negative indexes, and common slicing traps.",
  },
  {
    slug: "off-by-one-mistakes",
    trackSlug: "python-core",
    order: 11,
    title: "Common Off-by-One Mistakes",
    status: "planned",
    difficulty: "beginner",
    estimatedTime: "10–15 min",
    shortDescription:
      "Learn why indexes, ranges, and loop boundaries often go wrong by exactly one step.",
  },
  {
    slug: "none-and-proper-checks",
    trackSlug: "python-core",
    order: 12,
    title: "None and How to Check It Properly",
    status: "planned",
    difficulty: "beginner",
    estimatedTime: "10–15 min",
    shortDescription:
      "Learn what None means and why Python developers usually check it with is None.",
  },
  {
    slug: "scope-basics",
    trackSlug: "python-core",
    order: 13,
    title: "Scope Basics: Local vs Global Variables",
    status: "planned",
    difficulty: "beginner",
    estimatedTime: "15 min",
    shortDescription:
      "Understand where variables live and why some names are visible only inside functions.",
  },
  {
    slug: "naming-conventions-pep8",
    trackSlug: "python-core",
    order: 14,
    title: "Naming Conventions and PEP 8 Basics",
    status: "planned",
    difficulty: "beginner",
    estimatedTime: "10–15 min",
    shortDescription:
      "Learn readable Python naming rules and basic PEP 8 style habits.",
  },

  // Functions preview
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

  // OOP preview
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
];

export function getLessonsByTrackSlug(trackSlug: string) {
  return lessons
    .filter((lesson) => lesson.trackSlug === trackSlug)
    .sort((a, b) => a.order - b.order);
}

export function getLessonBySlug(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug);
}

export function getLessonNavigation(slug: string) {
  const currentLesson = getLessonBySlug(slug);

  if (!currentLesson) {
    return {
      previousLesson: undefined,
      nextLesson: undefined,
    };
  }

  const trackLessons = getLessonsByTrackSlug(currentLesson.trackSlug);

  const navigableLessons = trackLessons.filter(
    (lesson) => lesson.status !== "planned"
  );

  const currentIndex = navigableLessons.findIndex(
    (lesson) => lesson.slug === slug
  );

  return {
    previousLesson:
      currentIndex > 0 ? navigableLessons[currentIndex - 1] : undefined,
    nextLesson:
      currentIndex >= 0 && currentIndex < navigableLessons.length - 1
        ? navigableLessons[currentIndex + 1]
        : undefined,
  };
}

