from pydantic import BaseModel


class ProgressResponse(BaseModel):
    completed_lesson_slugs: list[str]


class LessonProgressUpdate(BaseModel):
    is_completed: bool


class HomeSummaryLesson(BaseModel):
    id: str
    slug: str
    title: str
    lessonNumber: int | None = None
    level: str | None = None
    duration: str | None = None
    summary: str | None = None


class HomeSummaryHeroBite(BaseModel):
    kicker: str
    title: str
    lines: list[str]
    description: str


class HomeSummaryCta(BaseModel):
    label: str
    to: str


class HomeSummaryResponse(BaseModel):
    userId: int
    hasProgress: bool
    completedLessonsCount: int
    totalLessonsCount: int
    allLessonsCompleted: bool
    nextLesson: HomeSummaryLesson | None
    heroBite: HomeSummaryHeroBite
    primaryCta: HomeSummaryCta
    secondaryCta: HomeSummaryCta