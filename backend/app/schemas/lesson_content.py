from typing import Literal

from pydantic import BaseModel


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


class LessonTextItem(BaseModel):
    id: int | None = None
    title: str | None = None
    content: str
    code: str | None = None
    output: str | None = None


class LessonTable(BaseModel):
    headers: list[str]
    rows: list[list[str]]


class LessonSection(BaseModel):
    id: str
    type: LessonSectionType
    title: str
    paragraphs: list[str] | None = None
    code: str | None = None
    output: str | None = None
    items: list[LessonTextItem] | None = None
    table: LessonTable | None = None


class LessonContent(BaseModel):
    slug: str
    title: str
    goal: str
    image_prompts: list[str] | None = None
    sections: list[LessonSection]