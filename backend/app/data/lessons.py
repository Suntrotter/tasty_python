lessons = [
    {
        "slug": "variables-and-assignment",
        "track_slug": "python-core",
        "order": 1,
        "title": "Variables and Assignment",
        "status": "published",
        "difficulty": "beginner",
        "estimated_time": "10–15 min",
        "short_description": "Understand what variables are, how assignment works, and what reassignment means.",
    },
    {
        "slug": "mutable-vs-immutable-objects",
        "track_slug": "python-core",
        "order": 2,
        "title": "Mutable vs Immutable Objects",
        "status": "published",
        "difficulty": "beginner",
        "estimated_time": "15–20 min",
        "short_description": "Learn why some Python objects can change and others cannot.",
    },
    {
        "slug": "dynamic-typing-in-python",
        "track_slug": "python-core",
        "order": 3,
        "title": "Dynamic Typing in Python",
        "status": "coming_soon",
        "difficulty": "beginner",
        "estimated_time": "10–15 min",
        "short_description": "Understand why variable names in Python are not locked to one type.",
    },
    {
        "slug": "is-vs-equals",
        "track_slug": "python-core",
        "order": 4,
        "title": "is vs ==",
        "status": "coming_soon",
        "difficulty": "beginner",
        "estimated_time": "15 min",
        "short_description": "Learn the difference between identity comparison and value comparison.",
    },
    {
        "slug": "defining-functions",
        "track_slug": "functions",
        "order": 1,
        "title": "Defining Functions",
        "status": "planned",
        "difficulty": "beginner",
        "estimated_time": "15 min",
        "short_description": "Learn how to create reusable blocks of Python code with def.",
    },
    {
        "slug": "what-is-a-class",
        "track_slug": "oop",
        "order": 1,
        "title": "What Is a Class?",
        "status": "planned",
        "difficulty": "beginner",
        "estimated_time": "15 min",
        "short_description": "Understand classes as blueprints for creating objects.",
    },
]


def get_lesson_by_slug(lesson_slug: str):
    return next((lesson for lesson in lessons if lesson["slug"] == lesson_slug), None)


def get_lessons_by_track_slug(track_slug: str):
    track_lessons = [
        lesson for lesson in lessons if lesson["track_slug"] == track_slug
    ]

    return sorted(track_lessons, key=lambda lesson: lesson["order"])