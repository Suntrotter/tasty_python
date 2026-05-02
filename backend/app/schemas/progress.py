from pydantic import BaseModel


class ProgressResponse(BaseModel):
    learner_id: str
    completed_lesson_slugs: list[str]