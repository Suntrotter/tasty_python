# Tasty Python

**Tasty Python** is an educational platform for junior Python learners preparing for technical interviews.

The project combines short Python lessons, cozy visual metaphors, interactive practice, a browser-based Python code runner, interview-style questions, progress tracking, and an admin panel for curriculum management.

The main idea is to make Python concepts easier to understand, remember, practice, and explain during junior developer interviews.

---

## Live Demo

Frontend:

```text
https://tasty-python.vercel.app
```

Backend API documentation:

```text
https://tasty-python.onrender.com/docs
```

---

## Project Status

This project is currently in active development.

The current version includes a complete learner flow:

```text
Home → Tracks → Track Detail → Lesson → Practice → Interview Mode → Progress
```

The first lesson, **Variables and Assignment**, is fully published and includes:

- visual learning metaphors;
- theory blocks;
- Monaco-powered code examples;
- separate output blocks;
- interview questions with hidden answers;
- trap-zone examples;
- multiple-choice practice with instant checking;
- a Pyodide-powered Python code runner;
- a final cheat sheet;
- learner progress tracking.

Other lessons and tracks are visible as part of the planned curriculum and will be expanded through the admin panel.

---

## Main Features

### Learner Features

- Track-based Python learning roadmap
- Responsive learner-facing interface
- Lesson cards with status and progress states
- Reusable lesson page layout
- Visual metaphors for difficult concepts
- Monaco-based code display
- Pyodide-powered browser Python runner
- Multiple-choice practice with instant feedback
- Coding tasks with expected-output checking
- Interview Mode with revealable answers
- “I knew this” / “Review later” interview self-checks
- Progress page with:
  - completed lessons;
  - practice accuracy;
  - topics to review;
  - interview questions to revisit.

### Admin Features

- Protected admin login
- Admin session bar with logout
- Admin routes hidden from public navigation
- Backend admin API protected by an admin token
- Track metadata editing
- Lesson metadata editing
- Lesson content basics editing
- Section creation, editing, and deletion
- Lesson item creation, editing, and deletion
- Section table editing

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
- `is` vs `==`

Planned:

- Truthy and Falsy Values
- Basic Input / Output
- Type Conversion
- String Methods
- String Formatting
- Slicing Strings and Lists
- Common Off-by-One Mistakes
- `None` and How to Check It Properly
- Scope Basics
- Naming Conventions and PEP 8 Basics

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Monaco Editor
- Pyodide
- CSS
- LocalStorage for learner-side progress data

### Backend

- FastAPI
- SQLAlchemy
- Alembic
- Pydantic
- Python dotenv
- SQLite for local development
- PostgreSQL on Render for production

### Deployment

- Frontend: Vercel
- Backend: Render Web Service
- Database: Render PostgreSQL

---

## Project Structure

```text
tasty_python/
├── frontend/
│   ├── public/
│   │   ├── Logo.png
│   │   └── lesson-images/
│   ├── src/
│   │   ├── api/
│   │   │   ├── adminApi.ts
│   │   │   ├── apiConfig.ts
│   │   │   ├── healthApi.ts
│   │   │   ├── lessonContentApi.ts
│   │   │   ├── lessonsApi.ts
│   │   │   └── tracksApi.ts
│   │   ├── components/
│   │   │   ├── CodeBlock.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── LessonCard.tsx
│   │   │   ├── LessonCompletionButton.tsx
│   │   │   ├── LessonNavigation.tsx
│   │   │   ├── LessonSectionRenderer.tsx
│   │   │   ├── PythonCodeRunner.tsx
│   │   │   ├── RequireAdminAuth.tsx
│   │   │   └── TrackCard.tsx
│   │   ├── data/
│   │   ├── features/
│   │   │   ├── admin/
│   │   │   ├── interview/
│   │   │   ├── practice/
│   │   │   └── progress/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── HomePage.tsx
│   │   │   ├── InterviewModePage.tsx
│   │   │   ├── LessonPage.tsx
│   │   │   ├── NotFoundPage.tsx
│   │   │   ├── TrackDetailPage.tsx
│   │   │   └── TracksPage.tsx
│   │   ├── styles/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── vercel.json
│   └── package.json
│
├── backend/
│   ├── alembic/
│   ├── app/
│   │   ├── core/
│   │   │   ├── admin_auth.py
│   │   │   └── config.py
│   │   ├── data/
│   │   │   ├── lesson_content.py
│   │   │   ├── lessons.py
│   │   │   └── tracks.py
│   │   ├── db/
│   │   │   └── database.py
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── seed/
│   │   │   └── seed_database.py
│   │   └── main.py
│   ├── alembic.ini
│   └── requirements.txt
│
├── vercel.json
└── README.md
```

---

## Environment Variables

### Frontend `.env.local`

Create this file in `frontend/`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_ADMIN_PASSWORD=your-admin-token
```

For Vercel production:

```env
VITE_API_BASE_URL=https://tasty-python.onrender.com
VITE_ADMIN_PASSWORD=your-admin-token
```

> Note: `VITE_` variables are included in the frontend build. For this MVP, the admin token is used as a simple demo-level protection mechanism. Do not use a personal password or sensitive secret here.

### Backend `.env`

Create this file in `backend/`:

```env
DATABASE_URL=sqlite:///./tasty_python.db
ADMIN_API_TOKEN=your-admin-token
FRONTEND_URLS=http://localhost:5173,http://127.0.0.1:5173
```

For Render production:

```env
DATABASE_URL=your-render-postgres-internal-database-url
ADMIN_API_TOKEN=your-admin-token
FRONTEND_URLS=https://tasty-python.vercel.app,http://localhost:5173,http://127.0.0.1:5173
```

The value of `ADMIN_API_TOKEN` in the backend must match `VITE_ADMIN_PASSWORD` in the frontend.

---

## How to Run the Project Locally

The project has two parts:

```text
frontend/   React + TypeScript + Vite application
backend/    FastAPI backend
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

Create a local `.env` file from the example if available:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Apply database migrations:

```bash
alembic upgrade head
```

Seed the local database:

```bash
python -m app.seed.seed_database
```

Run the backend:

```bash
uvicorn app.main:app --reload
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

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

## Build Check

Before deploying frontend changes, run:

```bash
npm run build
```

This checks TypeScript and creates a production build.

---

## Backend API

The FastAPI backend provides public learner endpoints:

```text
GET /health
GET /api/tracks
GET /api/tracks/{track_slug}
GET /api/tracks/{track_slug}/lessons
GET /api/lessons
GET /api/lessons/{lesson_slug}
GET /api/lessons/{lesson_slug}/content
```

Admin endpoints are available under:

```text
/api/admin/...
```

Admin API routes require the `X-Admin-Token` header.

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

The seed script is idempotent for tracks and lessons. It updates existing records instead of creating duplicates.

Important: the seed script recreates lesson content from `backend/app/data/lesson_content.py`. Do not run it in production if you want to preserve lesson edits made through the admin panel.

---

## Deployment Notes

### Render Backend

Recommended Render settings:

```text
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: python -m alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

For first-time database setup, run the seed script once by temporarily using:

```text
python -m alembic upgrade head && python -m app.seed.seed_database && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

After the database has been seeded, change the start command back to the normal command without seeding.

### Vercel Frontend

The project includes `vercel.json` rewrite rules for React Router deep links:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

This prevents Vercel from returning `404` when refreshing routes such as:

```text
/lessons/variables-and-assignment
/tracks/python-core
/dashboard
/interview-mode
```

---

## Current Limitations

- User accounts are not implemented yet.
- Learner progress is currently stored in browser `localStorage`.
- Admin authentication is MVP-level and token-based.
- Lesson images are currently stored in the frontend `public/lesson-images` folder and mapped in code.
- The curriculum structure is much larger than the currently published content.

---

## Future Improvements

- Full user authentication
- Backend-stored learner progress
- Admin-controlled lesson images
- More complete lesson authoring tools
- More published lessons
- Better review scheduling
- Spaced repetition for interview questions
- More advanced code runner tasks
- Test coverage for backend and frontend

---

## Portfolio Note

Tasty Python is designed as a portfolio project demonstrating:

- full-stack architecture;
- frontend routing and state management;
- FastAPI backend design;
- relational data modeling;
- database migrations;
- deployment with Vercel, Render, and PostgreSQL;
- interactive educational UI;
- admin content management;
- learner progress tracking.
