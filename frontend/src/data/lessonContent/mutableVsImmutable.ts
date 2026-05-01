import type { LessonContent } from "../../types/lesson";

export const mutableVsImmutableLesson: LessonContent = {
  slug: "mutable-vs-immutable-objects",
  title: "Mutable vs Immutable Objects",
  goal: "By the end of this lesson, you should understand the difference between mutable and immutable objects in Python, recognize common examples, and explain why this topic matters in junior interviews.",
  imagePrompts: [
    "A kitchen table with a reusable recipe notebook and a sealed printed recipe card. The notebook can be edited, but the printed card cannot.",
    "Two baskets: one with fruits that can be rearranged, labeled list, and one sealed jar labeled tuple.",
    "A Python learner looking at a list changing in place while a string creates a new value.",
  ],
  sections: [
    {
      id: "tasty-metaphor",
      type: "metaphor",
      title: "Tasty Metaphor",
      paragraphs: [
        "Imagine two types of kitchen recipes.",
        "The first recipe is written in a notebook. You can cross out ingredients, add more sugar, remove cinnamon, or change the order of steps. This is like a mutable object.",
        "The second recipe is printed on a sealed card. You cannot change the card itself. If you want another version, you need to print a new card. This is like an immutable object.",
        "In Python, some objects can be changed in place. Others cannot be changed after creation.",
      ],
      items: [
        {
          title: "Memory hook",
          content:
            "Mutable = can be changed in place. Immutable = cannot be changed in place; Python creates or uses another object instead.",
        },
      ],
    },
    {
      id: "short-theory",
      type: "theory",
      title: "Short Theory",
      paragraphs: [
        "An object is mutable if it can be changed after it is created.",
        "An object is immutable if it cannot be changed after it is created.",
        "This matters because variables in Python are names that refer to objects. When you change a mutable object, all names pointing to that object can see the change.",
        "When you work with immutable objects, operations usually create a new object instead of changing the old one.",
      ],
      items: [
        {
          title: "Common mutable objects",
          content: "list, dict, set",
        },
        {
          title: "Common immutable objects",
          content: "int, float, bool, str, tuple",
        },
      ],
    },
    {
      id: "main-code-example",
      type: "code_example",
      title: "Main Code Example",
      code: `fruits = ["apple", "banana"]
basket = fruits

basket.append("cherry")

print(fruits)
print(basket)`,
      output: `['apple', 'banana', 'cherry']
['apple', 'banana', 'cherry']`,
      paragraphs: [
        "Both fruits and basket refer to the same list object.",
        "The list is mutable, so append() changes the object in place.",
        "Because both names point to the same object, both names show the updated list.",
      ],
    },
    {
      id: "immutable-example",
      type: "code_example",
      title: "Immutable Object Example",
      code: `dessert = "cake"
favorite = dessert

dessert = dessert.upper()

print(dessert)
print(favorite)`,
      output: `CAKE
cake`,
      paragraphs: [
        "Strings are immutable.",
        "The upper() method does not change the original string.",
        "Instead, it returns a new string. The name dessert is reassigned to that new string, while favorite still refers to the old string.",
      ],
    },
    {
      id: "interview-spot",
      type: "interview",
      title: "Interview Spot",
      items: [
        {
          title: "Question 1: What is a mutable object?",
          content:
            "A mutable object is an object that can be changed after it is created. Lists, dictionaries, and sets are common mutable objects in Python.",
        },
        {
          title: "Question 2: What is an immutable object?",
          content:
            "An immutable object cannot be changed after it is created. Examples include integers, floats, booleans, strings, and tuples.",
        },
        {
          title: "Question 3: Why does mutability matter?",
          content:
            "Mutability matters because several variable names can refer to the same object. If the object is mutable and one name changes it in place, the change is visible through the other names too.",
        },
        {
          title: "Question 4: Is reassignment the same as mutation?",
          content:
            "No. Reassignment makes a name refer to another object. Mutation changes the existing object in place.",
        },
      ],
    },
    {
      id: "trap-zone",
      type: "trap_zone",
      title: "Trap Zone",
      items: [
        {
          title: "Trap 1: Thinking that two names always mean two objects",
          content:
            "Two variable names can point to the same object. If that object is mutable, changes through one name can be seen through the other.",
          code: `a = [1, 2]
b = a

b.append(3)

print(a)`,
          output: `[1, 2, 3]`,
        },
        {
          title: "Trap 2: Confusing reassignment with mutation",
          content:
            "Reassignment does not change the old object. It only moves the name to another object.",
          code: `a = [1, 2]
b = a

b = [3, 4]

print(a)
print(b)`,
          output: `[1, 2]
[3, 4]`,
        },
        {
          title: "Trap 3: Thinking string methods change strings in place",
          content:
            "String methods return new strings. They do not modify the original string.",
          code: `name = "python"
name.upper()

print(name)`,
          output: `python`,
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
            "Which object is mutable? A) int B) str C) list D) tuple",
        },
        {
          title: "2. Predict the Output",
          content: "What is printed?",
          code: `numbers = [1, 2]
copy_numbers = numbers

numbers.append(3)

print(copy_numbers)`,
        },
        {
          title: "3. Find the Mistake",
          content:
            "A learner says: 'Strings are mutable because we can write text = text.upper().' What is wrong with this explanation?",
        },
        {
          title: "4. Choose Mutation or Reassignment",
          content: "Is this mutation or reassignment?",
          code: `items = ["tea", "coffee"]
items.append("juice")`,
        },
        {
          title: "5. Coding Task",
          content:
            "Create a list called order_items with two values: 'tea' and 'cake'. Create another variable called receipt_items that refers to the same list. Add 'cookie' through receipt_items and print order_items.",
        },
      ],
    },
    {
      id: "say-it-like-interview",
      type: "interview",
      title: "Say It Like in an Interview",
      paragraphs: [
        "Mutable objects can be changed after creation, while immutable objects cannot. Lists, dictionaries, and sets are mutable. Strings, integers, floats, booleans, and tuples are immutable. This matters because multiple names can refer to the same mutable object, so changing it in place through one name can affect what we see through another name.",
      ],
    },
    {
      id: "final-cheat-sheet",
      type: "cheat_sheet",
      title: "Final Cheat Sheet",
      table: {
        headers: ["Concept", "Meaning"],
        rows: [
          ["Mutable object", "Can be changed in place"],
          ["Immutable object", "Cannot be changed in place"],
          ["Common mutable types", "list, dict, set"],
          ["Common immutable types", "int, float, bool, str, tuple"],
          ["Mutation", "Changing an existing object"],
          ["Reassignment", "Making a name refer to another object"],
          ["Key interview trap", "Several names may refer to the same mutable object"],
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
          content: "C — list",
        },
        {
          title: "Predict the Output",
          content: "[1, 2, 3]",
        },
        {
          title: "Find the Mistake",
          content:
            "text.upper() does not change the original string. It returns a new string, and then the name can be reassigned to that new string.",
        },
        {
          title: "Mutation or Reassignment",
          content: "Mutation. append() changes the existing list in place.",
        },
        {
          title: "Coding Task — Possible Solution",
          content: "One possible solution:",
          code: `order_items = ["tea", "cake"]
receipt_items = order_items

receipt_items.append("cookie")

print(order_items)`,
          output: `['tea', 'cake', 'cookie']`,
        },
      ],
    },
  ],
};