from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class UserProgressModel(Base):
    __tablename__ = "user_progress"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "lesson_id",
            name="uq_user_progress_user_lesson",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        index=True,
        nullable=False,
    )

    lesson_id: Mapped[int] = mapped_column(
        ForeignKey("lessons.id"),
        index=True,
        nullable=False,
    )

    completed_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    user = relationship("UserModel")
    lesson = relationship("LessonModel")