from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.models.lesson import LessonModel
from app.models.progress import UserProgressModel
from app.schemas.progress import ProgressResponse

router = APIRouter(prefix="/api/progress", tags=["progress"])


def get_progress_response(db: Session, learner_id: str) -> dict:
    progress_items = db.scalars(
        select(UserProgressModel)
        .options(joinedload(UserProgressModel.lesson))
        .where(UserProgressModel.learner_id == learner_id)
        .order_by(UserProgressModel.completed_at)
    ).all()

    return {
        "learner_id": learner_id,
        "completed_lesson_slugs": [
            progress.lesson.slug for progress in progress_items
        ],
    }


@router.get("/{learner_id}", response_model=ProgressResponse)
def read_progress(learner_id: str, db: Session = Depends(get_db)):
    return get_progress_response(db, learner_id)


@router.post(
    "/{learner_id}/lessons/{lesson_slug}",
    response_model=ProgressResponse,
)
def mark_lesson_completed(
    learner_id: str,
    lesson_slug: str,
    db: Session = Depends(get_db),
):
    lesson = db.scalar(
        select(LessonModel).where(LessonModel.slug == lesson_slug)
    )

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    existing_progress = db.scalar(
        select(UserProgressModel).where(
            UserProgressModel.learner_id == learner_id,
            UserProgressModel.lesson_id == lesson.id,
        )
    )

    if not existing_progress:
        progress = UserProgressModel(
            learner_id=learner_id,
            lesson_id=lesson.id,
        )

        db.add(progress)
        db.commit()

    return get_progress_response(db, learner_id)


@router.delete(
    "/{learner_id}/lessons/{lesson_slug}",
    response_model=ProgressResponse,
)
def mark_lesson_incomplete(
    learner_id: str,
    lesson_slug: str,
    db: Session = Depends(get_db),
):
    lesson = db.scalar(
        select(LessonModel).where(LessonModel.slug == lesson_slug)
    )

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    db.execute(
        delete(UserProgressModel).where(
            UserProgressModel.learner_id == learner_id,
            UserProgressModel.lesson_id == lesson.id,
        )
    )

    db.commit()

    return get_progress_response(db, learner_id)