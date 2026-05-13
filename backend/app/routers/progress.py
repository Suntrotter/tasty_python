from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.orm import Session, joinedload

from app.core.current_user import get_current_user
from app.db.database import get_db
from app.models.lesson import LessonModel
from app.models.track import TrackModel
from app.models.progress import UserProgressModel
from app.models.user import UserModel
from app.schemas.progress import (
    HomeSummaryResponse,
    LessonProgressUpdate,
    ProgressResponse,
    TracksSummaryResponse,
)

router = APIRouter(prefix="/api/progress", tags=["progress"])


def lesson_to_home_summary(lesson: LessonModel) -> dict:
    return {
        "id": str(lesson.id),
        "slug": lesson.slug,
        "title": lesson.title,
        "lessonNumber": lesson.order,
        "level": lesson.difficulty,
        "duration": lesson.estimated_time,
        "summary": lesson.short_description,
    }

def get_all_tracks_with_lessons(db: Session) -> list[TrackModel]:
    return db.scalars(
        select(TrackModel)
        .options(joinedload(TrackModel.lessons))
        .order_by(TrackModel.id)
    ).unique().all()


def get_ready_lessons_for_track(track: TrackModel) -> list[LessonModel]:
    return sorted(
        [
            lesson
            for lesson in track.lessons
            if lesson.status == "published"
        ],
        key=lambda lesson: lesson.order,
    )


def get_total_lessons_for_track(track: TrackModel) -> int:
    return len(track.lessons)


def get_next_unfinished_lesson_for_track(
    ready_lessons: list[LessonModel],
    completed_lesson_ids: set[int],
) -> LessonModel | None:
    return next(
        (
            lesson
            for lesson in ready_lessons
            if lesson.id not in completed_lesson_ids
        ),
        None,
    )


def track_to_summary_card(
    track: TrackModel,
    completed_lesson_ids: set[int],
    is_current: bool = False,
) -> dict:
    ready_lessons = get_ready_lessons_for_track(track)
    total_lessons_count = get_total_lessons_for_track(track)
    ready_lessons_count = len(ready_lessons)

    completed_lessons_count = len(
        [
            lesson
            for lesson in ready_lessons
            if lesson.id in completed_lesson_ids
        ]
    )

    progress_percent = (
        round((completed_lessons_count / ready_lessons_count) * 100)
        if ready_lessons_count > 0
        else 0
    )

    next_lesson = get_next_unfinished_lesson_for_track(
        ready_lessons,
        completed_lesson_ids,
    )

    track_is_completed = (
        ready_lessons_count > 0
        and completed_lessons_count >= ready_lessons_count
    )

    if track_is_completed:
        cta_label = "Review track"
        cta_to = f"/tracks/{track.slug}"
    elif next_lesson:
        cta_label = "Continue track" if completed_lessons_count > 0 else "Start track"
        cta_to = f"/lessons/{next_lesson.slug}"
    elif is_current:
        cta_label = "View track"
        cta_to = f"/tracks/{track.slug}"
    else:
        cta_label = "View roadmap"
        cta_to = f"/tracks/{track.slug}"

    return {
        "id": str(track.id),
        "slug": track.slug,
        "title": track.title,
        "description": track.description,
        "status": track.status,
        "totalLessonsCount": total_lessons_count,
        "readyLessonsCount": ready_lessons_count,
        "completedLessonsCount": completed_lessons_count,
        "progressPercent": progress_percent,
        "ctaLabel": cta_label,
        "ctaTo": cta_to,
    }


def get_published_lessons(db: Session) -> list[LessonModel]:
    return db.scalars(
        select(LessonModel)
        .where(LessonModel.status == "published")
        .order_by(LessonModel.track_id, LessonModel.order)
    ).all()


def get_completed_progress_items(
    db: Session,
    user: UserModel,
) -> list[UserProgressModel]:
    return db.scalars(
        select(UserProgressModel)
        .options(joinedload(UserProgressModel.lesson))
        .where(UserProgressModel.user_id == user.id)
        .order_by(UserProgressModel.completed_at)
    ).all()


def get_progress_response(db: Session, user: UserModel) -> dict:
    progress_items = get_completed_progress_items(db, user)

    return {
        "completed_lesson_slugs": [
            progress.lesson.slug for progress in progress_items if progress.lesson
        ],
    }


@router.get("/me", response_model=ProgressResponse)
def read_my_progress(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    return get_progress_response(db, current_user)


@router.put("/me/lessons/{lesson_slug}", response_model=ProgressResponse)
def update_my_lesson_progress(
    lesson_slug: str,
    payload: LessonProgressUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    lesson = db.scalar(
        select(LessonModel).where(
            LessonModel.slug == lesson_slug,
            LessonModel.status == "published",
        )
    )

    if not lesson:
        raise HTTPException(
            status_code=404,
            detail="Published lesson not found",
        )

    existing_progress = db.scalar(
        select(UserProgressModel).where(
            UserProgressModel.user_id == current_user.id,
            UserProgressModel.lesson_id == lesson.id,
        )
    )

    if payload.is_completed:
        if not existing_progress:
            progress = UserProgressModel(
                user_id=current_user.id,
                lesson_id=lesson.id,
            )

            db.add(progress)
            db.commit()
    else:
        if existing_progress:
            db.execute(
                delete(UserProgressModel).where(
                    UserProgressModel.user_id == current_user.id,
                    UserProgressModel.lesson_id == lesson.id,
                )
            )
            db.commit()

    return get_progress_response(db, current_user)


@router.delete("/me/lessons/{lesson_slug}", response_model=ProgressResponse)
def mark_my_lesson_incomplete(
    lesson_slug: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    lesson = db.scalar(
        select(LessonModel).where(
            LessonModel.slug == lesson_slug,
            LessonModel.status == "published",
        )
    )

    if not lesson:
        raise HTTPException(
            status_code=404,
            detail="Published lesson not found",
        )

    db.execute(
        delete(UserProgressModel).where(
            UserProgressModel.user_id == current_user.id,
            UserProgressModel.lesson_id == lesson.id,
        )
    )

    db.commit()

    return get_progress_response(db, current_user)


@router.get("/me/home-summary", response_model=HomeSummaryResponse)
def read_my_home_summary(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    published_lessons = get_published_lessons(db)
    progress_items = get_completed_progress_items(db, current_user)

    completed_lesson_ids = {
        progress.lesson_id for progress in progress_items
    }

    total_lessons_count = len(published_lessons)
    completed_lessons_count = len(
        [
            lesson
            for lesson in published_lessons
            if lesson.id in completed_lesson_ids
        ]
    )

    has_progress = completed_lessons_count > 0
    all_lessons_completed = (
        total_lessons_count > 0
        and completed_lessons_count >= total_lessons_count
    )

    next_lesson = next(
        (
            lesson
            for lesson in published_lessons
            if lesson.id not in completed_lesson_ids
        ),
        None,
    )

    if total_lessons_count == 0:
        return {
            "userId": current_user.id,
            "hasProgress": False,
            "completedLessonsCount": 0,
            "totalLessonsCount": 0,
            "allLessonsCompleted": False,
            "nextLesson": None,
            "heroBite": {
                "kicker": "Coming soon",
                "title": "Python lessons are warming up",
                "lines": [
                    "New lessons will appear here when they are published.",
                ],
                "description": "The course kitchen is being prepared.",
            },
            "primaryCta": {
                "label": "View tracks",
                "to": "/tracks",
            },
            "secondaryCta": {
                "label": "See how it works",
                "to": "/#how-it-works",
            },
        }

    if all_lessons_completed:
        return {
            "userId": current_user.id,
            "hasProgress": True,
            "completedLessonsCount": completed_lessons_count,
            "totalLessonsCount": total_lessons_count,
            "allLessonsCompleted": True,
            "nextLesson": None,
            "heroBite": {
                "kicker": "Course complete",
                "title": "Review your Python core",
                "lines": [
                    "You completed every published lesson.",
                    "Now it is time to revise, explain, and practice.",
                ],
                "description": "Great work. You can review your progress or keep sharpening your interview answers.",
            },
            "primaryCta": {
                "label": "Review progress",
                "to": "/dashboard",
            },
            "secondaryCta": {
                "label": "Practice interview answers",
                "to": "/interview-mode",
            },
        }

    if next_lesson is None:
        raise HTTPException(
            status_code=500,
            detail="Could not determine next lesson",
        )

    if has_progress:
        kicker = "Your next bite"
        primary_label = "Continue learning"
        secondary_label = "Practice interview answers"
        secondary_to = "/interview-mode"
    else:
        kicker = "Your first bite"
        primary_label = "Start learning"
        secondary_label = "See how it works"
        secondary_to = "/#how-it-works"

    return {
        "userId": current_user.id,
        "hasProgress": has_progress,
        "completedLessonsCount": completed_lessons_count,
        "totalLessonsCount": total_lessons_count,
        "allLessonsCompleted": False,
        "nextLesson": lesson_to_home_summary(next_lesson),
        "heroBite": {
            "kicker": kicker,
            "title": next_lesson.title,
            "lines": [
                f"Lesson {next_lesson.order}",
                next_lesson.difficulty,
                next_lesson.estimated_time,
            ],
            "description": next_lesson.short_description,
        },
        "primaryCta": {
            "label": primary_label,
            "to": f"/lessons/{next_lesson.slug}",
        },
        "secondaryCta": {
            "label": secondary_label,
            "to": secondary_to,
        },
    }

@router.get("/me/tracks-summary", response_model=TracksSummaryResponse)
def read_my_tracks_summary(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    tracks = get_all_tracks_with_lessons(db)
    progress_items = get_completed_progress_items(db, current_user)

    completed_lesson_ids = {
        progress.lesson_id for progress in progress_items
    }

    completed_tracks: list[dict] = []
    incomplete_tracks: list[TrackModel] = []

    for track in tracks:
        ready_lessons = get_ready_lessons_for_track(track)
        ready_lessons_count = len(ready_lessons)

        completed_lessons_count = len(
            [
                lesson
                for lesson in ready_lessons
                if lesson.id in completed_lesson_ids
            ]
        )

        track_is_completed = (
            ready_lessons_count > 0
            and completed_lessons_count >= ready_lessons_count
        )

        if track_is_completed:
            completed_tracks.append(
                track_to_summary_card(track, completed_lesson_ids)
            )
        else:
            incomplete_tracks.append(track)

    current_track = incomplete_tracks[0] if incomplete_tracks else None

    up_next_tracks = incomplete_tracks[1:4] if current_track else []
    more_tracks = incomplete_tracks[4:] if current_track else []

    return {
        "completedTracks": completed_tracks,
        "currentTrack": track_to_summary_card(
            current_track,
            completed_lesson_ids,
            is_current=True,
        )
        if current_track
        else None,
        "upNextTracks": [
            track_to_summary_card(track, completed_lesson_ids)
            for track in up_next_tracks
        ],
        "moreTracks": [
            track_to_summary_card(track, completed_lesson_ids)
            for track in more_tracks
        ],
    }