from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_allowed_origins
from app.routers import lessons, tracks

app = FastAPI(
    title="Tasty Python API",
    description="Backend API for the Tasty Python learning platform.",
    version="0.1.0",
)

allowed_origins = get_allowed_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tracks.router)
app.include_router(lessons.router)


@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Tasty Python API",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "tasty-python-api",
    }