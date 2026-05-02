from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.db.database import get_db
from app.models.lesson import LessonModel
from app.models.lesson_content import (
    LessonContentModel,
    LessonSectionModel,
)
from app.schemas.lesson import LessonPreview
from app.schemas.lesson_content import LessonContent

router = APIRouter(prefix="/api/lessons", tags=["lessons"])


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
    }


def lesson_content_to_response(lesson_content: LessonContentModel) -> dict:
    return {
        "slug": lesson_content.lesson.slug,
        "title": lesson_content.title,
        "goal": lesson_content.goal,
        "image_prompts": lesson_content.image_prompts,
        "sections": [
            {
                "id": section.section_key,
                "type": section.type,
                "title": section.title,
                "paragraphs": section.paragraphs,
                "code": section.code,
                "output": section.output,
                "items": [
                    {
                        "title": item.title,
                        "content": item.content,
                        "code": item.code,
                        "output": item.output,
                    }
                    for item in section.items
                ]
                if section.items
                else None,
                "table": {
                    "headers": section.table.headers,
                    "rows": section.table.rows,
                }
                if section.table
                else None,
            }
            for section in lesson_content.sections
        ],
    }


@router.get("", response_model=list[LessonPreview])
def read_lessons(db: Session = Depends(get_db)):
    lessons = db.scalars(
        select(LessonModel)
        .options(joinedload(LessonModel.track))
        .order_by(LessonModel.track_id, LessonModel.order)
    ).all()

    return [lesson_to_response(lesson) for lesson in lessons]


@router.get("/{lesson_slug}", response_model=LessonPreview)
def read_lesson(lesson_slug: str, db: Session = Depends(get_db)):
    lesson = db.scalar(
        select(LessonModel)
        .options(joinedload(LessonModel.track))
        .where(LessonModel.slug == lesson_slug)
    )

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    return lesson_to_response(lesson)


@router.get("/{lesson_slug}/content", response_model=LessonContent)
def read_lesson_content(lesson_slug: str, db: Session = Depends(get_db)):
    lesson_content = db.scalar(
        select(LessonContentModel)
        .join(LessonModel)
        .options(
            joinedload(LessonContentModel.lesson),
            selectinload(LessonContentModel.sections).selectinload(
                LessonSectionModel.items
            ),
            selectinload(LessonContentModel.sections).selectinload(
                LessonSectionModel.table
            ),
        )
        .where(LessonModel.slug == lesson_slug)
    )

    if not lesson_content:
        raise HTTPException(status_code=404, detail="Lesson content not found")

    return lesson_content_to_response(lesson_content)