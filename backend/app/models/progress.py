from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class UserProgressModel(Base):
    __tablename__ = "user_progress"

    __table_args__ = (
        UniqueConstraint(
            "learner_id",
            "lesson_id",
            name="uq_user_progress_learner_lesson",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    learner_id: Mapped[str] = mapped_column(String(120), index=True)

    lesson_id: Mapped[int] = mapped_column(
        ForeignKey("lessons.id"),
        index=True,
    )

    completed_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    lesson = relationship("LessonModel")