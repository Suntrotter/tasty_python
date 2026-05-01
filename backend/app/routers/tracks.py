from fastapi import APIRouter, HTTPException

from app.data.lessons import get_lessons_by_track_slug
from app.data.tracks import get_track_by_slug, tracks
from app.schemas.lesson import LessonPreview
from app.schemas.track import Track

router = APIRouter(prefix="/api/tracks", tags=["tracks"])


@router.get("", response_model=list[Track])
def read_tracks():
    return tracks


@router.get("/{track_slug}", response_model=Track)
def read_track(track_slug: str):
    track = get_track_by_slug(track_slug)

    if not track:
        raise HTTPException(status_code=404, detail="Track not found")

    return track


@router.get("/{track_slug}/lessons", response_model=list[LessonPreview])
def read_track_lessons(track_slug: str):
    track = get_track_by_slug(track_slug)

    if not track:
        raise HTTPException(status_code=404, detail="Track not found")

    return get_lessons_by_track_slug(track_slug)