from typing import Literal

from pydantic import BaseModel


LessonStatus = Literal[
    "planned",
    "in_progress",
    "published",
    "premium",
    "coming_soon",
]


class LessonStatusUpdate(BaseModel):
    status: LessonStatus