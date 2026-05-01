from fastapi import APIRouter, HTTPException

from app.data.lessons import get_lesson_by_slug, lessons
from app.schemas.lesson import LessonPreview

router = APIRouter(prefix="/api/lessons", tags=["lessons"])


@router.get("", response_model=list[LessonPreview])
def read_lessons():
    return lessons


@router.get("/{lesson_slug}", response_model=LessonPreview)
def read_lesson(lesson_slug: str):
    lesson = get_lesson_by_slug(lesson_slug)

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    return lesson