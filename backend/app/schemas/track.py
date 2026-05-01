from typing import Literal

from pydantic import BaseModel


TrackStatus = Literal["planned", "in_progress", "published"]


class Track(BaseModel):
    slug: str
    title: str
    description: str
    status: TrackStatus
    lesson_count: int