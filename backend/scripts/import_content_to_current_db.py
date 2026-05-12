import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]

if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

import json
from pathlib import Path

from sqlalchemy import select

from app.db.database import SessionLocal
from app.models import (
    LessonBlockModel,
    LessonContentModel,
    LessonItemModel,
    LessonModel,
    LessonSectionModel,
    LessonTableModel,
    TrackModel,
)


IMPORT_PATH = Path(__file__).resolve().parent / "curriculum_export.json"


def get_or_create_track(db, track_data: dict) -> TrackModel:
    track = db.scalar(
        select(TrackModel).where(TrackModel.slug == track_data["slug"])
    )

    if not track:
        track = TrackModel(
            slug=track_data["slug"],
            title=track_data["title"],
            description=track_data["description"],
            status=track_data["status"],
            lesson_count=track_data["lesson_count"],
        )
        db.add(track)
        db.flush()
        return track

    track.title = track_data["title"]
    track.description = track_data["description"]
    track.status = track_data["status"]
    track.lesson_count = track_data["lesson_count"]

    return track


def get_or_create_lesson(db, track: TrackModel, lesson_data: dict) -> LessonModel:
    lesson = db.scalar(
        select(LessonModel).where(LessonModel.slug == lesson_data["slug"])
    )

    if not lesson:
        lesson = LessonModel(
            slug=lesson_data["slug"],
            track_id=track.id,
            order=lesson_data["order"],
            title=lesson_data["title"],
            status=lesson_data["status"],
            difficulty=lesson_data["difficulty"],
            estimated_time=lesson_data["estimated_time"],
            short_description=lesson_data["short_description"],
        )
        db.add(lesson)
        db.flush()
        return lesson

    lesson.track_id = track.id
    lesson.order = lesson_data["order"]
    lesson.title = lesson_data["title"]
    lesson.status = lesson_data["status"]
    lesson.difficulty = lesson_data["difficulty"]
    lesson.estimated_time = lesson_data["estimated_time"]
    lesson.short_description = lesson_data["short_description"]

    return lesson


def recreate_lesson_content(
    db,
    lesson: LessonModel,
    content_data: dict | None,
) -> None:
    if lesson.content:
        db.delete(lesson.content)
        db.flush()

    if not content_data:
        return

    content = LessonContentModel(
        lesson_id=lesson.id,
        title=content_data["title"],
        goal=content_data["goal"],
        image_prompts=content_data.get("image_prompts"),
        hero_visual=content_data.get("hero_visual"),
        completion_image_url=content_data.get("completion_image_url"),
        completion_image_alt=content_data.get("completion_image_alt"),
        completion_kicker=content_data.get("completion_kicker"),
        completion_title=content_data.get("completion_title"),
        completion_body=content_data.get("completion_body"),
    )

    db.add(content)
    db.flush()

    for section_data in content_data.get("sections", []):
        section = LessonSectionModel(
            lesson_content_id=content.id,
            section_key=section_data["section_key"],
            type=section_data["type"],
            title=section_data["title"],
            order=section_data["order"],
            paragraphs=section_data.get("paragraphs"),
            code=section_data.get("code"),
            output=section_data.get("output"),
            image_url=section_data.get("image_url"),
            image_alt=section_data.get("image_alt"),
            image_position=section_data.get("image_position"),
        )

        db.add(section)
        db.flush()

        for item_data in section_data.get("items", []):
            db.add(
                LessonItemModel(
                    section_id=section.id,
                    order=item_data["order"],
                    title=item_data.get("title"),
                    content=item_data["content"],
                    code=item_data.get("code"),
                    output=item_data.get("output"),
                    after_text=item_data.get("after_text"),
                    image_url=item_data.get("image_url"),
                    image_alt=item_data.get("image_alt"),
                )
            )

        table_data = section_data.get("table")

        if table_data:
            db.add(
                LessonTableModel(
                    section_id=section.id,
                    headers=table_data["headers"],
                    rows=table_data["rows"],
                )
            )

        for block_data in section_data.get("blocks", []):
            db.add(
                LessonBlockModel(
                    section_id=section.id,
                    block_key=block_data["block_key"],
                    type=block_data["type"],
                    order=block_data["order"],
                    data=block_data.get("data") or {},
                )
            )


def main() -> None:
    if not IMPORT_PATH.exists():
        raise FileNotFoundError(
            f"Import file not found: {IMPORT_PATH}. "
            "Run export_local_content.py first."
        )

    payload = json.loads(IMPORT_PATH.read_text(encoding="utf-8"))

    tracks_count = 0
    lessons_count = 0

    with SessionLocal() as db:
        for track_data in payload.get("tracks", []):
            track = get_or_create_track(db, track_data)
            tracks_count += 1

            for lesson_data in track_data.get("lessons", []):
                lesson = get_or_create_lesson(db, track, lesson_data)
                recreate_lesson_content(db, lesson, lesson_data.get("content"))
                lessons_count += 1

        db.commit()

    print("Curriculum import completed.")
    print(f"Tracks imported/updated: {tracks_count}")
    print(f"Lessons imported/updated: {lessons_count}")


if __name__ == "__main__":
    main()