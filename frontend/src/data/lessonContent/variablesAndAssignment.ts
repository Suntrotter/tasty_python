import type { LessonContent } from "../../types/lesson";

export const variablesAndAssignmentLesson: LessonContent = {
  slug: "variables-and-assignment",
  title: "Variables and Assignment",
  goal: "By the end of this lesson, you should understand what variables are in Python, how assignment works, what reassignment means, and how to explain this clearly in a junior interview.",
  imagePrompts: [
    "A cozy kitchen shelf with jars of jam. Each jar has a paper label: flavor, price, cups. One label is being moved from one jar to another.",
    "Two drink cups. First cup has label drink → latte, then the label is moved to another cup: drink → cappuccino.",
    "A café receipt showing: drink, cups, price per cup, total. Use labels like Python variable names.",
  ],
  sections: [
    {
      id: "tasty-metaphor",
      type: "metaphor",
      title: "Tasty Metaphor",
      paragraphs: [
        "Imagine a kitchen full of jars.",
        "Each jar contains something: strawberry jam, honey, cinnamon, chocolate cream.",
        "A variable is like a label on a jar.",
        "In Python, a variable is not exactly a box. It is more like a name tag attached to an object.",
        "If we write flavor = \"strawberry\" and then flavor = \"chocolate\", the label flavor moves. Now it points to \"chocolate\".",
        "The old strawberry jam is not inside the variable. The label simply no longer points to it.",
      ],
      items: [
        {
          title: "Memory hook",
          content:
            "variable = name; assignment = attaching a name to a value; reassignment = moving the name to another value.",
        },
      ],
    },
    {
      id: "short-theory",
      type: "theory",
      title: "Short Theory",
      paragraphs: [
        "A variable is a name that refers to a value.",
        "The symbol = means assignment.",
        "It does not mean “equals” like in math. It means: take the value on the right and assign it to the name on the left.",
        "Python is not doing algebra here. It is doing label management. A tiny kitchen manager with strong opinions.",
      ],
      code: `tea = "green tea"
cups = 3
price = 4.5
is_hot = True`,
    },
    {
      id: "main-code-example",
      type: "code_example",
      title: "Main Code Example",
      code: `drink = "latte"
price = 5

print(drink)
print(price)

drink = "cappuccino"
price = 6

print(drink)
print(price)`,
      output: `latte
5
cappuccino
6`,
      paragraphs: [
        "First, drink refers to \"latte\" and price refers to 5.",
        "Then both variables are reassigned.",
        "So Python prints the newest values.",
      ],
    },
    {
      id: "interview-spot",
      type: "interview",
      title: "Interview Spot",
      items: [
        {
          title: "Question 1: What is a variable in Python?",
          content:
            "A variable in Python is a name that refers to an object or value. It does not store the value directly like a physical box; it points to an object in memory.",
        },
        {
          title: "Question 2: What does assignment mean?",
          content:
            "Assignment means binding a name to a value. In x = 5, the name x now refers to the integer object 5.",
        },
        {
          title: "Question 3: What happens when you reassign a variable?",
          content:
            "The variable name starts referring to a new value. The old value is not changed by reassignment; the name simply points somewhere else.",
        },
        {
          title: "Question 4: Can one value have several variable names?",
          content: "Yes. Several names can refer to the same object.",
          code: `first_dessert = "cake"
second_dessert = first_dessert

print(first_dessert)
print(second_dessert)`,
          output: `cake
cake`,
        },
      ],
    },
    {
      id: "trap-zone",
      type: "trap_zone",
      title: "Trap Zone",
      items: [
        {
          title: "Trap 1: Reading assignment backwards",
          content:
            "The variable name must be on the left. The value must be on the right.",
          code: `10 = cookies

# Correct:
cookies = 10`,
        },
        {
          title: "Trap 2: Using a variable before assignment",
          content:
            "Python reads code from top to bottom. At the moment of print(smoothie), the name smoothie does not exist yet.",
          code: `print(smoothie)
smoothie = "mango"

# Correct:
smoothie = "mango"
print(smoothie)`,
        },
        {
          title: "Trap 3: Thinking reassignment changes the old value",
          content:
            "favorite got the value \"pie\" before dessert was reassigned. Later, dessert moved to \"cake\", but favorite still refers to \"pie\".",
          code: `dessert = "pie"
favorite = dessert

dessert = "cake"

print(favorite)`,
          output: `pie`,
        },
      ],
    },
    {
      id: "practice",
      type: "practice",
      title: "Practice",
      items: [
        {
          title: "1. Choose the Correct Explanation",
          content:
            "What does tea = \"mint\" mean? A) Python checks if tea and \"mint\" are equal. B) Python assigns the value \"mint\" to the name tea. C) Python creates a function called tea. D) Python prints \"mint\".",
        },
        {
          title: "2. Predict the Output",
          content: "What is printed?",
          code: `flavor = "vanilla"
print(flavor)

flavor = "caramel"
print(flavor)`,
        },
        {
          title: "3. Find the Mistake",
          content: "What is the problem?",
          code: `print(cake)
cake = "chocolate"`,
        },
        {
          title: "4. Choose the Better Variable Name",
          content:
            "Which name is better for storing the number of coffee cups? A) x B) coffee_cups C) thing D) data",
        },
        {
          title: "5. Coding Task",
          content:
            "Create variables for a small café order: drink = \"green tea\", cups = 2, price_per_cup = 3, total_price, then print: Order: green tea, cups: 2, total: 6",
          code: `drink = "green tea"
cups = 2
price_per_cup = 3

# create total_price here

# print the result here`,
        },
      ],
    },
    {
      id: "say-it-like-interview",
      type: "interview",
      title: "Say It Like in an Interview",
      paragraphs: [
        "A variable in Python is a name that refers to a value or object. Assignment binds a name to a value. For example, in x = 10, the name x refers to the integer 10. If we later write x = 20, the name x is reassigned and now refers to 20.",
      ],
    },
    {
      id: "final-cheat-sheet",
      type: "cheat_sheet",
      title: "Final Cheat Sheet",
      table: {
        headers: ["Concept", "Meaning"],
        rows: [
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
    {
      id: "answer-key",
      type: "answer_key",
      title: "Answer Key",
      items: [
        {
          title: "Choose the Correct Explanation",
          content: "B",
        },
        {
          title: "Predict the Output",
          content: "vanilla, caramel",
        },
        {
          title: "Find the Mistake",
          content: "cake is used before assignment.",
        },
        {
          title: "Choose the Better Variable Name",
          content: "coffee_cups",
        },
        {
          title: "Coding Task — Possible Solution",
          content: "One possible solution:",
          code: `drink = "green tea"
cups = 2
price_per_cup = 3

total_price = cups * price_per_cup

print(f"Order: {drink}, cups: {cups}, total: {total_price}")`,
          output: `Order: green tea, cups: 2, total: 6`,
        },
      ],
    },
  ],
};