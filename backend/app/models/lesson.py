from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class LessonModel(Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    track_id: Mapped[int] = mapped_column(ForeignKey("tracks.id"))

    order: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(50), default="planned")
    difficulty: Mapped[str] = mapped_column(String(50), default="beginner")
    estimated_time: Mapped[str] = mapped_column(String(50))
    short_description: Mapped[str] = mapped_column(Text)

    track = relationship("TrackModel", back_populates="lessons")

    content = relationship(
        "LessonContentModel",
        back_populates="lesson",
        cascade="all, delete-orphan",
        uselist=False,
    )