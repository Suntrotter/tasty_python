"""use authenticated users for progress

Revision ID: 46049753bf60
Revises: a95e97098fb1
Create Date: 2026-05-11 18:49:03.693377

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '46049753bf60'
down_revision: Union[str, Sequence[str], None] = 'a95e97098fb1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_table("user_progress")

    op.create_table(
        "user_progress",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("lesson_id", sa.Integer(), nullable=False),
        sa.Column("completed_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_id",
            "lesson_id",
            name="uq_user_progress_user_lesson",
        ),
    )

    op.create_index(
        op.f("ix_user_progress_id"),
        "user_progress",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_user_progress_user_id"),
        "user_progress",
        ["user_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_user_progress_lesson_id"),
        "user_progress",
        ["lesson_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_user_progress_lesson_id"), table_name="user_progress")
    op.drop_index(op.f("ix_user_progress_user_id"), table_name="user_progress")
    op.drop_index(op.f("ix_user_progress_id"), table_name="user_progress")
    op.drop_table("user_progress")

    op.create_table(
        "user_progress",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("learner_id", sa.String(length=120), nullable=False),
        sa.Column("lesson_id", sa.Integer(), nullable=False),
        sa.Column("completed_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "learner_id",
            "lesson_id",
            name="uq_user_progress_learner_lesson",
        ),
    )

    op.create_index(
        op.f("ix_user_progress_id"),
        "user_progress",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_user_progress_learner_id"),
        "user_progress",
        ["learner_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_user_progress_lesson_id"),
        "user_progress",
        ["lesson_id"],
        unique=False,
    )
