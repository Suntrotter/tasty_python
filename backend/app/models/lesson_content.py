from sqlalchemy import ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class LessonContentModel(Base):
    __tablename__ = "lesson_contents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    lesson_id: Mapped[int] = mapped_column(
        ForeignKey("lessons.id"),
        unique=True,
        index=True,
    )

    title: Mapped[str] = mapped_column(String(255))
    goal: Mapped[str] = mapped_column(Text)
    image_prompts: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)

    lesson = relationship("LessonModel", back_populates="content")

    sections = relationship(
        "LessonSectionModel",
        back_populates="lesson_content",
        cascade="all, delete-orphan",
        order_by="LessonSectionModel.order",
    )


class LessonSectionModel(Base):
    __tablename__ = "lesson_sections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    lesson_content_id: Mapped[int] = mapped_column(
        ForeignKey("lesson_contents.id"),
        index=True,
    )

    section_key: Mapped[str] = mapped_column(String(120))
    type: Mapped[str] = mapped_column(String(50))
    title: Mapped[str] = mapped_column(String(255))
    order: Mapped[int] = mapped_column(Integer)
    paragraphs: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    code: Mapped[str | None] = mapped_column(Text, nullable=True)
    output: Mapped[str | None] = mapped_column(Text, nullable=True)

    lesson_content = relationship("LessonContentModel", back_populates="sections")

    items = relationship(
        "LessonItemModel",
        back_populates="section",
        cascade="all, delete-orphan",
        order_by="LessonItemModel.order",
    )

    table = relationship(
        "LessonTableModel",
        back_populates="section",
        cascade="all, delete-orphan",
        uselist=False,
    )


class LessonItemModel(Base):
    __tablename__ = "lesson_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    section_id: Mapped[int] = mapped_column(
        ForeignKey("lesson_sections.id"),
        index=True,
    )

    order: Mapped[int] = mapped_column(Integer)
    title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    content: Mapped[str] = mapped_column(Text)
    code: Mapped[str | None] = mapped_column(Text, nullable=True)
    output: Mapped[str | None] = mapped_column(Text, nullable=True)

    section = relationship("LessonSectionModel", back_populates="items")


class LessonTableModel(Base):
    __tablename__ = "lesson_tables"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    section_id: Mapped[int] = mapped_column(
        ForeignKey("lesson_sections.id"),
        unique=True,
        index=True,
    )

    headers: Mapped[list[str]] = mapped_column(JSON)
    rows: Mapped[list[list[str]]] = mapped_column(JSON)

    section = relationship("LessonSectionModel", back_populates="table")