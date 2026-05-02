from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.models.lesson import LessonModel
from app.schemas.admin import LessonStatusUpdate
from app.schemas.lesson import LessonPreview

router = APIRouter(prefix="/api/admin", tags=["admin"])


def lesson_to_response(lesson: LessonModel) -> dict:
    return {
        "slug": lesson.slug,
        "track_slug": lesson.track.slug,
        "order": lesson.order,
        "title": lesson.title,
        "status": lesson.status,
        "difficulty": lesson.difficulty,
        "estimated_time": lesson.estimated_time,
        "short_description": lesson.short_description,
        "has_content": lesson.content is not None,
    }


@router.patch(
    "/lessons/{lesson_slug}/status",
    response_model=LessonPreview,
)
def update_lesson_status(
    lesson_slug: str,
    payload: LessonStatusUpdate,
    db: Session = Depends(get_db),
):
    lesson = db.scalar(
        select(LessonModel)
        .options(
            joinedload(LessonModel.track),
            joinedload(LessonModel.content),
        )
        .where(LessonModel.slug == lesson_slug)
    )

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    lesson.status = payload.status

    db.commit()
    db.refresh(lesson)

    return lesson_to_response(lesson)