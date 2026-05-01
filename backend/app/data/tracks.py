tracks = [
    {
        "slug": "python-core",
        "title": "Python Core",
        "description": "The basics juniors often underestimate: variables, typing, truthiness, slicing, and naming.",
        "status": "in_progress",
        "lesson_count": 14,
    },
    {
        "slug": "control-flow",
        "title": "Conditions, Loops, and Control Flow",
        "description": "Learn how to control program logic with conditions, loops, range, enumerate, zip, and loop patterns.",
        "status": "planned",
        "lesson_count": 11,
    },
    {
        "slug": "data-structures",
        "title": "Data Structures",
        "description": "Lists, tuples, dictionaries, sets, sorting, copying, and classic interview traps.",
        "status": "planned",
        "lesson_count": 13,
    },
    {
        "slug": "functions",
        "title": "Functions",
        "description": "Parameters, arguments, return values, default arguments, *args, **kwargs, lambdas, and recursion.",
        "status": "planned",
        "lesson_count": 14,
    },
    {
        "slug": "oop",
        "title": "OOP Basics",
        "description": "Classes, objects, self, attributes, methods, dataclasses, inheritance, composition, and polymorphism.",
        "status": "planned",
        "lesson_count": 26,
    },
]


def get_track_by_slug(track_slug: str):
    return next((track for track in tracks if track["slug"] == track_slug), None)