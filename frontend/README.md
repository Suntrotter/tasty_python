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

### Backend

- FastAPI
- SQLAlchemy
- Alembic
- SQLite for local development
- Pydantic
- Python dotenv

### Planned Backend Improvements

- PostgreSQL / Neon database
- Firebase Authentication
- User progress stored in database
- Admin content management

## Project Structure

tasty_python/
frontend/
src/
api/
apiConfig.ts
healthApi.ts
lessonContentApi.ts
lessonsApi.ts
tracksApi.ts
components/
ApiStatus.tsx
Layout.tsx
LessonCard.tsx
LessonCompletionButton.tsx
LessonNavigation.tsx
LessonSectionRenderer.tsx
TrackCard.tsx
data/
lessonContent/
interviewQuestions.ts
lessons.ts
tracks.ts
features/
progress/
useLessonProgress.ts
pages/
DashboardPage.tsx
HomePage.tsx
InterviewModePage.tsx
LessonPage.tsx
TrackDetailPage.tsx
TracksPage.tsx
styles/
types/
App.tsx
main.tsx

backend/
alembic/
app/
core/
config.py
data/
lesson_content.py
lessons.py
tracks.py
db/
database.py
models/
lesson.py
lesson_content.py
track.py
routers/
lessons.py
tracks.py
schemas/
lesson.py
lesson_content.py
track.py
seed/
seed_database.py
main.py
alembic.ini
requirements.txt

README.md

## How to Run the Project Locally

The project currently has two parts:

```text
frontend/   React + TypeScript + Vite application
backend/    FastAPI backend with SQLite database
```

You need two terminals to run the full project locally.

---

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/tasty_python.git
cd tasty_python
```

Replace `YOUR_USERNAME` with your GitHub username.

---

### 2. Run the backend

Go to the backend folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it.

On Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

On Git Bash:

```bash
source .venv/Scripts/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

On Windows PowerShell, you can use:

```powershell
Copy-Item .env.example .env
```

Apply database migrations:

```bash
alembic upgrade head
```

Seed the database:

```bash
python -m app.seed.seed_database
```

Run the backend:

```bash
uvicorn app.main:app --reload
```

### Backend helper scripts

For Windows PowerShell, the backend includes helper scripts.

From the `backend/` folder:

````powershell
.\scripts\setup-db.ps1

### Backend helper scripts

For Windows PowerShell, the backend includes helper scripts.

From the `backend/` folder:

```powershell
.\scripts\setup-db.ps1

The backend will be available at:

```text
http://127.0.0.1:8000
````

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

Health check:

```text
http://127.0.0.1:8000/health
```

---

### 3. Run the frontend

Open a second terminal from the project root.

Go to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a local `.env.local` file:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Run the frontend:

```bash
npm run dev -- --host 127.0.0.1
```

The frontend will be available at:

```text
http://127.0.0.1:5173
```

---

### 4. Local development flow

Recommended startup order:

```text
1. Start backend
2. Start frontend
3. Open the frontend in the browser
```

The frontend checks the backend health endpoint and shows:

```text
API online
```

If the backend is not running, the frontend falls back to local demo data and shows:

```text
Demo mode
```

This fallback is intentional and helps keep the frontend usable even when the backend is offline.

---

## Backend API

The FastAPI backend currently provides:

```text
GET /health
GET /api/tracks
GET /api/tracks/{track_slug}
GET /api/tracks/{track_slug}/lessons
GET /api/lessons
GET /api/lessons/{lesson_slug}
GET /api/lessons/{lesson_slug}/content
```

The backend uses:

- FastAPI
- SQLAlchemy
- Alembic
- SQLite for local development
- Seed scripts for initial curriculum data

The database currently stores:

- tracks
- lessons
- lesson content
- lesson sections
- lesson items
- lesson tables

---

## Database Commands

Apply migrations:

```bash
alembic upgrade head
```

Create a new migration after changing models:

```bash
alembic revision --autogenerate -m "migration message"
```

Seed or update the local database:

```bash
python -m app.seed.seed_database
```

The seed script is idempotent. It can be run multiple times and will update existing records instead of creating duplicates.

It also removes stale tracks and lessons that no longer exist in the source seed data.
