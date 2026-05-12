from typing import Literal
from app.schemas.lesson_block import LessonBlock
from pydantic import BaseModel, Field


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

HeroVisualVariant = Literal[
    "code-card",
    "recipe-card",
    "ingredient-board",
    "terminal-card",
]

HeroVisualTone = Literal[
    "warm",
    "green",
    "berry",
    "blue",
    "dark",
]


class HeroVisual(BaseModel):
    variant: HeroVisualVariant
    tone: HeroVisualTone | None = "warm"
    kicker: str
    title: str
    lines: list[str] = Field(default_factory=list)
    chips: list[str] = Field(default_factory=list)


class LessonTextItem(BaseModel):
    id: int | None = None
    title: str | None = None
    content: str
    code: str | None = None
    output: str | None = None
    after_text: str | None = None
    image_url: str | None = None
    image_alt: str | None = None


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
    image_url: str | None = None
    image_alt: str | None = None
    image_position: str | None = None
    items: list[LessonTextItem] | None = None
    table: LessonTable | None = None
    blocks: list[LessonBlock] | None = None


class LessonContent(BaseModel):
    slug: str
    title: str
    goal: str
    image_prompts: list[str] | None = None
    hero_visual: HeroVisual | None = None
    completion_image_url: str | None = None
    completion_image_alt: str | None = None
    completion_kicker: str | None = None
    completion_title: str | None = None
    completion_body: str | None = None
    sections: list[LessonSection]