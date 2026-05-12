from typing import Literal

from pydantic import BaseModel, Field


LessonBlockType = Literal[
    "rich_text",
    "code",
    "callout",
    "image",
    "table",
    "practice_single",
    "practice_multi",
    "practice_code",
    "accordion",
]


class LessonBlock(BaseModel):
    id: int | None = None
    key: str
    type: LessonBlockType
    order: int
    data: dict = Field(default_factory=dict)


class LessonBlockCreate(BaseModel):
    type: LessonBlockType
    data: dict = Field(default_factory=dict)


class LessonBlockUpdate(BaseModel):
    type: LessonBlockType
    data: dict = Field(default_factory=dict)


class LessonBlockReorder(BaseModel):
    block_ids: list[int]