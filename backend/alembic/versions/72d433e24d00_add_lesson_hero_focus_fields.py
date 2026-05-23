"""add lesson hero focus fields

Revision ID: 72d433e24d00
Revises: db103aaf7bd4
Create Date: 2026-05-22 21:00:39.430283

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '72d433e24d00'
down_revision: Union[str, Sequence[str], None] = 'db103aaf7bd4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "lesson_contents",
        sa.Column("concept_label", sa.String(length=120), nullable=True),
    )
    op.add_column(
        "lesson_contents",
        sa.Column("interview_focus", sa.String(length=500), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("lesson_contents", "interview_focus")
    op.drop_column("lesson_contents", "concept_label")