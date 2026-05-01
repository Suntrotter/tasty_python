import type { InterviewQuestion } from "../types/interview";

export const interviewQuestions: InterviewQuestion[] = [
  {
    id: "variables-1",
    topic: "Python Core",
    question: "What is a variable in Python?",
    shortAnswer:
      "A variable is a name that refers to a value or object.",
    strongAnswer:
      "A variable in Python is a name bound to an object. It does not store the value directly like a physical box. During assignment, Python binds the name on the left to the value on the right.",
    commonMistake:
      "Saying that a variable is a box that contains a value. This metaphor is simple, but it can be misleading in Python.",
    lessonSlug: "variables-and-assignment",
  },
  {
    id: "assignment-1",
    topic: "Python Core",
    question: "What does assignment mean in Python?",
    shortAnswer:
      "Assignment means binding a name to a value.",
    strongAnswer:
      "In Python, assignment uses the = operator. The expression on the right is evaluated first, and then the name on the left is bound to that value.",
    commonMistake:
      "Reading = as mathematical equality instead of assignment.",
    lessonSlug: "variables-and-assignment",
  },
  {
    id: "reassignment-1",
    topic: "Python Core",
    question: "What happens when you reassign a variable?",
    shortAnswer:
      "The name starts referring to a new value.",
    strongAnswer:
      "When a variable is reassigned, the name is rebound to another object. The previous object is not changed by the reassignment itself.",
    commonMistake:
      "Thinking that reassignment changes the old value directly.",
    lessonSlug: "variables-and-assignment",
  },
  {
    id: "mutability-1",
    topic: "Python Core",
    question: "What is the difference between mutable and immutable objects?",
    shortAnswer:
      "Mutable objects can be changed after creation. Immutable objects cannot.",
    strongAnswer:
      "A mutable object can be modified in place, while an immutable object cannot be changed after it is created. For example, lists are mutable, while strings, integers, and tuples are immutable.",
    commonMistake:
      "Confusing reassignment with mutation. Reassignment changes what a name points to; mutation changes the object itself.",
    lessonSlug: "mutable-vs-immutable-objects",
  },
  {
    id: "is-vs-equals-1",
    topic: "Python Core",
    question: "What is the difference between is and ==?",
    shortAnswer:
      "== compares values. is compares identity.",
    strongAnswer:
      "The == operator checks whether two objects have equal values. The is operator checks whether two names point to the exact same object in memory.",
    commonMistake:
      "Using is to compare strings or numbers instead of using ==.",
    lessonSlug: "is-vs-equals",
  },
  {
    id: "functions-1",
    topic: "Functions",
    question: "What is the difference between return and print?",
    shortAnswer:
      "return gives a value back from a function. print only displays something.",
    strongAnswer:
      "return sends a result back to the caller so it can be reused. print writes text to the console but does not make that value available for further computation.",
    commonMistake:
      "Using print inside a function and expecting another part of the program to receive that value.",
  },
];