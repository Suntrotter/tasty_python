import json
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]

if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.database import SessionLocal
from app.models import (
    LessonContentModel,
    LessonModel,
    LessonSectionModel,
    TrackModel,
)

EXPORT_PATH = Path(__file__).resolve().parent / "curriculum_export.json"


def serialize_lesson_content(content: LessonContentModel | None) -> dict | None:
    if not content:
        return None

    sections = sorted(content.sections, key=lambda section: section.order)

    return {
        "title": content.title,
        "goal": content.goal,
        "image_prompts": content.image_prompts,
        "hero_visual": content.hero_visual,
        "completion_image_url": content.completion_image_url,
        "completion_image_alt": content.completion_image_alt,
        "completion_kicker": content.completion_kicker,
        "completion_title": content.completion_title,
        "completion_body": content.completion_body,
        "sections": [
            {
                "section_key": section.section_key,
                "type": section.type,
                "title": section.title,
                "order": section.order,
                "paragraphs": section.paragraphs,
                "code": section.code,
                "output": section.output,
                "image_url": section.image_url,
                "image_alt": section.image_alt,
                "image_position": section.image_position,
                "items": [
                    {
                        "order": item.order,
                        "title": item.title,
                        "content": item.content,
                        "code": item.code,
                        "output": item.output,
                        "after_text": item.after_text,
                        "image_url": item.image_url,
                        "image_alt": item.image_alt,
                    }
                    for item in sorted(section.items, key=lambda item: item.order)
                ],
                "table": {
                    "headers": section.table.headers,
                    "rows": section.table.rows,
                }
                if section.table
                else None,
                "blocks": [
                    {
                        "block_key": block.block_key,
                        "type": block.type,
                        "order": block.order,
                        "data": block.data,
                    }
                    for block in sorted(section.blocks, key=lambda block: block.order)
                ],
            }
            for section in sections
        ],
    }


def serialize_lesson(lesson: LessonModel) -> dict:
    return {
        "slug": lesson.slug,
        "order": lesson.order,
        "title": lesson.title,
        "status": lesson.status,
        "difficulty": lesson.difficulty,
        "estimated_time": lesson.estimated_time,
        "short_description": lesson.short_description,
        "content": serialize_lesson_content(lesson.content),
    }


def serialize_track(track: TrackModel) -> dict:
    lessons = sorted(track.lessons, key=lambda lesson: lesson.order)

    return {
        "slug": track.slug,
        "title": track.title,
        "description": track.description,
        "status": track.status,
        "lesson_count": track.lesson_count,
        "lessons": [serialize_lesson(lesson) for lesson in lessons],
    }


def main() -> None:
    with SessionLocal() as db:
        tracks = db.scalars(
            select(TrackModel)
            .options(
                selectinload(TrackModel.lessons)
                .selectinload(LessonModel.content)
                .selectinload(LessonContentModel.sections)
                .selectinload(LessonSectionModel.items),
                selectinload(TrackModel.lessons)
                .selectinload(LessonModel.content)
                .selectinload(LessonContentModel.sections)
                .selectinload(LessonSectionModel.table),
                selectinload(TrackModel.lessons)
                .selectinload(LessonModel.content)
                .selectinload(LessonContentModel.sections)
                .selectinload(LessonSectionModel.blocks),
            )
            .order_by(TrackModel.id)
        ).all()

        payload = {
            "version": 1,
            "tracks": [serialize_track(track) for track in tracks],
        }

    EXPORT_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(f"Exported {len(payload['tracks'])} tracks to:")
    print(EXPORT_PATH)


if __name__ == "__main__":
    main()