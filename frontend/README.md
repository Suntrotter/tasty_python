# Tasty Python

**Tasty Python** is an educational platform for junior Python learners preparing for technical interviews.

The project is built around short lessons, friendly metaphors, coding drills, common mistake zones, interview-style questions, and progress-oriented learning tracks.

The main idea is to make Python concepts easier to understand, remember, and explain during junior developer interviews.

---

## Project Status

This project is currently in active development.

The first version focuses on building a scalable frontend structure:

- learning roadmap
- track pages
- lesson cards
- lesson statuses
- reusable lesson page
- structured lesson content
- previous / next lesson navigation

Only the first lesson is fully published at the moment. Other lessons are visible in the roadmap as planned, in progress, or coming soon.

This is intentional: the app is designed as a growing curriculum.

---

## Main Features

- Full Python learning roadmap
- Track-based curriculum structure
- Lesson status system:
  - Published
  - In progress
  - Coming soon
  - Planned
  - Premium
- Reusable lesson page layout
- Structured lesson content stored as data
- Lesson sections:
  - Tasty metaphor
  - Short theory
  - Code example
  - Interview spot
  - Trap zone
  - Practice tasks
  - Cheat sheet
  - Answer key
- Previous / next lesson navigation
- Responsive layout
- Portfolio-friendly architecture

---

## Current Learning Tracks

The roadmap is designed to include the following tracks:

1. Python Core
2. Conditions, Loops, and Control Flow
3. Data Structures
4. Functions
5. Comprehensions and Pythonic Code
6. OOP Basics
7. Decorators, Closures, and Advanced Functions
8. Iterators and Generators
9. Exceptions and Error Handling
10. Files, Context Managers, and Data
11. Modules, Packages, and Project Structure
12. Testing
13. Algorithms and Coding Interview Tasks
14. Backend / Web Basics
15. Databases
16. Async, Concurrency, and Performance
17. Git, Terminal, and Developer Workflow
18. Clean Code and Practical Thinking

---

## Published Content

### Python Core

Currently published:

- Variables and Assignment

In progress / coming soon:

- Mutable vs Immutable Objects
- Dynamic Typing in Python
- is vs ==

Planned:

- Truthy and Falsy Values
- Basic Input / Output
- Type Conversion
- String Methods
- String Formatting
- Slicing Strings and Lists
- Common Off-by-One Mistakes
- None and How to Check It Properly
- Scope Basics
- Naming Conventions and PEP 8 Basics

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- CSS

### Planned Backend

The backend is planned for the next development stage.

Possible stack:

- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- Firebase Authentication

---

## Project Structure

```text
tasty_python/
  frontend/
    src/
      components/
        Layout.tsx
        LessonCard.tsx
        LessonNavigation.tsx
        LessonSectionRenderer.tsx
        TrackCard.tsx
      data/
        lessonContent/
        lessons.ts
        tracks.ts
      pages/
        HomePage.tsx
        LessonPage.tsx
        TrackDetailPage.tsx
        TracksPage.tsx
      types/
        curriculum.ts
        lesson.ts
      App.tsx
      main.tsx
      index.css
  README.md



```
