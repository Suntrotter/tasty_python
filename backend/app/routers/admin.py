import copy
import re

from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.core.admin_auth import require_admin_token
from app.db.database import get_db
from app.models.lesson import LessonModel
from app.models.lesson_content import (
    LessonBlockModel,
    LessonContentModel,
    LessonItemModel,
    LessonSectionModel,
    LessonTableModel,
)
from app.models.track import TrackModel
from app.schemas.admin import (
    LessonBlockCreate,
    LessonBlockReorder,
    LessonBlockUpdate,
    LessonContentBasicsUpdate,
    LessonItemCreate,
    LessonItemUpdate,
    LessonMarkdownImport,
    LessonMetadataUpdate,
    LessonSectionCreate,
    LessonSectionUpdate,
    LessonStatusUpdate,
    LessonTableUpsert,
    TrackMetadataUpdate,
)
from app.schemas.lesson import LessonPreview
from app.schemas.lesson_content import LessonContent
from app.schemas.track import Track

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    dependencies=[Depends(require_admin_token)],
)


def lesson_to_response(lesson: LessonModel) -> dict:
    return {
        "slug": lesson.slug,
        "track_slug": lesson.track.slug,
        "order": lesson.order,
        "title": lesson.title,
        "status": lesson.status,
        "difficulty": lesson.difficulty,
        "estimated_time": lesson.estimated_time,
        "short_description": lesson.short_description,
        "has_content": lesson.content is not None,
    }


def track_to_response(track: TrackModel) -> dict:
    return {
        "slug": track.slug,
        "title": track.title,
        "description": track.description,
        "status": track.status,
        "lesson_count": track.lesson_count,
    }


def block_to_response(block: LessonBlockModel) -> dict:
    return {
        "id": block.id,
        "key": block.block_key,
        "type": block.type,
        "order": block.order,
        "data": block.data or {},
    }


def lesson_content_to_response(lesson_content: LessonContentModel) -> dict:
    return {
        "slug": lesson_content.lesson.slug,
        "title": lesson_content.title,
        "goal": lesson_content.goal,
        "image_prompts": lesson_content.image_prompts,
        "hero_visual": lesson_content.hero_visual,
        "completion_image_url": lesson_content.completion_image_url,
        "completion_image_alt": lesson_content.completion_image_alt,
        "completion_kicker": lesson_content.completion_kicker,
        "completion_title": lesson_content.completion_title,
        "completion_body": lesson_content.completion_body,
        "sections": [
            {
                "id": section.section_key,
                "type": section.type,
                "title": section.title,
                "paragraphs": section.paragraphs,
                "code": section.code,
                "output": section.output,
                "image_url": section.image_url,
                "image_alt": section.image_alt,
                "image_position": section.image_position,
                "items": [
                    {
                        "id": item.id,
                        "title": item.title,
                        "content": item.content,
                        "code": item.code,
                        "output": item.output,
                        "after_text": item.after_text,
                        "image_url": item.image_url,
                        "image_alt": item.image_alt,
                    }
                    for item in section.items
                ]
                if section.items
                else None,
                "table": {
                    "headers": section.table.headers,
                    "rows": section.table.rows,
                }
                if section.table
                else None,
                "blocks": [
                    block_to_response(block)
                    for block in section.blocks
                ]
                if section.blocks
                else None,
            }
            for section in lesson_content.sections
        ],
    }


def load_lesson_content_by_slug(
    db: Session,
    lesson_slug: str,
) -> LessonContentModel | None:
    return db.scalar(
        select(LessonContentModel)
        .join(LessonModel)
        .options(
            joinedload(LessonContentModel.lesson),
            selectinload(LessonContentModel.sections).selectinload(
                LessonSectionModel.items
            ),
            selectinload(LessonContentModel.sections).selectinload(
                LessonSectionModel.table
            ),
            selectinload(LessonContentModel.sections).selectinload(
                LessonSectionModel.blocks
            ),
        )
        .where(LessonModel.slug == lesson_slug)
    )


def get_section_or_404(
    lesson_content: LessonContentModel,
    section_key: str,
) -> LessonSectionModel:
    section = next(
        (
            current_section
            for current_section in lesson_content.sections
            if current_section.section_key == section_key
        ),
        None,
    )

    if not section:
        raise HTTPException(status_code=404, detail="Section not found")

    return section


def get_block_or_404(
    section: LessonSectionModel,
    block_id: int,
) -> LessonBlockModel:
    block = next(
        (
            current_block
            for current_block in section.blocks
            if current_block.id == block_id
        ),
        None,
    )

    if not block:
        raise HTTPException(status_code=404, detail="Block not found")

    return block


def normalize_block_order(
    section: LessonSectionModel,
    excluded_block_id: int | None = None,
) -> None:
    remaining_blocks = [
        block
        for block in section.blocks
        if excluded_block_id is None or block.id != excluded_block_id
    ]

    sorted_blocks = sorted(remaining_blocks, key=lambda block: block.order)

    for index, block in enumerate(sorted_blocks, start=1):
        block.order = index


SECTION_TYPE_BY_TITLE = {
    "tasty metaphor": "metaphor",
    "short theory": "theory",
    "main code example": "code_example",
    "interview spot": "interview",
    "trap zone": "trap_zone",
    "practice": "practice",
    "say it like in an interview": "interview",
    "final cheat sheet": "cheat_sheet",
    "answer key": "answer_key",
}

TOP_LEVEL_SECTION_TITLES = set(SECTION_TYPE_BY_TITLE.keys())


def slugify_heading(value: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9]+", "-", value.lower()).strip("-")
    return cleaned or "section"


def strip_markdown_markup(value: str) -> str:
    value = value.strip()
    value = value.removeprefix("> ").strip()
    value = value.replace("**", "")
    value = value.replace("__", "")
    value = value.replace("`", "")
    return value.strip()


def get_section_type(title: str) -> str:
    normalized_title = strip_markdown_markup(title).lower()

    if normalized_title in SECTION_TYPE_BY_TITLE:
        return SECTION_TYPE_BY_TITLE[normalized_title]

    if "metaphor" in normalized_title:
        return "metaphor"

    if "theory" in normalized_title:
        return "theory"

    if "code" in normalized_title and "example" in normalized_title:
        return "code_example"

    if "interview" in normalized_title:
        return "interview"

    if "trap" in normalized_title:
        return "trap_zone"

    if "practice" in normalized_title:
        return "practice"

    if "cheat" in normalized_title:
        return "cheat_sheet"

    if "answer" in normalized_title and "key" in normalized_title:
        return "answer_key"

    return "theory"


def parse_heading(line: str) -> tuple[int, str] | None:
    cleaned_line = line.lstrip("\ufeff").strip()
    match = re.match(r"^(#{1,6})\s+(.+?)\s*$", cleaned_line)

    if not match:
        return None

    return len(match.group(1)), strip_markdown_markup(match.group(2))


def split_table_row(line: str) -> list[str]:
    return [
        strip_markdown_markup(cell)
        for cell in line.strip().strip("|").split("|")
    ]


def is_table_separator(line: str) -> bool:
    cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
    return bool(cells) and all(re.fullmatch(r":?-{3,}:?", cell) for cell in cells)


def collect_lesson_image_prompts(lines: list[str]) -> tuple[list[str], set[int]]:
    image_prompts: list[str] = []
    skipped_line_indexes: set[int] = set()
    is_inside_code_fence = False

    for index, line in enumerate(lines):
        if line.strip().startswith("```"):
            is_inside_code_fence = not is_inside_code_fence
            continue

        if is_inside_code_fence or "[Picture insert" not in line:
            continue

        skipped_line_indexes.add(index)

        for prompt_index in range(index + 1, len(lines)):
            prompt_line = lines[prompt_index]

            if prompt_line.strip().startswith("```"):
                break

            if not prompt_line.strip():
                skipped_line_indexes.add(prompt_index)
                continue

            image_prompts.append(strip_markdown_markup(prompt_line))
            skipped_line_indexes.add(prompt_index)
            break

    return image_prompts, skipped_line_indexes


def extract_lesson_title(lines: list[str]) -> str:
    is_inside_code_fence = False

    for line in lines:
        if line.strip().startswith("```"):
            is_inside_code_fence = not is_inside_code_fence
            continue

        if is_inside_code_fence:
            continue

        heading = parse_heading(line)

        if heading and heading[0] == 1:
            return heading[1]

    return "Untitled lesson"


def extract_lesson_goal(lines: list[str]) -> str:
    is_inside_code_fence = False

    for index, line in enumerate(lines):
        if line.strip().startswith("```"):
            is_inside_code_fence = not is_inside_code_fence
            continue

        if is_inside_code_fence:
            continue

        normalized_line = strip_markdown_markup(line)
        lower_line = normalized_line.lower()

        if not lower_line.startswith("lesson goal:"):
            continue

        same_line_goal = normalized_line.split(":", 1)[1].strip()

        if same_line_goal:
            return same_line_goal

        goal_lines: list[str] = []
        nested_code_fence = False

        for next_line in lines[index + 1 :]:
            if next_line.strip().startswith("```"):
                nested_code_fence = not nested_code_fence
                continue

            if nested_code_fence:
                continue

            stripped_next_line = next_line.strip()

            if not stripped_next_line:
                if goal_lines:
                    break
                continue

            if stripped_next_line.startswith("**[") or parse_heading(
                stripped_next_line
            ):
                break

            goal_lines.append(strip_markdown_markup(stripped_next_line))

        return " ".join(goal_lines).strip()

    return ""


def should_start_new_lesson_section(
    level: int,
    title: str,
    current_section_type: str | None,
) -> bool:
    normalized_title = title.lower()

    if normalized_title in TOP_LEVEL_SECTION_TITLES:
        return True

    if level == 1:
        return False

    if current_section_type in {"practice", "answer_key"}:
        return False

    return level == 2


def split_lesson_sections(
    lines: list[str],
    skipped_line_indexes: set[int],
) -> list[dict]:
    sections: list[dict] = []
    current_section: dict | None = None
    is_inside_code_fence = False

    for index, line in enumerate(lines):
        if index in skipped_line_indexes:
            continue

        if line.strip().startswith("```"):
            is_inside_code_fence = not is_inside_code_fence

            if current_section:
                current_section["lines"].append(line)

            continue

        if not is_inside_code_fence:
            heading = parse_heading(line)

            if heading:
                level, title = heading
                current_section_type = (
                    current_section["type"] if current_section else None
                )

                if should_start_new_lesson_section(
                    level,
                    title,
                    current_section_type,
                ):
                    if current_section:
                        sections.append(current_section)

                    current_section = {
                        "title": title,
                        "type": get_section_type(title),
                        "lines": [],
                    }
                    continue

                if current_section:
                    current_section["lines"].append(line)

                continue

        if current_section:
            current_section["lines"].append(line)

    if current_section:
        sections.append(current_section)

    return sections


def flush_paragraph_buffer(
    paragraphs: list[str],
    paragraph_buffer: list[str],
) -> None:
    if not paragraph_buffer:
        return

    paragraph = "\n".join(paragraph_buffer).strip()

    if paragraph:
        paragraphs.append(paragraph)

    paragraph_buffer.clear()


def parse_block_lines(lines: list[str]) -> dict:
    paragraphs: list[str] = []
    code_blocks: list[str] = []
    output_blocks: list[str] = []
    table: dict | None = None
    paragraph_buffer: list[str] = []

    index = 0

    while index < len(lines):
        raw_line = lines[index]
        line = raw_line.strip()

        if not line:
            flush_paragraph_buffer(paragraphs, paragraph_buffer)
            index += 1
            continue

        if line.startswith("```"):
            flush_paragraph_buffer(paragraphs, paragraph_buffer)

            code_lines: list[str] = []
            index += 1

            while index < len(lines) and not lines[index].strip().startswith(
                "```"
            ):
                code_lines.append(lines[index].rstrip())
                index += 1

            if index < len(lines):
                index += 1

            code_value = "\n".join(code_lines).strip("\n")
            previous_paragraph = paragraphs[-1].lower() if paragraphs else ""
            is_output_block = previous_paragraph in {
                "output:",
                "expected output:",
                "output",
                "expected output",
            }

            if is_output_block:
                paragraphs.pop()
                output_blocks.append(code_value)
            else:
                code_blocks.append(code_value)

            continue

        if (
            line.startswith("|")
            and index + 1 < len(lines)
            and is_table_separator(lines[index + 1])
        ):
            flush_paragraph_buffer(paragraphs, paragraph_buffer)

            headers = split_table_row(line)
            rows: list[list[str]] = []
            index += 2

            while index < len(lines) and lines[index].strip().startswith("|"):
                rows.append(split_table_row(lines[index]))
                index += 1

            table = {"headers": headers, "rows": rows}
            continue

        cleaned_line = strip_markdown_markup(raw_line)

        if cleaned_line and not re.fullmatch(r"-{3,}", cleaned_line):
            paragraph_buffer.append(cleaned_line)

        index += 1

    flush_paragraph_buffer(paragraphs, paragraph_buffer)

    return {
        "paragraphs": paragraphs,
        "code": "\n\n".join(block for block in code_blocks if block) or None,
        "output": "\n\n".join(block for block in output_blocks if block) or None,
        "table": table,
    }


def is_item_heading(line: str, section_type: str) -> bool:
    heading = parse_heading(line)

    if not heading:
        return False

    level, _title = heading

    if level == 3:
        return True

    return level == 2 and section_type in {"practice", "answer_key"}


def parse_lesson_section(raw_section: dict, existing_keys: set[str]) -> dict:
    section_type = raw_section["type"]
    section_lines = raw_section["lines"]
    leading_lines: list[str] = []
    item_groups: list[dict] = []
    current_item: dict | None = None

    for line in section_lines:
        if is_item_heading(line, section_type):
            if current_item:
                item_groups.append(current_item)

            heading = parse_heading(line)
            current_item = {
                "title": heading[1] if heading else "Untitled item",
                "lines": [],
            }
            continue

        if current_item:
            current_item["lines"].append(line)
        else:
            leading_lines.append(line)

    if current_item:
        item_groups.append(current_item)

    section_block = parse_block_lines(leading_lines)
    item_data: list[dict] = []

    for item_group in item_groups:
        item_block = parse_block_lines(item_group["lines"])
        item_content = "\n\n".join(item_block["paragraphs"]).strip()

        if not item_content and item_block["code"]:
            item_content = "Code example"
        elif not item_content and item_block["output"]:
            item_content = "Output"

        item_data.append(
            {
                "title": item_group["title"],
                "content": item_content or "Untitled content",
                "code": item_block["code"],
                "output": item_block["output"],
                "after_text": None,
                "image_url": None,
                "image_alt": None,
            }
        )

    section_key_base = slugify_heading(raw_section["title"])
    section_key = section_key_base
    duplicate_count = 2

    while section_key in existing_keys:
        section_key = f"{section_key_base}-{duplicate_count}"
        duplicate_count += 1

    existing_keys.add(section_key)

    return {
        "section_key": section_key,
        "type": section_type,
        "title": raw_section["title"],
        "paragraphs": section_block["paragraphs"],
        "code": section_block["code"],
        "output": section_block["output"],
        "image_url": None,
        "image_alt": None,
        "image_position": None,
        "table": section_block["table"],
        "items": item_data,
    }


def parse_lesson_markdown(markdown: str) -> dict:
    lines = markdown.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    image_prompts, skipped_line_indexes = collect_lesson_image_prompts(lines)
    raw_sections = split_lesson_sections(lines, skipped_line_indexes)
    existing_keys: set[str] = set()

    return {
        "title": extract_lesson_title(lines),
        "goal": extract_lesson_goal(lines),
        "image_prompts": image_prompts,
        "sections": [
            parse_lesson_section(raw_section, existing_keys)
            for raw_section in raw_sections
        ],
    }


@router.patch(
    "/lessons/{lesson_slug}/status",
    response_model=LessonPreview,
)
def update_lesson_status(
    lesson_slug: str,
    payload: LessonStatusUpdate,
    db: Session = Depends(get_db),
):
    lesson = db.scalar(
        select(LessonModel)
        .options(
            joinedload(LessonModel.track),
            joinedload(LessonModel.content),
        )
        .where(LessonModel.slug == lesson_slug)
    )

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    lesson.status = payload.status

    db.commit()
    db.refresh(lesson)

    return lesson_to_response(lesson)


@router.patch(
    "/lessons/{lesson_slug}/metadata",
    response_model=LessonPreview,
)
def update_lesson_metadata(
    lesson_slug: str,
    payload: LessonMetadataUpdate,
    db: Session = Depends(get_db),
):
    lesson = db.scalar(
        select(LessonModel)
        .options(
            joinedload(LessonModel.track),
            joinedload(LessonModel.content),
        )
        .where(LessonModel.slug == lesson_slug)
    )

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    lesson.title = payload.title
    lesson.short_description = payload.short_description
    lesson.difficulty = payload.difficulty
    lesson.estimated_time = payload.estimated_time
    lesson.order = payload.order

    db.commit()
    db.refresh(lesson)

    return lesson_to_response(lesson)


@router.put(
    "/lessons/{lesson_slug}/content-basics",
    response_model=LessonContent,
)
def upsert_lesson_content_basics(
    lesson_slug: str,
    payload: LessonContentBasicsUpdate,
    db: Session = Depends(get_db),
):
    lesson = db.scalar(
        select(LessonModel)
        .options(joinedload(LessonModel.content))
        .where(LessonModel.slug == lesson_slug)
    )

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    if lesson.content:
        lesson_content = lesson.content
    else:
        lesson_content = LessonContentModel(
            lesson_id=lesson.id,
            title=payload.title,
            goal=payload.goal,
            image_prompts=payload.image_prompts,
            hero_visual=jsonable_encoder(payload.hero_visual)
            if payload.hero_visual
            else None,
            completion_image_url=payload.completion_image_url,
            completion_image_alt=payload.completion_image_alt,
            completion_kicker=payload.completion_kicker,
            completion_title=payload.completion_title,
            completion_body=payload.completion_body,
        )
        db.add(lesson_content)
        db.flush()

    lesson_content.title = payload.title
    lesson_content.goal = payload.goal
    lesson_content.image_prompts = payload.image_prompts
    lesson_content.hero_visual = (
        jsonable_encoder(payload.hero_visual) if payload.hero_visual else None
    )
    lesson_content.completion_image_url = payload.completion_image_url
    lesson_content.completion_image_alt = payload.completion_image_alt
    lesson_content.completion_kicker = payload.completion_kicker
    lesson_content.completion_title = payload.completion_title
    lesson_content.completion_body = payload.completion_body

    db.commit()

    saved_content = load_lesson_content_by_slug(db, lesson_slug)

    if not saved_content:
        raise HTTPException(status_code=404, detail="Lesson content not found")

    return lesson_content_to_response(saved_content)


@router.post(
    "/lessons/{lesson_slug}/import-markdown",
    response_model=LessonContent,
)
def import_lesson_markdown(
    lesson_slug: str,
    payload: LessonMarkdownImport,
    db: Session = Depends(get_db),
):
    if not payload.markdown.strip():
        raise HTTPException(status_code=400, detail="Markdown content is empty")

    parsed_lesson = parse_lesson_markdown(payload.markdown)

    lesson = db.scalar(
        select(LessonModel)
        .options(
            joinedload(LessonModel.content).selectinload(
                LessonContentModel.sections
            )
        )
        .where(LessonModel.slug == lesson_slug)
    )

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    if lesson.content:
        lesson_content = lesson.content

        for section in list(lesson_content.sections):
            db.delete(section)

        db.flush()
    else:
        lesson_content = LessonContentModel(
            lesson_id=lesson.id,
            title=parsed_lesson["title"],
            goal=parsed_lesson["goal"],
            image_prompts=parsed_lesson["image_prompts"],
        )
        db.add(lesson_content)
        db.flush()

    lesson_content.title = parsed_lesson["title"]
    lesson_content.goal = parsed_lesson["goal"]
    lesson_content.image_prompts = parsed_lesson["image_prompts"]

    for section_order, section_data in enumerate(
        parsed_lesson["sections"],
        start=1,
    ):
        section = LessonSectionModel(
            lesson_content_id=lesson_content.id,
            section_key=section_data["section_key"],
            type=section_data["type"],
            title=section_data["title"],
            order=section_order,
            paragraphs=section_data["paragraphs"],
            code=section_data["code"],
            output=section_data["output"],
            image_url=section_data["image_url"],
            image_alt=section_data["image_alt"],
            image_position=section_data["image_position"],
        )
        db.add(section)
        db.flush()

        for item_order, item_data in enumerate(section_data["items"], start=1):
            item = LessonItemModel(
                section_id=section.id,
                order=item_order,
                title=item_data["title"],
                content=item_data["content"],
                code=item_data["code"],
                output=item_data["output"],
                after_text=item_data["after_text"],
                image_url=item_data["image_url"],
                image_alt=item_data["image_alt"],
            )
            db.add(item)

        table_data = section_data["table"]

        if table_data:
            table = LessonTableModel(
                section_id=section.id,
                headers=table_data["headers"],
                rows=table_data["rows"],
            )
            db.add(table)

    db.commit()

    saved_content = load_lesson_content_by_slug(db, lesson_slug)

    if not saved_content:
        raise HTTPException(status_code=404, detail="Lesson content not found")

    return lesson_content_to_response(saved_content)


@router.post(
    "/lessons/{lesson_slug}/sections",
    response_model=LessonContent,
)
def create_lesson_section(
    lesson_slug: str,
    payload: LessonSectionCreate,
    db: Session = Depends(get_db),
):
    lesson = db.scalar(
        select(LessonModel)
        .options(
            joinedload(LessonModel.content).selectinload(
                LessonContentModel.sections
            )
        )
        .where(LessonModel.slug == lesson_slug)
    )

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    if not lesson.content:
        raise HTTPException(
            status_code=400,
            detail="Create lesson content basics before adding sections",
        )

    current_sections = lesson.content.sections
    next_order = max(
        (section.order for section in current_sections),
        default=0,
    ) + 1

    section = LessonSectionModel(
        lesson_content_id=lesson.content.id,
        section_key=f"{payload.type}-{next_order}",
        type=payload.type,
        title=payload.title,
        order=next_order,
        paragraphs=payload.paragraphs,
        code=payload.code,
        output=payload.output,
        image_url=payload.image_url,
        image_alt=payload.image_alt,
        image_position=payload.image_position,
    )

    db.add(section)
    db.commit()

    saved_content = load_lesson_content_by_slug(db, lesson_slug)

    if not saved_content:
        raise HTTPException(status_code=404, detail="Lesson content not found")

    return lesson_content_to_response(saved_content)


@router.put(
    "/lessons/{lesson_slug}/sections/{section_key}",
    response_model=LessonContent,
)
def update_lesson_section(
    lesson_slug: str,
    section_key: str,
    payload: LessonSectionUpdate,
    db: Session = Depends(get_db),
):
    lesson_content = load_lesson_content_by_slug(db, lesson_slug)

    if not lesson_content:
        raise HTTPException(status_code=404, detail="Lesson content not found")

    section = get_section_or_404(lesson_content, section_key)

    section.type = payload.type
    section.title = payload.title
    section.paragraphs = payload.paragraphs
    section.code = payload.code
    section.output = payload.output
    section.image_url = payload.image_url
    section.image_alt = payload.image_alt
    section.image_position = payload.image_position

    db.commit()

    saved_content = load_lesson_content_by_slug(db, lesson_slug)

    if not saved_content:
        raise HTTPException(status_code=404, detail="Lesson content not found")

    return lesson_content_to_response(saved_content)


@router.delete(
    "/lessons/{lesson_slug}/sections/{section_key}",
    response_model=LessonContent,
)
def delete_lesson_section(
    lesson_slug: str,
    section_key: str,
    db: Session = Depends(get_db),
):
    lesson_content = load_lesson_content_by_slug(db, lesson_slug)

    if not lesson_content:
        raise HTTPException(status_code=404, detail="Lesson content not found")

    section = get_section_or_404(lesson_content, section_key)

    db.delete(section)
    db.commit()

    saved_content = load_lesson_content_by_slug(db, lesson_slug)

    if not saved_content:
        raise HTTPException(status_code=404, detail="Lesson content not found")

    return lesson_content_to_response(saved_content)


@router.post(
    "/lessons/{lesson_slug}/sections/{section_key}/blocks",
    response_model=LessonContent,
)
def create_lesson_section_block(
    lesson_slug: str,
    section_key: str,
    payload: LessonBlockCreate,
    db: Session = Depends(get_db),
):
    lesson_content = load_lesson_content_by_slug(db, lesson_slug)

    if not lesson_content:
        raise HTTPException(status_code=404, detail="Lesson content not found")

    section = get_section_or_404(lesson_content, section_key)

    next_order = max((block.order for block in section.blocks), default=0) + 1

    block = LessonBlockModel(
        section_id=section.id,
        block_key=f"{payload.type}-{next_order}",
        type=payload.type,
        order=next_order,
        data=jsonable_encoder(payload.data),
    )

    db.add(block)
    db.commit()

    saved_content = load_lesson_content_by_slug(db, lesson_slug)

    if not saved_content:
        raise HTTPException(status_code=404, detail="Lesson content not found")

    return lesson_content_to_response(saved_content)


@router.put(
    "/lessons/{lesson_slug}/sections/{section_key}/blocks/reorder",
    response_model=LessonContent,
)
def reorder_lesson_section_blocks(
    lesson_slug: str,
    section_key: str,
    payload: LessonBlockReorder,
    db: Session = Depends(get_db),
):
    lesson_content = load_lesson_content_by_slug(db, lesson_slug)

    if not lesson_content:
        raise HTTPException(status_code=404, detail="Lesson content not found")

    section = get_section_or_404(lesson_content, section_key)

    existing_blocks_by_id = {block.id: block for block in section.blocks}
    existing_block_ids = set(existing_blocks_by_id.keys())
    incoming_block_ids = set(payload.block_ids)

    if incoming_block_ids != existing_block_ids:
        raise HTTPException(
            status_code=400,
            detail="Reorder payload must include every block in this section",
        )

    for index, block_id in enumerate(payload.block_ids, start=1):
        existing_blocks_by_id[block_id].order = index

    db.commit()

    saved_content = load_lesson_content_by_slug(db, lesson_slug)

    if not saved_content:
        raise HTTPException(status_code=404, detail="Lesson content not found")

    return lesson_content_to_response(saved_content)


@router.put(
    "/lessons/{lesson_slug}/sections/{section_key}/blocks/{block_id}",
    response_model=LessonContent,
)
def update_lesson_section_block(
    lesson_slug: str,
    section_key: str,
    block_id: int,
    payload: LessonBlockUpdate,
    db: Session = Depends(get_db),
):
    lesson_content = load_lesson_content_by_slug(db, lesson_slug)

    if not lesson_content:
        raise HTTPException(status_code=404, detail="Lesson content not found")

    section = get_section_or_404(lesson_content, section_key)
    block = get_block_or_404(section, block_id)

    block.type = payload.type
    block.data = jsonable_encoder(payload.data)

    db.commit()

    saved_content = load_lesson_content_by_slug(db, lesson_slug)

    if not saved_content:
        raise HTTPException(status_code=404, detail="Lesson content not found")

    return lesson_content_to_response(saved_content)


@router.delete(
    "/lessons/{lesson_slug}/sections/{section_key}/blocks/{block_id}",
    response_model=LessonContent,
)
def delete_lesson_section_block(
    lesson_slug: str,
    section_key: str,
    block_id: int,
    db: Session = Depends(get_db),
):
    lesson_content = load_lesson_content_by_slug(db, lesson_slug)

    if not lesson_content:
        raise HTTPException(status_code=404, detail="Lesson content not found")

    section = get_section_or_404(lesson_content, section_key)
    block = get_block_or_404(section, block_id)

    db.delete(block)
    db.flush()

    normalize_block_order(section, excluded_block_id=block_id)

    db.commit()

    saved_content = load_lesson_content_by_slug(db, lesson_slug)

    if not saved_content:
        raise HTTPException(status_code=404, detail="Lesson content not found")

    return lesson_content_to_response(saved_content)


@router.post(
    "/lessons/{lesson_slug}/sections/{section_key}/blocks/{block_id}/duplicate",
    response_model=LessonContent,
)
def duplicate_lesson_section_block(
    lesson_slug: str,
    section_key: str,
    block_id: int,
    db: Session = Depends(get_db),
):
    lesson_content = load_lesson_content_by_slug(db, lesson_slug)

    if not lesson_content:
        raise HTTPException(status_code=404, detail="Lesson content not found")

    section = get_section_or_404(lesson_content, section_key)
    source_block = get_block_or_404(section, block_id)

    for block in section.blocks:
        if block.order > source_block.order:
            block.order += 1

    duplicated_block = LessonBlockModel(
        section_id=section.id,
        block_key=f"{source_block.type}-{source_block.order + 1}-copy",
        type=source_block.type,
        order=source_block.order + 1,
        data=copy.deepcopy(source_block.data or {}),
    )

    db.add(duplicated_block)
    db.commit()

    saved_content = load_lesson_content_by_slug(db, lesson_slug)

    if not saved_content:
        raise HTTPException(status_code=404, detail="Lesson content not found")

    return lesson_content_to_response(saved_content)


@router.post(
    "/lessons/{lesson_slug}/sections/{section_key}/items",
    response_model=LessonContent,
)
def create_lesson_section_item(
    lesson_slug: str,
    section_key: str,
    payload: LessonItemCreate,
    db: Session = Depends(get_db),
):
    lesson_content = load_lesson_content_by_slug(db, lesson_slug)

    if not lesson_content:
        raise HTTPException(status_code=404, detail="Lesson content not found")

    section = get_section_or_404(lesson_content, section_key)

    next_order = max((item.order for item in section.items), default=0) + 1

    item = LessonItemModel(
        section_id=section.id,
        order=next_order,
        title=payload.title,
        content=payload.content,
        code=payload.code,
        output=payload.output,
        after_text=payload.after_text,
        image_url=payload.image_url,
        image_alt=payload.image_alt,
    )

    db.add(item)
    db.commit()

    saved_content = load_lesson_content_by_slug(db, lesson_slug)

    if not saved_content:
        raise HTTPException(status_code=404, detail="Lesson content not found")

    return lesson_content_to_response(saved_content)


@router.put(
    "/lessons/{lesson_slug}/sections/{section_key}/items/{item_id}",
    response_model=LessonContent,
)
def update_lesson_section_item(
    lesson_slug: str,
    section_key: str,
    item_id: int,
    payload: LessonItemUpdate,
    db: Session = Depends(get_db),
):
    lesson_content = load_lesson_content_by_slug(db, lesson_slug)

    if not lesson_content:
        raise HTTPException(status_code=404, detail="Lesson content not found")

    section = get_section_or_404(lesson_content, section_key)

    item = next(
        (
            current_item
            for current_item in section.items
            if current_item.id == item_id
        ),
        None,
    )

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    item.title = payload.title
    item.content = payload.content
    item.code = payload.code
    item.output = payload.output
    item.after_text = payload.after_text
    item.image_url = payload.image_url
    item.image_alt = payload.image_alt

    db.commit()

    saved_content = load_lesson_content_by_slug(db, lesson_slug)

    if not saved_content:
        raise HTTPException(status_code=404, detail="Lesson content not found")

    return lesson_content_to_response(saved_content)


@router.delete(
    "/lessons/{lesson_slug}/sections/{section_key}/items/{item_id}",
    response_model=LessonContent,
)
def delete_lesson_section_item(
    lesson_slug: str,
    section_key: str,
    item_id: int,
    db: Session = Depends(get_db),
):
    lesson_content = load_lesson_content_by_slug(db, lesson_slug)

    if not lesson_content:
        raise HTTPException(status_code=404, detail="Lesson content not found")

    section = get_section_or_404(lesson_content, section_key)

    item = next(
        (
            current_item
            for current_item in section.items
            if current_item.id == item_id
        ),
        None,
    )

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(item)
    db.commit()

    saved_content = load_lesson_content_by_slug(db, lesson_slug)

    if not saved_content:
        raise HTTPException(status_code=404, detail="Lesson content not found")

    return lesson_content_to_response(saved_content)


@router.put(
    "/lessons/{lesson_slug}/sections/{section_key}/table",
    response_model=LessonContent,
)
def upsert_lesson_section_table(
    lesson_slug: str,
    section_key: str,
    payload: LessonTableUpsert,
    db: Session = Depends(get_db),
):
    lesson_content = load_lesson_content_by_slug(db, lesson_slug)

    if not lesson_content:
        raise HTTPException(status_code=404, detail="Lesson content not found")

    section = get_section_or_404(lesson_content, section_key)

    if section.table:
        section.table.headers = payload.headers
        section.table.rows = payload.rows
    else:
        table = LessonTableModel(
            section_id=section.id,
            headers=payload.headers,
            rows=payload.rows,
        )
        db.add(table)

    db.commit()

    saved_content = load_lesson_content_by_slug(db, lesson_slug)

    if not saved_content:
        raise HTTPException(status_code=404, detail="Lesson content not found")

    return lesson_content_to_response(saved_content)


@router.patch(
    "/tracks/{track_slug}/metadata",
    response_model=Track,
)
def update_track_metadata(
    track_slug: str,
    payload: TrackMetadataUpdate,
    db: Session = Depends(get_db),
):
    track = db.scalar(select(TrackModel).where(TrackModel.slug == track_slug))

    if not track:
        raise HTTPException(status_code=404, detail="Track not found")

    track.title = payload.title
    track.description = payload.description
    track.status = payload.status
    track.lesson_count = payload.lesson_count

    db.commit()
    db.refresh(track)

    return track_to_response(track)