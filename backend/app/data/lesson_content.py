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
                    "Each jar contains something: strawberry jam, honey, cinnamon, chocolate cream.",
                    "A variable is like a label on a jar.",
                    "This means: put the label flavor on the value \"strawberry\".",
                    "In Python, a variable is not exactly a box. It is more like a name tag attached to an object.",
                    "If we write flavor = \"strawberry\" and then flavor = \"chocolate\", the label flavor moves.",
                    "Now it points to \"chocolate\".",
                    "The old strawberry jam is not inside the variable. The label simply no longer points to it.",
                ],
                "items": [
                    {
                        "title": "Memory hook",
                        "content": "variable = name\nassignment = attaching a name to a value\nreassignment = moving the name to another value",
                    }
                ],
            },
            {
                "id": "short-theory",
                "type": "theory",
                "title": "Short Theory",
                "paragraphs": [
                    "A variable is a name that refers to a value.",
                    "Here, tea refers to a string, cups refers to an integer, price refers to a float, and is_hot refers to a boolean.",
                    "The symbol = means assignment.",
                    "It does not mean “equals” like in math. It means: take the value on the right and assign it to the name on the left.",
                    "Read dessert = \"cake\" as: dessert now refers to \"cake\".",
                    "Not: dessert is mathematically equal to cake.",
                    "Python is not doing algebra here. It is doing label management. A tiny kitchen manager with strong opinions.",
                ],
                "code": """tea = "green tea"
cups = 3
price = 4.5
is_hot = True

dessert = "cake" """,
            },
            {
                "id": "main-code-example",
                "type": "code_example",
                "title": "Main Code Example",
                "code": """drink = "latte"
price = 5

print(drink)
print(price)

drink = "cappuccino"
price = 6

print(drink)
print(price)""",
                "output": """latte
5
cappuccino
6""",
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
                "paragraphs": [
                    "These are the kinds of questions a junior developer may hear in an interview.",
                    "Try to answer clearly and simply. The goal is not to sound fancy. The goal is to show that you understand what Python is actually doing.",
                ],
                "items": [
                    {
                        "title": "Question 1: What is a variable in Python?",
                        "content": "A variable in Python is a name that refers to an object or value. It does not store the value directly like a physical box; it points to an object in memory.",
                    },
                    {
                        "title": "Question 2: What does assignment mean?",
                        "content": "Assignment means binding a name to a value. In x = 5, the name x now refers to the integer object 5.",
                    },
                    {
                        "title": "Question 3: What happens when you reassign a variable?",
                        "content": "The variable name starts referring to a new value. The old value is not changed by reassignment; the name simply points somewhere else.",
                    },
                    {
                        "title": "Question 4: Can one value have several variable names?",
                        "content": "Yes. Several names can refer to the same object.",
                        "code": """first_dessert = "cake"
second_dessert = first_dessert

print(first_dessert)
print(second_dessert)""",
                        "output": """cake
cake""",
                    },
                ],
            },
            {
                "id": "trap-zone",
                "type": "trap_zone",
                "title": "Trap Zone",
                "paragraphs": [
                    "These are common beginner mistakes.",
                    "They look small, but they show whether you really understand assignment. So yes, tiny traps, big consequences. Python is polite, but it will still throw an error.",
                ],
                "items": [
                    {
                        "title": "Trap 1: Reading assignment backwards",
                        "content": "The variable name must be on the left. The value must be on the right.",
                        "code": """10 = cookies""",
                        "output": "SyntaxError",
                    },
                    {
                        "title": "Correct version",
                        "content": "This is the correct order: the name cookies receives the value 10.",
                        "code": """cookies = 10""",
                    },
                    {
                        "title": "Trap 2: Using a variable before assignment",
                        "content": "Python reads code from top to bottom. At the moment of print(smoothie), the name smoothie does not exist yet.",
                        "code": """print(smoothie)
smoothie = "mango" """,
                        "output": "NameError: name 'smoothie' is not defined",
                    },
                    {
                        "title": "Correct version",
                        "content": "Create the variable first, then use it.",
                        "code": """smoothie = "mango"
print(smoothie)""",
                        "output": "mango",
                    },
                    {
                        "title": "Trap 3: Thinking reassignment changes the old value",
                        "content": "favorite got the value \"pie\" before dessert was reassigned. Later, dessert moved to \"cake\", but favorite still refers to \"pie\".",
                        "code": """dessert = "pie"
favorite = dessert

dessert = "cake"

print(favorite)""",
                        "output": "pie",
                    },
                ],
            },
            {
                "id": "practice",
                "type": "practice",
                "title": "Practice",
                "paragraphs": [
                    "Now check whether the idea really landed.",
                    "Try to answer first. No peeking. The Python snake sees everything.",
                ],
                "items": [
                    {
                        "title": "1. Choose the Correct Explanation",
                        "content": """What does this code mean?

A) Python checks if tea and "mint" are equal
B) Python assigns the value "mint" to the name tea
C) Python creates a function called tea
D) Python prints "mint" """,
                        "code": """tea = "mint" """,
                        "output": "B",
                    },
                    {
                        "title": "2. Reassignment",
                        "content": """What happens here?

A) snack contains both values
B) snack now refers to "muffin"
C) Python gives an error
D) "cookie" becomes "muffin" """,
                        "code": """snack = "cookie"
snack = "muffin" """,
                        "output": "B",
                    },
                    {
                        "title": "3. Predict the Output",
                        "content": """What is printed?

A) vanilla, then caramel
B) caramel, then caramel
C) vanilla, then vanilla
D) Error""",
                        "code": """flavor = "vanilla"
print(flavor)

flavor = "caramel"
print(flavor)""",
                        "output": "A",
                    },
                    {
                        "title": "4. Copying a Value",
                        "content": """What is printed?

A) 2
B) 5
C) cups
D) Error""",
                        "code": """cups = 2
extra_cups = cups

cups = 5

print(extra_cups)""",
                        "output": "A",
                    },
                    {
                        "title": "5. Updating a Variable",
                        "content": """What is printed?

A) 10
B) 3
C) 13
D) Error""",
                        "code": """price = 10
price = price + 3

print(price)""",
                        "output": "C",
                    },
                    {
                        "title": "6. Find the Mistake",
                        "content": """What is the problem?

A) cake is used before assignment
B) Strings cannot be printed
C) Variable names cannot contain the letter c
D) The code is correct""",
                        "code": """print(cake)
cake = "chocolate" """,
                        "output": "A",
                    },
                    {
                        "title": "7. Assignment Direction",
                        "content": """What is the problem?

A) Numbers cannot exist in Python
B) The assignment is backwards
C) apples must be uppercase
D) There is no problem""",
                        "code": """5 = apples""",
                        "output": "B",
                    },
                    {
                        "title": "8. Better Variable Name",
                        "content": """Which name is better for storing the number of coffee cups?

A) x
B) coffee_cups
C) thing
D) data""",
                        "output": "B",
                    },
                    {
                        "title": "9. Boolean Variable Name",
                        "content": """Which name is better for storing whether a user is active?

A) active_user_status_now_yes
B) is_active
C) a
D) something""",
                        "output": "B",
                    },
                    {
                        "title": "10. Coding Task",
                        "content": "Create variables for a small café order. Create drink with the value \"green tea\", cups with the value 2, price_per_cup with the value 3, create total_price, and print: Order: green tea, cups: 2, total: 6",
                        "code": """drink = "green tea"
cups = 2
price_per_cup = 3

# create total_price here

# print the result here""",
                        "output": "Order: green tea, cups: 2, total: 6",
                    },
                ],
            },
            {
                "id": "say-it-like-interview",
                "type": "interview",
                "title": "Say It Like in an Interview",
                "paragraphs": [
                    "Try to explain this aloud before revealing the answer.",
                ],
                "items": [
                    {
                        "title": "What is a variable in Python, and what happens during assignment?",
                        "content": "A variable in Python is a name that refers to a value or object. Assignment binds a name to a value. For example, in x = 10, the name x refers to the integer 10. If we later write x = 20, the name x is reassigned and now refers to 20.",
                    }
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
                        ["Left side of =", "Variable name"],
                        ["Right side of =", "Value or expression"],
                        ["Good variable name", "Clear and descriptive"],
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
                "code": """fruits = ["apple", "banana"]
basket = fruits

basket.append("cherry")

print(fruits)
print(basket)""",
                "output": """['apple', 'banana', 'cherry']
['apple', 'banana', 'cherry']""",
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