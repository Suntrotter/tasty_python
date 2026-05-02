from sqlalchemy import delete, func, select
from sqlalchemy.orm import selectinload

from app.data.lesson_content import lesson_contents
from app.data.lessons import lessons
from app.data.tracks import tracks
from app.db.database import SessionLocal
from app.models.lesson import LessonModel
from app.models.lesson_content import (
    LessonContentModel,
    LessonItemModel,
    LessonSectionModel,
    LessonTableModel,
)
from app.models.track import TrackModel


def delete_stale_lessons(db):
    source_lesson_slugs = {lesson["slug"] for lesson in lessons}

    db.execute(
        delete(LessonModel).where(LessonModel.slug.not_in(source_lesson_slugs))
    )


def delete_stale_tracks(db):
    source_track_slugs = {track["slug"] for track in tracks}

    db.execute(
        delete(TrackModel).where(TrackModel.slug.not_in(source_track_slugs))
    )


def seed_tracks(db):
    track_models_by_slug: dict[str, TrackModel] = {}

    for track_data in tracks:
        existing_track = db.scalar(
            select(TrackModel).where(TrackModel.slug == track_data["slug"])
        )

        if existing_track:
            existing_track.title = track_data["title"]
            existing_track.description = track_data["description"]
            existing_track.status = track_data["status"]
            existing_track.lesson_count = track_data["lesson_count"]

            track_models_by_slug[existing_track.slug] = existing_track
            continue

        new_track = TrackModel(
            slug=track_data["slug"],
            title=track_data["title"],
            description=track_data["description"],
            status=track_data["status"],
            lesson_count=track_data["lesson_count"],
        )

        db.add(new_track)
        db.flush()

        track_models_by_slug[new_track.slug] = new_track

    return track_models_by_slug


def seed_lessons(db, track_models_by_slug: dict[str, TrackModel]):
    for lesson_data in lessons:
        track = track_models_by_slug.get(lesson_data["track_slug"])

        if not track:
            print(
                f"Skipping lesson '{lesson_data['slug']}' because track "
                f"'{lesson_data['track_slug']}' was not found."
            )
            continue

        existing_lesson = db.scalar(
            select(LessonModel).where(LessonModel.slug == lesson_data["slug"])
        )

        if existing_lesson:
            existing_lesson.track_id = track.id
            existing_lesson.order = lesson_data["order"]
            existing_lesson.title = lesson_data["title"]
            existing_lesson.status = lesson_data["status"]
            existing_lesson.difficulty = lesson_data["difficulty"]
            existing_lesson.estimated_time = lesson_data["estimated_time"]
            existing_lesson.short_description = lesson_data["short_description"]
            continue

        new_lesson = LessonModel(
            slug=lesson_data["slug"],
            track_id=track.id,
            order=lesson_data["order"],
            title=lesson_data["title"],
            status=lesson_data["status"],
            difficulty=lesson_data["difficulty"],
            estimated_time=lesson_data["estimated_time"],
            short_description=lesson_data["short_description"],
        )

        db.add(new_lesson)


def delete_existing_lesson_content(db, lesson: LessonModel):
    existing_content = db.scalar(
        select(LessonContentModel)
        .options(
            selectinload(LessonContentModel.sections).selectinload(
                LessonSectionModel.items
            ),
            selectinload(LessonContentModel.sections).selectinload(
                LessonSectionModel.table
            ),
        )
        .where(LessonContentModel.lesson_id == lesson.id)
    )

    if existing_content:
        db.delete(existing_content)
        db.flush()


def seed_lesson_content(db):
    for content_data in lesson_contents:
        lesson = db.scalar(
            select(LessonModel).where(LessonModel.slug == content_data["slug"])
        )

        if not lesson:
            print(
                f"Skipping lesson content '{content_data['slug']}' because "
                "matching lesson was not found."
            )
            continue

        delete_existing_lesson_content(db, lesson)

        lesson_content = LessonContentModel(
            lesson_id=lesson.id,
            title=content_data["title"],
            goal=content_data["goal"],
            image_prompts=content_data.get("image_prompts"),
        )

        db.add(lesson_content)
        db.flush()

        for section_index, section_data in enumerate(
            content_data["sections"],
            start=1,
        ):
            section = LessonSectionModel(
                lesson_content_id=lesson_content.id,
                section_key=section_data["id"],
                type=section_data["type"],
                title=section_data["title"],
                order=section_index,
                paragraphs=section_data.get("paragraphs"),
                code=section_data.get("code"),
                output=section_data.get("output"),
            )

            db.add(section)
            db.flush()

            for item_index, item_data in enumerate(
                section_data.get("items", []),
                start=1,
            ):
                item = LessonItemModel(
                    section_id=section.id,
                    order=item_index,
                    title=item_data.get("title"),
                    content=item_data["content"],
                    code=item_data.get("code"),
                    output=item_data.get("output"),
                )

                db.add(item)

            table_data = section_data.get("table")

            if table_data:
                table = LessonTableModel(
                    section_id=section.id,
                    headers=table_data["headers"],
                    rows=table_data["rows"],
                )

                db.add(table)


def seed_database():
    db = SessionLocal()

    try:
        delete_stale_lessons(db)
        delete_stale_tracks(db)

        track_models_by_slug = seed_tracks(db)
        seed_lessons(db, track_models_by_slug)
        seed_lesson_content(db)

        db.commit()

        tracks_count = db.scalar(select(func.count()).select_from(TrackModel))
        lessons_count = db.scalar(select(func.count()).select_from(LessonModel))
        contents_count = db.scalar(
            select(func.count()).select_from(LessonContentModel)
        )
        sections_count = db.scalar(
            select(func.count()).select_from(LessonSectionModel)
        )

        print("Database seeded successfully.")
        print(f"Tracks in database: {tracks_count}")
        print(f"Lessons in database: {lessons_count}")
        print(f"Lesson contents in database: {contents_count}")
        print(f"Lesson sections in database: {sections_count}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()