import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  createLessonSectionBlock,
  deleteLessonSectionBlock,
  duplicateLessonSectionBlock,
  reorderLessonSectionBlocks,
  updateLessonSectionBlock,
} from "../../api/adminApi";
import type { LessonContent } from "../../types/lesson";
import type {
  CalloutTone,
  LessonBlock,
  LessonBlockType,
  PracticeOption,
} from "../../types/lessonBlock";

interface AdminLessonBlockEditorProps {
  lessonSlug: string;
  lessonContent: LessonContent;
  onLessonContentChange: (lessonContent: LessonContent) => void;
}

type BlockFormState = Record<string, string>;

const blockTypeOptions: LessonBlockType[] = [
  "rich_text",
  "code",
  "callout",
  "image",
  "table",
  "practice_single",
  "practice_multi",
  "practice_code",
  "accordion",
];

const calloutToneOptions: CalloutTone[] = [
  "info",
  "success",
  "warning",
  "danger",
];

function getBlockSortableId(block: LessonBlock) {
  return block.id ?? block.key;
}

function sortBlocks(blocks?: LessonBlock[]) {
  return [...(blocks ?? [])].sort(
    (firstBlock, secondBlock) => firstBlock.order - secondBlock.order
  );
}

function getStringValue(data: Record<string, unknown>, key: string) {
  const value = data[key];

  return typeof value === "string" ? value : "";
}

function getStringArrayValue(data: Record<string, unknown>, key: string) {
  const value = data[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item));
}

function getOptionsValue(data: Record<string, unknown>) {
  const value = data.options;

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (
        item &&
        typeof item === "object" &&
        "key" in item &&
        "text" in item
      ) {
        return {
          key: String(item.key),
          text: String(item.text),
        };
      }

      return null;
    })
    .filter(Boolean) as PracticeOption[];
}

function getTableRowsValue(data: Record<string, unknown>) {
  const value = data.rows;

  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((row) =>
    Array.isArray(row) ? row.map((cell) => String(cell)) : []
  );
}

function formatOptions(options: PracticeOption[]) {
  return options.map((option) => `${option.key} | ${option.text}`).join("\n");
}

function parseOptionsText(value: string): PracticeOption[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const pipeParts = line.split("|");

      if (pipeParts.length >= 2) {
        return {
          key: pipeParts[0].trim().toUpperCase(),
          text: pipeParts.slice(1).join("|").trim(),
        };
      }

      const optionMatch = line.match(/^([A-Z])[\).\s-]+(.+)$/i);

      if (optionMatch) {
        return {
          key: optionMatch[1].toUpperCase(),
          text: optionMatch[2].trim(),
        };
      }

      return {
        key: String.fromCharCode(65 + index),
        text: line,
      };
    });
}

function parseListText(value: string) {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseTableRowsText(value: string) {
  return value
    .split("\n")
    .map((row) =>
      row
        .split("|")
        .map((cell) => cell.trim())
        .filter(Boolean)
    )
    .filter((row) => row.length > 0);
}

function getDefaultBlockData(type: LessonBlockType): Record<string, unknown> {
  switch (type) {
    case "rich_text":
      return {
        markdown: "",
      };

    case "code":
      return {
        language: "python",
        title: "",
        code: "",
      };

    case "callout":
      return {
        tone: "info",
        title: "",
        markdown: "",
        codeLanguage: "python",
        codeTitle: "",
        code: "",
        afterMarkdown: "",
      };

    case "image":
      return {
        imageUrl: "",
        imageAlt: "",
        caption: "",
      };

    case "table":
      return {
        headers: [],
        rows: [],
      };

    case "practice_single":
      return {
        question: "",
        code: "",
        options: [],
        correctAnswer: "",
        explanation: "",
      };

    case "practice_multi":
      return {
        question: "",
        code: "",
        options: [],
        correctAnswers: [],
        explanation: "",
      };

    case "practice_code":
      return {
        task: "",
        starterCode: "",
        expectedOutput: "",
        explanation: "",
      };

    case "accordion":
      return {
        title: "",
        markdown: "",
      };

    default:
      return {};
  }
}

function getFormFromBlock(block: LessonBlock): BlockFormState {
  const data = block.data ?? {};

  switch (block.type) {
    case "rich_text":
      return {
        markdown: getStringValue(data, "markdown"),
      };

    case "code":
      return {
        language: getStringValue(data, "language") || "python",
        title: getStringValue(data, "title"),
        code: getStringValue(data, "code"),
      };

    case "callout":
      return {
        tone: getStringValue(data, "tone") || "info",
        title: getStringValue(data, "title"),
        markdown: getStringValue(data, "markdown"),
        codeLanguage: getStringValue(data, "codeLanguage") || "python",
        codeTitle: getStringValue(data, "codeTitle"),
        code: getStringValue(data, "code"),
        afterMarkdown: getStringValue(data, "afterMarkdown"),
      };

    case "image":
      return {
        imageUrl: getStringValue(data, "imageUrl"),
        imageAlt: getStringValue(data, "imageAlt"),
        caption: getStringValue(data, "caption"),
      };

    case "table":
      return {
        headersText: getStringArrayValue(data, "headers").join(" | "),
        rowsText: getTableRowsValue(data)
          .map((row) => row.join(" | "))
          .join("\n"),
      };

    case "practice_single":
      return {
        question: getStringValue(data, "question"),
        code: getStringValue(data, "code"),
        optionsText: formatOptions(getOptionsValue(data)),
        correctAnswer: getStringValue(data, "correctAnswer"),
        explanation: getStringValue(data, "explanation"),
      };

    case "practice_multi":
      return {
        question: getStringValue(data, "question"),
        code: getStringValue(data, "code"),
        optionsText: formatOptions(getOptionsValue(data)),
        correctAnswersText: getStringArrayValue(data, "correctAnswers").join(
          ", "
        ),
        explanation: getStringValue(data, "explanation"),
      };

    case "practice_code":
      return {
        task: getStringValue(data, "task"),
        starterCode: getStringValue(data, "starterCode"),
        expectedOutput: getStringValue(data, "expectedOutput"),
        explanation: getStringValue(data, "explanation"),
      };

    case "accordion":
      return {
        title: getStringValue(data, "title"),
        markdown: getStringValue(data, "markdown"),
      };

    default:
      return {};
  }
}

function buildBlockData(
  type: LessonBlockType,
  form: BlockFormState
): Record<string, unknown> {
  switch (type) {
    case "rich_text":
      return {
        markdown: form.markdown ?? "",
      };

    case "code":
      return {
        language: form.language || "python",
        title: form.title ?? "",
        code: form.code ?? "",
      };

    case "callout":
      return {
        tone: form.tone || "info",
        title: form.title ?? "",
        markdown: form.markdown ?? "",
        codeLanguage: form.codeLanguage || "python",
        codeTitle: form.codeTitle ?? "",
        code: form.code ?? "",
        afterMarkdown: form.afterMarkdown ?? "",
      };

    case "image":
      return {
        imageUrl: form.imageUrl ?? "",
        imageAlt: form.imageAlt ?? "",
        caption: form.caption ?? "",
      };

    case "table":
      return {
        headers: (form.headersText ?? "")
          .split("|")
          .map((header) => header.trim())
          .filter(Boolean),
        rows: parseTableRowsText(form.rowsText ?? ""),
      };

    case "practice_single":
      return {
        question: form.question ?? "",
        code: form.code ?? "",
        options: parseOptionsText(form.optionsText ?? ""),
        correctAnswer: (form.correctAnswer ?? "").trim().toUpperCase(),
        explanation: form.explanation ?? "",
      };

    case "practice_multi":
      return {
        question: form.question ?? "",
        code: form.code ?? "",
        options: parseOptionsText(form.optionsText ?? ""),
        correctAnswers: parseListText(form.correctAnswersText ?? "").map(
          (answer) => answer.toUpperCase()
        ),
        explanation: form.explanation ?? "",
      };

    case "practice_code":
      return {
        task: form.task ?? "",
        starterCode: form.starterCode ?? "",
        expectedOutput: form.expectedOutput ?? "",
        explanation: form.explanation ?? "",
      };

    case "accordion":
      return {
        title: form.title ?? "",
        markdown: form.markdown ?? "",
      };

    default:
      return {};
  }
}

interface SortableBlockCardProps {
  lessonSlug: string;
  sectionKey: string;
  block: LessonBlock;
  onLessonContentChange: (lessonContent: LessonContent) => void;
}

function SortableBlockCard({
  lessonSlug,
  sectionKey,
  block,
  onLessonContentChange,
}: SortableBlockCardProps) {
  const sortable = useSortable({
    id: getBlockSortableId(block),
  });

  const [blockType, setBlockType] = useState<LessonBlockType>(block.type);
  const [form, setForm] = useState<BlockFormState>(() => getFormFromBlock(block));
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  useEffect(() => {
    setBlockType(block.type);
    setForm(getFormFromBlock(block));
  }, [block.id, block.type, block.data]);

  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    opacity: sortable.isDragging ? 0.55 : 1,
  };

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextType = event.target.value as LessonBlockType;

    setBlockType(nextType);
    setForm(
      getFormFromBlock({
        ...block,
        type: nextType,
        data: getDefaultBlockData(nextType),
      })
    );
  }

  async function handleSave() {
    if (!block.id) {
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const updatedContent = await updateLessonSectionBlock(
        lessonSlug,
        sectionKey,
        block.id,
        {
          type: blockType,
          data: buildBlockData(blockType, form),
        }
      );

      onLessonContentChange(updatedContent);
      setMessage("Saved.");
    } catch {
      setMessage("Could not save block.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!block.id) {
      return;
    }

    const confirmed = window.confirm("Delete this block?");

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setMessage("");

    try {
      const updatedContent = await deleteLessonSectionBlock(
        lessonSlug,
        sectionKey,
        block.id
      );

      onLessonContentChange(updatedContent);
    } catch {
      setMessage("Could not delete block.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleDuplicate() {
    if (!block.id) {
      return;
    }

    setIsDuplicating(true);
    setMessage("");

    try {
      const updatedContent = await duplicateLessonSectionBlock(
        lessonSlug,
        sectionKey,
        block.id
      );

      onLessonContentChange(updatedContent);
      setMessage("Duplicated.");
    } catch {
      setMessage("Could not duplicate block.");
    } finally {
      setIsDuplicating(false);
    }
  }

  function renderFields() {
    switch (blockType) {
      case "rich_text":
        return (
          <label>
            Markdown
            <textarea
              name="markdown"
              value={form.markdown ?? ""}
              onChange={handleInputChange}
              rows={8}
              placeholder="Use **bold**, `inline code`, and lists."
            />
          </label>
        );

      case "code":
        return (
          <>
            <div className="admin-form-row admin-form-row-two">
              <label>
                Language
                <input
                  name="language"
                  value={form.language ?? ""}
                  onChange={handleInputChange}
                  placeholder="python"
                />
              </label>

              <label>
                Code title
                <input
                  name="title"
                  value={form.title ?? ""}
                  onChange={handleInputChange}
                  placeholder="Python"
                />
              </label>
            </div>

            <label>
              Code
              <textarea
                name="code"
                value={form.code ?? ""}
                onChange={handleInputChange}
                rows={8}
                placeholder={`flavor = "strawberry"\nprint(flavor)`}
              />
            </label>
          </>
        );

      case "callout":
        return (
          <>
            <div className="admin-form-row admin-form-row-two">
              <label>
                Tone
                <select
                  name="tone"
                  value={form.tone ?? "info"}
                  onChange={handleInputChange}
                >
                  {calloutToneOptions.map((tone) => (
                    <option value={tone} key={tone}>
                      {tone}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Title
                <input
                  name="title"
                  value={form.title ?? ""}
                  onChange={handleInputChange}
                  placeholder="Trap 1: Thinking strings can be changed in place"
                />
              </label>
            </div>

            <label>
              Markdown before code
              <textarea
                name="markdown"
                value={form.markdown ?? ""}
                onChange={handleInputChange}
                rows={4}
                placeholder="Wrong mental model:"
              />
            </label>

            <div className="admin-form-row admin-form-row-two">
              <label>
                Code language
                <input
                  name="codeLanguage"
                  value={form.codeLanguage ?? ""}
                  onChange={handleInputChange}
                  placeholder="python"
                />
              </label>

              <label>
                Code title
                <input
                  name="codeTitle"
                  value={form.codeTitle ?? ""}
                  onChange={handleInputChange}
                  placeholder="Python"
                />
              </label>
            </div>

            <label>
              Code
              <textarea
                name="code"
                value={form.code ?? ""}
                onChange={handleInputChange}
                rows={7}
                placeholder={`word = "cake"\nword[0] = "b"`}
              />
            </label>

            <label>
              Markdown after code
              <textarea
                name="afterMarkdown"
                value={form.afterMarkdown ?? ""}
                onChange={handleInputChange}
                rows={5}
                placeholder={`This will cause an error because strings are immutable.\n\nYou cannot change one character inside a string.`}
              />
            </label>
          </>
        );
      case "image":
        return (
          <>
            <label>
              Image URL
              <input
                name="imageUrl"
                value={form.imageUrl ?? ""}
                onChange={handleInputChange}
                placeholder="/lesson-images/example.png"
              />
            </label>

            <label>
              Alt text
              <input
                name="imageAlt"
                value={form.imageAlt ?? ""}
                onChange={handleInputChange}
                placeholder="Describe the image for screen readers"
              />
            </label>

            <label>
              Caption
              <textarea
                name="caption"
                value={form.caption ?? ""}
                onChange={handleInputChange}
                rows={3}
                placeholder="Optional short caption under the image"
              />
            </label>
          </>
        );

      case "table":
        return (
          <>
            <label>
              Headers
              <textarea
                name="headersText"
                value={form.headersText ?? ""}
                onChange={handleInputChange}
                rows={2}
                placeholder="Type | Meaning"
              />
            </label>

            <label>
              Rows
              <textarea
                name="rowsText"
                value={form.rowsText ?? ""}
                onChange={handleInputChange}
                rows={5}
                placeholder={`list | mutable\ntuple | immutable`}
              />
            </label>
          </>
        );

      case "practice_single":
        return (
          <>
            <label>
              Question markdown
              <textarea
                name="question"
                value={form.question ?? ""}
                onChange={handleInputChange}
                rows={4}
                placeholder="What does this code do?"
              />
            </label>

            <label>
              Optional code
              <textarea
                name="code"
                value={form.code ?? ""}
                onChange={handleInputChange}
                rows={5}
                placeholder={`tea = "mint"`}
              />
            </label>

            <label>
              Options
              <textarea
                name="optionsText"
                value={form.optionsText ?? ""}
                onChange={handleInputChange}
                rows={5}
                placeholder={`A | list\nB | str\nC | dict`}
              />
            </label>

            <label>
              Correct answer
              <input
                name="correctAnswer"
                value={form.correctAnswer ?? ""}
                onChange={handleInputChange}
                placeholder="B"
              />
            </label>

            <label>
              Explanation markdown
              <textarea
                name="explanation"
                value={form.explanation ?? ""}
                onChange={handleInputChange}
                rows={4}
                placeholder="Explain why the selected answer is correct."
              />
            </label>
          </>
        );

      case "practice_multi":
        return (
          <>
            <label>
              Question markdown
              <textarea
                name="question"
                value={form.question ?? ""}
                onChange={handleInputChange}
                rows={4}
                placeholder="Which options are correct?"
              />
            </label>

            <label>
              Optional code
              <textarea
                name="code"
                value={form.code ?? ""}
                onChange={handleInputChange}
                rows={5}
                placeholder={`items = ["apple", "cake"]`}
              />
            </label>

            <label>
              Options
              <textarea
                name="optionsText"
                value={form.optionsText ?? ""}
                onChange={handleInputChange}
                rows={5}
                placeholder={`A | list\nB | str\nC | dict\nD | set`}
              />
            </label>

            <label>
              Correct answers
              <input
                name="correctAnswersText"
                value={form.correctAnswersText ?? ""}
                onChange={handleInputChange}
                placeholder="A, C, D"
              />
            </label>

            <label>
              Explanation markdown
              <textarea
                name="explanation"
                value={form.explanation ?? ""}
                onChange={handleInputChange}
                rows={4}
                placeholder="Explain why the selected answer is correct."
              />
            </label>
          </>
        );

      case "practice_code":
        return (
          <>
            <label>
              Task markdown
              <textarea
                name="task"
                value={form.task ?? ""}
                onChange={handleInputChange}
                rows={4}
                placeholder="Write the task the learner should complete."
              />
            </label>

            <label>
              Starter code
              <textarea
                name="starterCode"
                value={form.starterCode ?? ""}
                onChange={handleInputChange}
                rows={8}
                placeholder={`# Write starter code here
`}
              />
            </label>

            <label>
              Expected output
              <textarea
                name="expectedOutput"
                value={form.expectedOutput ?? ""}
                onChange={handleInputChange}
                rows={4}
                placeholder="Expected output here"
              />
            </label>

            <label>
              Explanation markdown
              <textarea
                name="explanation"
                value={form.explanation ?? ""}
                onChange={handleInputChange}
                rows={4}
                placeholder="Explain why the selected answer is correct."
              />
            </label>
          </>
        );

      case "accordion":
        return (
          <>
            <label>
              Accordion title
              <input
                name="title"
                value={form.title ?? ""}
                onChange={handleInputChange}
                placeholder="Why does this happen?"
              />
            </label>

            <label>
              Markdown
              <textarea
                name="markdown"
                value={form.markdown ?? ""}
                onChange={handleInputChange}
                rows={6}
                placeholder="Add the hidden explanation here."
              />
            </label>
          </>
        );

      default:
        return null;
    }
  }

  return (
    <article
      id={block.id ? `admin-block-${block.id}` : undefined}
      className={`admin-block-card ${
        sortable.isDragging ? "admin-block-card-dragging" : ""
      }`}
      ref={sortable.setNodeRef}
      style={style}
    >
      <div className="admin-block-card-header">
        <button
          type="button"
          className="admin-block-drag-handle"
          {...sortable.attributes}
          {...sortable.listeners}
          aria-label="Drag block"
        >
          ⋮⋮
        </button>

        <div>
          <p className="eyebrow">Block {block.order}</p>
          <h4>{blockType.replace("_", " ")}</h4>
        </div>

        <div className="admin-block-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={handleDuplicate}
            disabled={isDuplicating}
          >
            {isDuplicating ? "Duplicating..." : "Duplicate"}
          </button>

          <button
            type="button"
            className="button button-secondary"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <div className="admin-form">
        <label>
          Block type
          <select value={blockType} onChange={handleTypeChange}>
            {blockTypeOptions.map((type) => (
              <option value={type} key={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        {renderFields()}

        <button
          type="button"
          className="button button-primary"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save block"}
        </button>

        {message && <p className="admin-status-message">{message}</p>}
      </div>
    </article>
  );
}

function AdminLessonBlockEditor({
  lessonSlug,
  lessonContent,
  onLessonContentChange,
}: AdminLessonBlockEditorProps) {
  const [selectedSectionKey, setSelectedSectionKey] = useState("");
  const [newBlockType, setNewBlockType] = useState<LessonBlockType>("rich_text");
  const [message, setMessage] = useState("");
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [pendingScrollBlockId, setPendingScrollBlockId] = useState<
    number | null
  >(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (lessonContent.sections.length === 0) {
      return;
    }

    const selectedSectionStillExists = lessonContent.sections.some(
      (section) => section.id === selectedSectionKey
    );

    if (!selectedSectionKey || !selectedSectionStillExists) {
      setSelectedSectionKey(lessonContent.sections[0].id);
    }
  }, [lessonContent.sections, selectedSectionKey]);

  useEffect(() => {
    if (!pendingScrollBlockId) {
      return;
    }

    const timer = window.setTimeout(() => {
      const blockElement = document.getElementById(
        `admin-block-${pendingScrollBlockId}`
      );

      if (!blockElement) {
        return;
      }

      blockElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      const firstEditableField =
        blockElement.querySelector<HTMLElement>("textarea, input, select");

      firstEditableField?.focus({ preventScroll: true });

      setPendingScrollBlockId(null);
    }, 120);

    return () => {
      window.clearTimeout(timer);
    };
  }, [pendingScrollBlockId, lessonContent]);

  const selectedSection = lessonContent.sections.find(
    (section) => section.id === selectedSectionKey
  );

  const sortedBlocks = useMemo(
    () => sortBlocks(selectedSection?.blocks),
    [selectedSection]
  );

  async function handleAddBlock() {
    if (!selectedSection) {
      return;
    }

    setIsAddingBlock(true);
    setMessage("");

    const existingBlockIds = new Set(
      sortedBlocks
        .map((block) => block.id)
        .filter((blockId): blockId is number => typeof blockId === "number")
    );

    try {
      const updatedContent = await createLessonSectionBlock(
        lessonSlug,
        selectedSection.id,
        {
          type: newBlockType,
          data: getDefaultBlockData(newBlockType),
        }
      );

      const updatedSection = updatedContent.sections.find(
        (section) => section.id === selectedSection.id
      );

      const updatedBlocks = sortBlocks(updatedSection?.blocks);

      const addedBlock =
        updatedBlocks.find(
          (block) => block.id && !existingBlockIds.has(block.id)
        ) ?? updatedBlocks[updatedBlocks.length - 1];

      onLessonContentChange(updatedContent);

      if (addedBlock?.id) {
        setPendingScrollBlockId(addedBlock.id);
      }

      setMessage("Block added.");
    } catch {
      setMessage("Could not add block.");
    } finally {
      setIsAddingBlock(false);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    if (!selectedSection || !event.over) {
      return;
    }

    if (event.active.id === event.over.id) {
      return;
    }

    const oldIndex = sortedBlocks.findIndex(
      (block) => getBlockSortableId(block) === event.active.id
    );

    const newIndex = sortedBlocks.findIndex(
      (block) => getBlockSortableId(block) === event.over?.id
    );

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const reorderedBlocks = arrayMove(sortedBlocks, oldIndex, newIndex);
    const blockIds = reorderedBlocks
      .map((block) => block.id)
      .filter((blockId): blockId is number => typeof blockId === "number");

    if (blockIds.length !== reorderedBlocks.length) {
      setMessage("Cannot reorder unsaved blocks.");
      return;
    }

    setIsReordering(true);
    setMessage("");

    try {
      const updatedContent = await reorderLessonSectionBlocks(
        lessonSlug,
        selectedSection.id,
        blockIds
      );

      onLessonContentChange(updatedContent);
      setMessage("Block order updated.");
    } catch {
      setMessage("Could not reorder blocks.");
    } finally {
      setIsReordering(false);
    }
  }

  return (
    <section className="admin-edit-panel admin-block-editor">
      <h2>Flexible section blocks</h2>

      <p className="admin-help-text">
        Build each section from reusable blocks. Drag blocks to reorder them.
        Markdown supports <strong>bold</strong>, inline code, and lists.
      </p>

      {lessonContent.sections.length === 0 ? (
        <p className="api-notice">
          Create at least one section before adding blocks.
        </p>
      ) : (
        <>
          <div className="admin-form admin-block-editor-toolbar">
            <label>
              Section
              <select
                value={selectedSectionKey}
                onChange={(event) => setSelectedSectionKey(event.target.value)}
              >
                {lessonContent.sections.map((section, index) => (
                  <option value={section.id} key={section.id}>
                    {index + 1}. {section.title} ({section.type})
                  </option>
                ))}
              </select>
            </label>

            <div className="admin-form-row admin-form-row-two">
              <label>
                New block type
                <select
                  value={newBlockType}
                  onChange={(event) =>
                    setNewBlockType(event.target.value as LessonBlockType)
                  }
                >
                  {blockTypeOptions.map((type) => (
                    <option value={type} key={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <div className="admin-block-add-control">
                <button
                  type="button"
                  className="button button-primary"
                  onClick={handleAddBlock}
                  disabled={isAddingBlock}
                >
                  {isAddingBlock ? "Adding..." : "Add block"}
                </button>
              </div>
            </div>
          </div>

          {selectedSection && sortedBlocks.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedBlocks.map(getBlockSortableId)}
                strategy={verticalListSortingStrategy}
              >
                <div className="admin-block-list">
                  {sortedBlocks.map((block) => (
                    <SortableBlockCard
                      block={block}
                      lessonSlug={lessonSlug}
                      sectionKey={selectedSection.id}
                      onLessonContentChange={onLessonContentChange}
                      key={block.id ?? block.key}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <p className="api-notice">
              This section has no blocks yet. Add the first one above.
            </p>
            )}
            
            {selectedSection && (
  <div className="admin-block-bottom-add">
    <div>
      <p className="eyebrow">Add another block</p>
      <p className="admin-help-text">
        Continue building this section without scrolling back to the top.
      </p>
    </div>

    <div className="admin-form-row admin-form-row-two">
      <label>
        New block type
        <select
          value={newBlockType}
          onChange={(event) =>
            setNewBlockType(event.target.value as LessonBlockType)
          }
        >
          {blockTypeOptions.map((type) => (
            <option value={type} key={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <div className="admin-block-add-control">
        <button
          type="button"
          className="button button-primary"
          onClick={handleAddBlock}
          disabled={isAddingBlock}
        >
          {isAddingBlock ? "Adding..." : "Add block"}
        </button>
      </div>
    </div>
  </div>
)}

          {isReordering && <p className="admin-status-message">Reordering...</p>}
          {message && <p className="admin-status-message">{message}</p>}
        </>
      )}
    </section>
  );
}

export default AdminLessonBlockEditor;