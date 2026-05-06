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




class LessonMarkdownImport(BaseModel):
    markdown: str


class LessonSectionCreate(BaseModel):
    type: LessonSectionType
    title: str
    paragraphs: list[str] = []
    code: str | None = None
    output: str | None = None

class LessonSectionUpdate(BaseModel):
    type: LessonSectionType
    title: str
    paragraphs: list[str] = []
    code: str | None = None
    output: str | None = None

class LessonItemCreate(BaseModel):
    title: str | None = None
    content: str
    code: str | None = None
    output: str | None = None

class LessonTableUpsert(BaseModel):
    headers: list[str]
    rows: list[list[str]]

class LessonItemUpdate(BaseModel):
    title: str | None = None
    content: str
    code: str | None = None
    output: str | None = None