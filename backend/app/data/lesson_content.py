lesson_contents = [
    {
        "slug": "variables-and-assignment",
        "title": "Variables and Assignment",
        "goal": "By the end of this lesson, you should understand what variables are in Python, how assignment works, what reassignment means, and how to explain this clearly in a junior interview.",
        "image_prompts": [
            "A cozy kitchen shelf with jars of jam. Each jar has a paper label: flavor, price, cups. One label is being moved from one jar to another.",
            "Two drink cups. First cup has label drink → latte, then the label is moved to another cup: drink → cappuccino.",
            "A café receipt showing: drink, cups, price per cup, total. Use labels like Python variable names.",
        ],
        "sections": [
            {
                "id": "tasty-metaphor",
                "type": "metaphor",
                "title": "Tasty Metaphor",
                "paragraphs": [
                    "Imagine a kitchen full of jars.",
                    "A variable is like a label on a jar.",
                    "In Python, a variable is not exactly a box. It is more like a name tag attached to an object.",
                    "If we write flavor = \"strawberry\" and then flavor = \"chocolate\", the label flavor moves.",
                ],
                "items": [
                    {
                        "title": "Memory hook",
                        "content": "variable = name; assignment = attaching a name to a value; reassignment = moving the name to another value.",
                    }
                ],
            },
            {
                "id": "short-theory",
                "type": "theory",
                "title": "Short Theory",
                "paragraphs": [
                    "A variable is a name that refers to a value.",
                    "The symbol = means assignment.",
                    "It takes the value on the right and assigns it to the name on the left.",
                ],
                "code": 'tea = "green tea"\ncups = 3\nprice = 4.5\nis_hot = True',
            },
            {
                "id": "main-code-example",
                "type": "code_example",
                "title": "Main Code Example",
                "code": 'drink = "latte"\nprice = 5\n\nprint(drink)\nprint(price)\n\ndrink = "cappuccino"\nprice = 6\n\nprint(drink)\nprint(price)',
                "output": "latte\n5\ncappuccino\n6",
                "paragraphs": [
                    "First, drink refers to \"latte\" and price refers to 5.",
                    "Then both variables are reassigned.",
                    "So Python prints the newest values.",
                ],
            },
            {
                "id": "interview-spot",
                "type": "interview",
                "title": "Interview Spot",
                "items": [
                    {
                        "title": "What is a variable in Python?",
                        "content": "A variable in Python is a name that refers to an object or value.",
                    },
                    {
                        "title": "What does assignment mean?",
                        "content": "Assignment means binding a name to a value.",
                    },
                ],
            },
            {
                "id": "final-cheat-sheet",
                "type": "cheat_sheet",
                "title": "Final Cheat Sheet",
                "table": {
                    "headers": ["Concept", "Meaning"],
                    "rows": [
                        ["Variable", "A name that refers to a value"],
                        ["Assignment", "Binding a name to a value"],
                        ["Reassignment", "Making the name refer to a new value"],
                        ["=", "Assignment operator"],
                    ],
                },
            },
        ],
    },
    {
        "slug": "mutable-vs-immutable-objects",
        "title": "Mutable vs Immutable Objects",
        "goal": "By the end of this lesson, you should understand the difference between mutable and immutable objects in Python, recognize common examples, and explain why this topic matters in junior interviews.",
        "image_prompts": [
            "A kitchen table with a reusable recipe notebook and a sealed printed recipe card.",
            "Two baskets: one with fruits that can be rearranged, labeled list, and one sealed jar labeled tuple.",
        ],
        "sections": [
            {
                "id": "tasty-metaphor",
                "type": "metaphor",
                "title": "Tasty Metaphor",
                "paragraphs": [
                    "Imagine two types of kitchen recipes.",
                    "The first recipe is written in a notebook. You can edit it. This is like a mutable object.",
                    "The second recipe is printed on a sealed card. You cannot change the card itself. This is like an immutable object.",
                ],
                "items": [
                    {
                        "title": "Memory hook",
                        "content": "Mutable = can be changed in place. Immutable = cannot be changed in place.",
                    }
                ],
            },
            {
                "id": "short-theory",
                "type": "theory",
                "title": "Short Theory",
                "paragraphs": [
                    "An object is mutable if it can be changed after it is created.",
                    "An object is immutable if it cannot be changed after it is created.",
                    "Lists, dictionaries, and sets are mutable. Integers, strings, booleans, floats, and tuples are immutable.",
                ],
            },
            {
                "id": "main-code-example",
                "type": "code_example",
                "title": "Main Code Example",
                "code": 'fruits = ["apple", "banana"]\nbasket = fruits\n\nbasket.append("cherry")\n\nprint(fruits)\nprint(basket)',
                "output": "['apple', 'banana', 'cherry']\n['apple', 'banana', 'cherry']",
                "paragraphs": [
                    "Both fruits and basket refer to the same list object.",
                    "The list is mutable, so append() changes the object in place.",
                ],
            },
            {
                "id": "interview-spot",
                "type": "interview",
                "title": "Interview Spot",
                "items": [
                    {
                        "title": "What is a mutable object?",
                        "content": "A mutable object is an object that can be changed after it is created.",
                    },
                    {
                        "title": "What is an immutable object?",
                        "content": "An immutable object cannot be changed after it is created.",
                    },
                    {
                        "title": "Is reassignment the same as mutation?",
                        "content": "No. Reassignment makes a name refer to another object. Mutation changes the existing object in place.",
                    },
                ],
            },
        ],
    },
]


def get_lesson_content_by_slug(lesson_slug: str):
    return next(
        (
            lesson_content
            for lesson_content in lesson_contents
            if lesson_content["slug"] == lesson_slug
        ),
        None,
    )