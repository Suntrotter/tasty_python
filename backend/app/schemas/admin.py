from typing import Literal
from app.schemas.lesson_content import HeroVisual
from pydantic import BaseModel
from app.schemas.lesson_block import (
    LessonBlockCreate,
    LessonBlockReorder,
    LessonBlockUpdate,
)

LessonStatus = Literal[
    "planned",
    "in_progress",
    "published",
    "premium",
    "coming_soon",
]

LessonDifficulty = Literal["beginner", "easy", "medium"]

TrackStatus = Literal["planned", "in_progress", "published"]

LessonSectionType = Literal[
    "metaphor",
    "theory",
    "code_example",
    "interview",
    "trap_zone",
    "practice",
    "cheat_sheet",
    "answer_key",
]

ImagePosition = Literal[
    "top",
    "after_code",
    "bottom",
]


class LessonStatusUpdate(BaseModel):
    status: LessonStatus


class LessonMetadataUpdate(BaseModel):
    title: str
    short_description: str
    difficulty: LessonDifficulty
    estimated_time: str
    order: int


class TrackMetadataUpdate(BaseModel):
    title: str
    description: str
    status: TrackStatus
    lesson_count: int


class LessonContentBasicsUpdate(BaseModel):
    title: str
    goal: str
    image_prompts: list[str] = []
    hero_visual: HeroVisual | None = None
    completion_image_url: str | None = None
    completion_image_alt: str | None = None
    completion_kicker: str | None = None
    completion_title: str | None = None
    completion_body: str | None = None


class LessonMarkdownImport(BaseModel):
    markdown: str


class LessonSectionCreate(BaseModel):
    type: LessonSectionType
    title: str
    paragraphs: list[str] = []
    code: str | None = None
    output: str | None = None
    image_url: str | None = None
    image_alt: str | None = None
    image_position: ImagePosition | None = None


class LessonSectionUpdate(BaseModel):
    type: LessonSectionType
    title: str
    paragraphs: list[str] = []
    code: str | None = None
    output: str | None = None
    image_url: str | None = None
    image_alt: str | None = None
    image_position: ImagePosition | None = None


class LessonItemCreate(BaseModel):
    title: str | None = None
    content: str
    code: str | None = None
    output: str | None = None
    after_text: str | None = None
    image_url: str | None = None
    image_alt: str | None = None


class LessonItemUpdate(BaseModel):
    title: str | None = None
    content: str
    code: str | None = None
    output: str | None = None
    after_text: str | None = None
    image_url: str | None = None
    image_alt: str | None = None


class LessonTableUpsert(BaseModel):
    headers: list[str]
    rows: list[list[str]]