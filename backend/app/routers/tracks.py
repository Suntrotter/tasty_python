from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.models.lesson import LessonModel
from app.models.track import TrackModel
from app.schemas.lesson import LessonPreview
from app.schemas.track import Track

router = APIRouter(prefix="/api/tracks", tags=["tracks"])


def track_to_response(track: TrackModel) -> dict:
    return {
        "slug": track.slug,
        "title": track.title,
        "description": track.description,
        "status": track.status,
        "lesson_count": track.lesson_count,
    }


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


@router.get("", response_model=list[Track])
def read_tracks(db: Session = Depends(get_db)):
    tracks = db.scalars(
        select(TrackModel).order_by(TrackModel.id)
    ).all()

    return [track_to_response(track) for track in tracks]


@router.get("/{track_slug}", response_model=Track)
def read_track(track_slug: str, db: Session = Depends(get_db)):
    track = db.scalar(
        select(TrackModel).where(TrackModel.slug == track_slug)
    )

    if not track:
        raise HTTPException(status_code=404, detail="Track not found")

    return track_to_response(track)


@router.get("/{track_slug}/lessons", response_model=list[LessonPreview])
def read_track_lessons(track_slug: str, db: Session = Depends(get_db)):
    track = db.scalar(
        select(TrackModel).where(TrackModel.slug == track_slug)
    )

    if not track:
        raise HTTPException(status_code=404, detail="Track not found")

    lessons = db.scalars(
    select(LessonModel)
    .options(
        joinedload(LessonModel.track),
        joinedload(LessonModel.content),
    )
    .where(LessonModel.track_id == track.id)
    .order_by(LessonModel.order)
).all()

    return [lesson_to_response(lesson) for lesson in lessons]