from typing import Literal

from pydantic import BaseModel


LessonStatus = Literal[
    "planned",
    "in_progress",
    "published",
    "premium",
    "coming_soon",
]

LessonDifficulty = Literal["beginner", "easy", "medium"]


class LessonPreview(BaseModel):
    slug: str
    track_slug: str
    order: int
    title: str
    status: LessonStatus
    difficulty: LessonDifficulty
    estimated_time: str
    short_description: str
    has_content: bool = False