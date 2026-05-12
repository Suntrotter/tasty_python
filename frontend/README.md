# Tasty Python

**Tasty Python** is a full-stack educational platform for junior Python learners preparing for technical interviews.

The app combines short Python lessons, cozy visual metaphors, interactive practice, a browser-based Python code runner, interview-style questions, account-based progress tracking, and an admin panel for curriculum management.

The goal is to help learners understand Python concepts, remember them through clear metaphors, practice actively, and explain ideas confidently during junior developer interviews.

## Live Demo

Frontend:

```text
https://tasty-python.vercel.app
```

Backend API documentation:

```text
https://tasty-python.onrender.com/docs
```

## Current Status

The project is in active development, but the production MVP is already working end-to-end.

Current production flow:

```text
Home → Sign in / Create account → Tracks → Track Detail → Lesson → Practice → Progress
```

Implemented production features include:

- Firebase Authentication with email/password and Google sign-in
- Backend user profiles linked to Firebase users
- Account-based lesson progress stored in PostgreSQL
- Full lesson content served from the production backend database
- Responsive learner-facing pages
- Protected admin area for curriculum management
- Deployed frontend, backend, and production database

Currently published lessons:

- Variables and Assignment
- Mutable vs Immutable Objects

Additional lessons and tracks are planned and can be expanded through the admin panel.

## Main Features

### Learner Features

- Firebase email/password registration and login
- Google sign-in
- Track-based Python learning roadmap
- Responsive learner-facing interface
- Lesson cards with status and progress states
- Visual metaphors for difficult concepts
- Monaco-based code display
- Pyodide-powered browser Python runner
- Multiple-choice practice with instant feedback
- Coding tasks with expected-output checking
- Interview Mode with revealable answers
- Lesson completion flow
- Account-based progress page
- LocalStorage fallback for guest progress

### Admin Features

- Protected admin login
- Admin session bar with logout
- Admin routes hidden from public navigation
- Backend admin API protected by an admin token
- Track metadata editing
- Lesson metadata editing
- Lesson status editing
- Lesson content basics editing
- Section creation, editing, and deletion
- Lesson item creation, editing, and deletion
- Section table editing
- Flexible lesson content structure for richer lesson blocks

## Learning Roadmap

The curriculum is designed around 18 tracks:

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

## Published Content

### Python Core

Currently published:

- Variables and Assignment
- Mutable vs Immutable Objects

Coming soon:

- Dynamic Typing in Python
- `is` vs `==`
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

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Firebase Authentication
- Monaco Editor
- Pyodide
- CSS
- LocalStorage fallback for guest progress

### Backend

- FastAPI
- SQLAlchemy
- Alembic
- Pydantic
- Firebase Admin SDK
- SQLite for local development
- PostgreSQL on Render for production

### Deployment

- Frontend: Vercel
- Backend: Render Web Service
- Database: Render PostgreSQL
- Authentication: Firebase Authentication
- Firebase Hosting: used for the Firebase Auth helper domain

## Architecture Overview

```text
Vercel Frontend
      ↓
FastAPI Backend on Render
      ↓
Render PostgreSQL
      ↓
Firebase Authentication / Firebase Admin SDK
```

The frontend authenticates users through Firebase. The backend verifies Firebase ID tokens with Firebase Admin SDK. Authenticated progress endpoints store and retrieve lesson progress from PostgreSQL.

Guest progress can still fall back to localStorage, but signed-in users have account-based progress.

## Project Structure

```text
tasty_python/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── admin/
│   │   │   ├── apiStatus/
│   │   │   ├── auth/
│   │   │   ├── interview/
│   │   │   ├── practice/
│   │   │   └── progress/
│   │   ├── firebase/
│   │   ├── pages/
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
│   │   ├── data/
│   │   ├── db/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── seed/
│   │   └── main.py
│   ├── scripts/
│   │   ├── export_local_content.py
│   │   └── import_content_to_current_db.py
│   ├── alembic.ini
│   └── requirements.txt
│
├── vercel.json
└── README.md
```

## Environment Variables

### Frontend `.env.local`

Create this file in `frontend/`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000

VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id

VITE_ADMIN_PASSWORD=your-admin-token
```

For Vercel production:

```env
VITE_API_BASE_URL=https://tasty-python.onrender.com

VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id

VITE_ADMIN_PASSWORD=your-admin-token
```

### Backend `.env`

Create this file in `backend/`:

```env
DATABASE_URL=sqlite:///./tasty_python.db
ADMIN_API_TOKEN=your-admin-token
FRONTEND_URLS=http://localhost:5173,http://127.0.0.1:5173
FIREBASE_SERVICE_ACCOUNT_PATH=firebase-service-account.json
```

For Render production:

```env
DATABASE_URL=your-render-postgres-database-url
ADMIN_API_TOKEN=your-admin-token
FRONTEND_URLS=https://tasty-python.vercel.app,http://localhost:5173,http://127.0.0.1:5173
FIREBASE_SERVICE_ACCOUNT_PATH=path-to-firebase-service-account-json
```

The value of `ADMIN_API_TOKEN` in the backend must match `VITE_ADMIN_PASSWORD` in the frontend.

Do not commit `.env` files, Firebase service account JSON files, database URLs, or production secrets.

## Firebase Setup Notes

The project uses Firebase Authentication for email/password login and Google sign-in.

Firebase setup requires:

- a Firebase web app
- frontend Firebase config values in Vercel
- Firebase Admin SDK credentials for backend token verification
- authorized domains for local and production domains
- Google OAuth redirect URI for the Firebase Auth handler

Recommended Firebase Authorized Domains:

```text
localhost
127.0.0.1
tasty-python.vercel.app
tasty-python.web.app
tasty-python.firebaseapp.com
```

Google OAuth redirect URI example:

```text
https://tasty-python.web.app/__/auth/handler
```

## Running the Project Locally

The project has two parts:

```text
frontend/   React + TypeScript + Vite application
backend/    FastAPI backend
```

You need two terminals to run the full project locally.

### 1. Clone the repository

```bash
git clone https://github.com/Suntrotter/tasty_python.git
cd tasty_python
```

### 2. Run the backend

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment.

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

Create `.env` from the example if available:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Apply migrations:

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

Backend:

```text
http://127.0.0.1:8000
```

Swagger docs:

```text
http://127.0.0.1:8000/docs
```

Health check:

```text
http://127.0.0.1:8000/health
```

### 3. Run the frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
```

Create `.env.local` from the example if available:

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

Frontend:

```text
http://127.0.0.1:5173
```

## Build Checks

Before deploying frontend changes:

```bash
cd frontend
npm run build
```

Before deploying backend changes:

```bash
cd backend
python -m compileall app
```

## Backend API

Public learner endpoints:

```text
GET /health
GET /api/tracks
GET /api/tracks/{track_slug}
GET /api/tracks/{track_slug}/lessons
GET /api/lessons
GET /api/lessons/{lesson_slug}
GET /api/lessons/{lesson_slug}/content
```

Authenticated learner endpoints:

```text
GET /api/me
GET /api/progress/me
PUT /api/progress/me/lessons/{lesson_slug}
GET /api/progress/me/home-summary
```

Authenticated requests require a Firebase ID token:

```text
Authorization: Bearer <firebase-id-token>
```

Admin endpoints are available under:

```text
/api/admin/...
```

Admin API routes require:

```text
X-Admin-Token: <admin-token>
```

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

Important: the seed script recreates lesson content from backend source data. Do not run it in production if you want to preserve lesson edits made through the admin panel.

## Curriculum Export / Import

The backend includes scripts for moving curriculum content from local SQLite to the currently configured database:

```text
backend/scripts/export_local_content.py
backend/scripts/import_content_to_current_db.py
```

Export local curriculum content:

```bash
cd backend
python scripts/export_local_content.py
```

This creates:

```text
backend/scripts/curriculum_export.json
```

Import content into the currently configured database:

```bash
python scripts/import_content_to_current_db.py
```

Important: the import script writes to whatever database is currently set in `DATABASE_URL`.

For production imports, use the production database URL only temporarily and carefully. Do not commit production database URLs.

## Deployment Notes

### Render Backend

Recommended Render settings:

```text
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: python -m alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Required Render environment variables:

```text
DATABASE_URL
ADMIN_API_TOKEN
FRONTEND_URLS
FIREBASE_SERVICE_ACCOUNT_PATH
```

### Vercel Frontend

Recommended Vercel settings:

```text
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

The project includes rewrite rules for React Router deep links:

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
/login
/register
```

## Current Limitations

- Admin authentication is MVP-level and token-based.
- The admin token is currently exposed to the frontend as a `VITE_` variable, so it is suitable only for a portfolio/demo MVP.
- Only the first part of the curriculum is currently published.
- Lesson images are currently stored in the frontend `public/lesson-images` folder.
- Review scheduling and spaced repetition are planned but not implemented yet.
- Test coverage is not yet complete.
- The curriculum structure is much larger than the currently published content.

## Future Improvements

- More published lessons
- More advanced admin lesson authoring tools
- Admin-controlled lesson images
- Better review scheduling
- Spaced repetition for interview questions
- More advanced code runner tasks
- Richer dashboard analytics
- Better account-linking flows for multiple auth providers
- Test coverage for backend and frontend
- Stronger admin authentication for production-grade usage

## Portfolio Note

Tasty Python is designed as a portfolio project demonstrating:

- full-stack architecture
- frontend routing and state management
- Firebase Authentication integration
- backend token verification with Firebase Admin SDK
- authenticated FastAPI endpoints
- account-based progress tracking
- relational data modeling
- PostgreSQL production database usage
- database migrations with Alembic
- deployment with Vercel, Render, and PostgreSQL
- interactive educational UI
- admin content management
- learner progress persistence across sessions
