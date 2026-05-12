import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import AdminLessonBlockEditor from "../../components/admin/AdminLessonBlockEditor";
import type { HeroVisualTone, HeroVisualVariant } from "../../types/heroVisual";
import {
  createLessonSection,
  createLessonSectionItem,
  deleteLessonSection,
  deleteLessonSectionItem,
  importLessonMarkdown,
  updateLessonContentBasics,
  updateLessonMetadata,
  updateLessonSection,
  updateLessonSectionItem,
  updateLessonStatus,
  upsertLessonSectionTable,
} from "../../api/adminApi";
import { fetchLessonContentBySlug } from "../../api/lessonContentApi";
import { fetchLessonBySlug } from "../../api/lessonsApi";
import { getLessonBySlug } from "../../data/lessons";
import { getLessonContentBySlug } from "../../data/lessonContent";
import type {
  LessonDifficulty,
  LessonPreview,
  LessonStatus,
} from "../../types/curriculum";
import type {
  LessonContent,
  LessonImagePosition,
  LessonSection,
} from "../../types/lesson";

const sectionTypeOptions: LessonSection["type"][] = [
  "metaphor",
  "theory",
  "code_example",
  "interview",
  "trap_zone",
  "practice",
  "cheat_sheet",
  "answer_key",
];

const imagePositionOptions: LessonImagePosition[] = [
  "top",
  "after_code",
  "bottom",
];

const showLegacyEditor = false;

function AdminLessonDetailPage() {
  const { lessonSlug } = useParams();

  const [lesson, setLesson] = useState<LessonPreview | undefined>(undefined);
  const [lessonContent, setLessonContent] = useState<
    LessonContent | undefined
  >(undefined);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [statusMessage, setStatusMessage] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [metadataMessage, setMetadataMessage] = useState("");
  const [isUpdatingMetadata, setIsUpdatingMetadata] = useState(false);

  const [contentMessage, setContentMessage] = useState("");
  const [isUpdatingContent, setIsUpdatingContent] = useState(false);

  const [markdownImportText, setMarkdownImportText] = useState("");
  const [markdownImportMessage, setMarkdownImportMessage] = useState("");
  const [isImportingMarkdown, setIsImportingMarkdown] = useState(false);

  const [sectionMessage, setSectionMessage] = useState("");
  const [isCreatingSection, setIsCreatingSection] = useState(false);

  const [editSectionMessage, setEditSectionMessage] = useState("");
  const [isUpdatingSection, setIsUpdatingSection] = useState(false);

  const [deleteSectionMessage, setDeleteSectionMessage] = useState("");
  const [deletingSectionKey, setDeletingSectionKey] = useState("");

  const [itemMessage, setItemMessage] = useState("");
  const [isCreatingItem, setIsCreatingItem] = useState(false);

  const [editItemMessage, setEditItemMessage] = useState("");
  const [isUpdatingItem, setIsUpdatingItem] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);

  const [tableMessage, setTableMessage] = useState("");
  const [isSavingTable, setIsSavingTable] = useState(false);

  const [metadataForm, setMetadataForm] = useState({
    title: "",
    shortDescription: "",
    difficulty: "beginner" as LessonDifficulty,
    estimatedTime: "",
    order: 1,
  });

  const [contentForm, setContentForm] = useState({
      title: "",
      goal: "",
      imagePromptsText: "",
      heroVisualVariant: "code-card" as HeroVisualVariant,
      heroVisualTone: "warm" as HeroVisualTone,
      heroVisualKicker: "",
      heroVisualTitle: "",
      heroVisualLinesText: "",
      heroVisualChipsText: "",
      completionImageUrl: "",
      completionImageAlt: "",
      completionKicker: "",
      completionTitle: "",
      completionBody: "",
    });

  const [sectionForm, setSectionForm] = useState({
    type: "theory" as LessonSection["type"],
    title: "",
    paragraphsText: "",
    code: "",
    output: "",
    imageUrl: "",
    imageAlt: "",
    imagePosition: "top" as LessonImagePosition,
  });

  const [editSectionForm, setEditSectionForm] = useState({
    sectionKey: "",
    type: "theory" as LessonSection["type"],
    title: "",
    paragraphsText: "",
    code: "",
    output: "",
    imageUrl: "",
    imageAlt: "",
    imagePosition: "top" as LessonImagePosition,
  });

  const [itemForm, setItemForm] = useState({
    sectionKey: "",
    title: "",
    content: "",
    code: "",
    output: "",
    afterText: "",
    imageUrl: "",
    imageAlt: "",
  });

  const [editItemForm, setEditItemForm] = useState({
    sectionKey: "",
    itemId: 0,
    title: "",
    content: "",
    code: "",
    output: "",
    afterText: "",
    imageUrl: "",
    imageAlt: "",
  });

  const [tableForm, setTableForm] = useState({
    sectionKey: "",
    headersText: "",
    rowsText: "",
  });

  function getEditableItems() {
    if (!lessonContent) {
      return [];
    }

    return lessonContent.sections.flatMap((section) =>
      (section.items ?? [])
        .filter((item) => typeof item.id === "number")
        .map((item) => ({
          sectionKey: section.id,
          sectionTitle: section.title,
          item,
        }))
    );
  }

  useEffect(() => {
    async function loadLessonData() {
      if (!lessonSlug) {
        setIsLoading(false);
        return;
      }

      try {
        const lessonFromApi = await fetchLessonBySlug(lessonSlug);

        setLesson(lessonFromApi);
        setErrorMessage("");

        if (lessonFromApi.hasContent) {
          const contentFromApi = await fetchLessonContentBySlug(lessonSlug);
          setLessonContent(contentFromApi);
        } else {
          setLessonContent(undefined);
        }
      } catch {
        const localLesson = getLessonBySlug(lessonSlug);
        const localLessonContent = getLessonContentBySlug(lessonSlug);

        setLesson(localLesson);
        setLessonContent(localLessonContent);
        setErrorMessage("Backend is not available. Showing local demo data.");
      } finally {
        setIsLoading(false);
      }
    }

    loadLessonData();
  }, [lessonSlug]);

  useEffect(() => {
    if (!lesson) {
      return;
    }

    setMetadataForm({
      title: lesson.title,
      shortDescription: lesson.shortDescription,
      difficulty: lesson.difficulty,
      estimatedTime: lesson.estimatedTime,
      order: lesson.order,
    });
  }, [lesson]);

  useEffect(() => {
    if (lessonContent) {
      setContentForm({
        title: lessonContent.title,
        goal: lessonContent.goal,
        imagePromptsText: lessonContent.imagePrompts?.join("\n") ?? "",
        heroVisualVariant: lessonContent.heroVisual?.variant ?? "code-card",
        heroVisualTone: lessonContent.heroVisual?.tone ?? "warm",
        heroVisualKicker: lessonContent.heroVisual?.kicker ?? "",
        heroVisualTitle: lessonContent.heroVisual?.title ?? "",
        heroVisualLinesText: lessonContent.heroVisual?.lines?.join("\n") ?? "",
        heroVisualChipsText: lessonContent.heroVisual?.chips?.join("\n") ?? "",
        completionImageUrl: lessonContent.completionImageUrl ?? "",
        completionImageAlt: lessonContent.completionImageAlt ?? "",
        completionKicker: lessonContent.completionKicker ?? "",
        completionTitle: lessonContent.completionTitle ?? "",
        completionBody: lessonContent.completionBody ?? "",
      });

      return;
    }

    if (lesson) {
      setContentForm({
        title: lesson.title,
        goal: "",
        imagePromptsText: "",
        heroVisualVariant: "code-card",
        heroVisualTone: "warm",
        heroVisualKicker: "",
        heroVisualTitle: "",
        heroVisualLinesText: "",
        heroVisualChipsText: "",
        completionImageUrl: "",
        completionImageAlt: "",
        completionKicker: "",
        completionTitle: "",
        completionBody: "",
      });
    }
  }, [lesson, lessonContent]);

  useEffect(() => {
    if (!lessonContent || lessonContent.sections.length === 0) {
      return;
    }

    setItemForm((currentForm) => ({
      ...currentForm,
      sectionKey: currentForm.sectionKey || lessonContent.sections[0].id,
    }));

    setTableForm((currentForm) => ({
      ...currentForm,
      sectionKey: currentForm.sectionKey || lessonContent.sections[0].id,
    }));

    const selectedSection =
      lessonContent.sections.find(
        (section) => section.id === editSectionForm.sectionKey
      ) ?? lessonContent.sections[0];

    setEditSectionForm({
      sectionKey: selectedSection.id,
      type: selectedSection.type,
      title: selectedSection.title,
      paragraphsText: selectedSection.paragraphs?.join("\n") ?? "",
      code: selectedSection.code ?? "",
      output: selectedSection.output ?? "",
      imageUrl: selectedSection.imageUrl ?? "",
      imageAlt: selectedSection.imageAlt ?? "",
      imagePosition: selectedSection.imagePosition ?? "top",
    });
  }, [lessonContent]);

  useEffect(() => {
    const editableItems = getEditableItems();

    if (editableItems.length === 0) {
      return;
    }

    const currentItemStillExists = editableItems.some(
      (entry) => entry.item.id === editItemForm.itemId
    );

    if (currentItemStillExists) {
      return;
    }

    const firstEntry = editableItems[0];

    setEditItemForm({
      sectionKey: firstEntry.sectionKey,
      itemId: firstEntry.item.id ?? 0,
      title: firstEntry.item.title ?? "",
      content: firstEntry.item.content,
      code: firstEntry.item.code ?? "",
      output: firstEntry.item.output ?? "",
      afterText: firstEntry.item.afterText ?? "",
      imageUrl: firstEntry.item.imageUrl ?? "",
      imageAlt: firstEntry.item.imageAlt ?? "",
    });
  }, [lessonContent]);

  async function handleStatusChange(newStatus: LessonStatus) {
    if (!lesson) {
      return;
    }

    setIsUpdatingStatus(true);
    setStatusMessage("");

    try {
      const updatedLesson = await updateLessonStatus(lesson.slug, newStatus);

      setLesson(updatedLesson);
      setStatusMessage("Lesson status updated successfully.");
      setErrorMessage("");
    } catch {
      setStatusMessage(
        "Could not update status through the backend. Make sure the API is running."
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  function handleMetadataInputChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setMetadataForm((currentForm) => ({
      ...currentForm,
      [name]: name === "order" ? Number(value) : value,
    }));
  }

  async function handleMetadataSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!lesson) {
      return;
    }

    setIsUpdatingMetadata(true);
    setMetadataMessage("");

    try {
      const updatedLesson = await updateLessonMetadata(
        lesson.slug,
        metadataForm
      );

      setLesson(updatedLesson);
      setMetadataMessage("Lesson metadata updated successfully.");
      setErrorMessage("");
    } catch {
      setMetadataMessage(
        "Could not update metadata through the backend. Make sure the API is running."
      );
    } finally {
      setIsUpdatingMetadata(false);
    }
  }

function handleContentInputChange(
  event: ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >
) {
  const { name, value } = event.target;

  setContentForm((currentForm) => ({
    ...currentForm,
    [name]: value,
  }));
}

  async function handleContentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!lesson) {
      return;
    }

    setIsUpdatingContent(true);
    setContentMessage("");

    const imagePrompts = contentForm.imagePromptsText
      .split("\n")
      .map((prompt) => prompt.trim())
      .filter(Boolean);
    
    const heroVisualLines = contentForm.heroVisualLinesText
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean)
  .slice(0, 4);

const heroVisualChips = contentForm.heroVisualChipsText
  .split("\n")
  .map((chip) => chip.trim())
  .filter(Boolean)
  .slice(0, 5);

const hasHeroVisual =
  contentForm.heroVisualKicker.trim() ||
  contentForm.heroVisualTitle.trim() ||
  heroVisualLines.length > 0 ||
  heroVisualChips.length > 0;

if (
  hasHeroVisual &&
  (!contentForm.heroVisualKicker.trim() ||
    !contentForm.heroVisualTitle.trim() ||
    heroVisualLines.length === 0)
) {
  setContentMessage(
    "Hero visual needs a kicker, a title, and at least one line."
  );
  setIsUpdatingContent(false);
  return;
}

const heroVisual = hasHeroVisual
  ? {
      variant: contentForm.heroVisualVariant,
      tone: contentForm.heroVisualTone,
      kicker: contentForm.heroVisualKicker.trim(),
      title: contentForm.heroVisualTitle.trim(),
      lines: heroVisualLines,
      chips: heroVisualChips,
    }
  : undefined;

    try {
      const updatedContent = await updateLessonContentBasics(lesson.slug, {
        title: contentForm.title,
        goal: contentForm.goal,
        imagePrompts,
        heroVisual,
        completionImageUrl: contentForm.completionImageUrl.trim() || undefined,
        completionImageAlt: contentForm.completionImageAlt.trim() || undefined,
        completionKicker: contentForm.completionKicker.trim() || undefined,
        completionTitle: contentForm.completionTitle.trim() || undefined,
        completionBody: contentForm.completionBody.trim() || undefined,
      });
      setLessonContent(updatedContent);
      setLesson((currentLesson) =>
        currentLesson ? { ...currentLesson, hasContent: true } : currentLesson
      );

      setContentMessage("Lesson content basics updated successfully.");
      setErrorMessage("");
    } catch {
      setContentMessage(
        "Could not update content through the backend. Make sure the API is running."
      );
    } finally {
      setIsUpdatingContent(false);
    }
  }

  function handleSectionInputChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setSectionForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleMarkdownImportInputChange(
    event: ChangeEvent<HTMLTextAreaElement>
  ) {
    setMarkdownImportText(event.target.value);
  }

  async function handleMarkdownImportSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!lesson) {
      return;
    }

    if (!markdownImportText.trim()) {
      setMarkdownImportMessage("Paste lesson Markdown before importing.");
      return;
    }

    const shouldReplace =
      !lessonContent ||
      lessonContent.sections.length === 0 ||
      window.confirm(
        "Importing Markdown will replace the current lesson content sections, items, and tables. Continue?"
      );

    if (!shouldReplace) {
      return;
    }

    setIsImportingMarkdown(true);
    setMarkdownImportMessage("");

    try {
      const updatedContent = await importLessonMarkdown(lesson.slug, {
        markdown: markdownImportText,
      });

      setLessonContent(updatedContent);
      setLesson((currentLesson) =>
        currentLesson ? { ...currentLesson, hasContent: true } : currentLesson
      );
      setMarkdownImportText("");
      setMarkdownImportMessage("Lesson Markdown imported successfully.");
      setErrorMessage("");
    } catch {
      setMarkdownImportMessage(
        "Could not import Markdown through the backend. Make sure the API is running and the lesson text has proper headings."
      );
    } finally {
      setIsImportingMarkdown(false);
    }
  }

  async function handleSectionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!lesson) {
      return;
    }

    setIsCreatingSection(true);
    setSectionMessage("");

    const paragraphs = sectionForm.paragraphsText
      .split("\n")
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    try {
      const updatedContent = await createLessonSection(lesson.slug, {
        type: sectionForm.type,
        title: sectionForm.title,
        paragraphs,
        code: sectionForm.code.trim() || undefined,
        output: sectionForm.output.trim() || undefined,
        imageUrl: sectionForm.imageUrl.trim() || undefined,
        imageAlt: sectionForm.imageAlt.trim() || undefined,
        imagePosition: sectionForm.imageUrl.trim()
          ? sectionForm.imagePosition
          : undefined,
      });

      setLessonContent(updatedContent);

      setSectionForm({
        type: "theory",
        title: "",
        paragraphsText: "",
        code: "",
        output: "",
        imageUrl: "",
        imageAlt: "",
        imagePosition: "top",
      });

      setSectionMessage("Lesson section created successfully.");
      setErrorMessage("");
    } catch {
      setSectionMessage(
        "Could not create section through the backend. Make sure the API is running and content basics exist."
      );
    } finally {
      setIsCreatingSection(false);
    }
  }

  function handleEditSectionTargetChange(
    event: ChangeEvent<HTMLSelectElement>
  ) {
    const selectedSectionKey = event.target.value;

    const selectedSection = lessonContent?.sections.find(
      (section) => section.id === selectedSectionKey
    );

    if (!selectedSection) {
      return;
    }

    setEditSectionForm({
      sectionKey: selectedSection.id,
      type: selectedSection.type,
      title: selectedSection.title,
      paragraphsText: selectedSection.paragraphs?.join("\n") ?? "",
      code: selectedSection.code ?? "",
      output: selectedSection.output ?? "",
      imageUrl: selectedSection.imageUrl ?? "",
      imageAlt: selectedSection.imageAlt ?? "",
      imagePosition: selectedSection.imagePosition ?? "top",
    });
  }

  function handleEditSectionInputChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setEditSectionForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleEditSectionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!lesson) {
      return;
    }

    setIsUpdatingSection(true);
    setEditSectionMessage("");

    const paragraphs = editSectionForm.paragraphsText
      .split("\n")
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    try {
      const updatedContent = await updateLessonSection(
        lesson.slug,
        editSectionForm.sectionKey,
        {
          type: editSectionForm.type,
          title: editSectionForm.title,
          paragraphs,
          code: editSectionForm.code.trim() || undefined,
          output: editSectionForm.output.trim() || undefined,
          imageUrl: editSectionForm.imageUrl.trim() || undefined,
          imageAlt: editSectionForm.imageAlt.trim() || undefined,
          imagePosition: editSectionForm.imageUrl.trim()
            ? editSectionForm.imagePosition
            : undefined,
        }
      );

      setLessonContent(updatedContent);
      setEditSectionMessage("Lesson section updated successfully.");
      setErrorMessage("");
    } catch {
      setEditSectionMessage(
        "Could not update section through the backend. Make sure the API is running and the selected section exists."
      );
    } finally {
      setIsUpdatingSection(false);
    }
  }

  async function handleDeleteSection(sectionKey: string) {
    if (!lesson) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this section? Its items and table will also be removed."
    );

    if (!confirmed) {
      return;
    }

    setDeletingSectionKey(sectionKey);
    setDeleteSectionMessage("");

    try {
      const updatedContent = await deleteLessonSection(lesson.slug, sectionKey);

      setLessonContent(updatedContent);
      setDeleteSectionMessage("Lesson section deleted successfully.");
      setErrorMessage("");
    } catch {
      setDeleteSectionMessage(
        "Could not delete section through the backend. Make sure the API is running."
      );
    } finally {
      setDeletingSectionKey("");
    }
  }

  function handleItemInputChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setItemForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleItemSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!lesson) {
      return;
    }

    setIsCreatingItem(true);
    setItemMessage("");

    try {
      const updatedContent = await createLessonSectionItem(
        lesson.slug,
        itemForm.sectionKey,
        {
          title: itemForm.title.trim() || undefined,
          content: itemForm.content,
          code: itemForm.code.trim() || undefined,
          output: itemForm.output.trim() || undefined,
          afterText: itemForm.afterText.trim() || undefined,
          imageUrl: itemForm.imageUrl.trim() || undefined,
          imageAlt: itemForm.imageAlt.trim() || undefined,
        }
      );

      setLessonContent(updatedContent);

      setItemForm((currentForm) => ({
        sectionKey: currentForm.sectionKey,
        title: "",
        content: "",
        code: "",
        output: "",
        afterText: "",
        imageUrl: "",
        imageAlt: "",
      }));

      setItemMessage("Section item created successfully.");
      setErrorMessage("");
    } catch {
      setItemMessage(
        "Could not create item through the backend. Make sure the API is running and the selected section exists."
      );
    } finally {
      setIsCreatingItem(false);
    }
  }

  function handleEditItemTargetChange(event: ChangeEvent<HTMLSelectElement>) {
    const selectedValue = event.target.value;
    const [sectionKey, rawItemId] = selectedValue.split("::");
    const itemId = Number(rawItemId);

    const section = lessonContent?.sections.find(
      (currentSection) => currentSection.id === sectionKey
    );

    const item = section?.items?.find(
      (currentItem) => currentItem.id === itemId
    );

    if (!section || !item || !item.id) {
      return;
    }

    setEditItemForm({
      sectionKey: section.id,
      itemId: item.id,
      title: item.title ?? "",
      content: item.content,
      code: item.code ?? "",
      output: item.output ?? "",
      afterText: item.afterText ?? "",
      imageUrl: item.imageUrl ?? "",
      imageAlt: item.imageAlt ?? "",
    });
  }

  function handleEditItemInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;

    setEditItemForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleEditItemSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!lesson || !editItemForm.itemId) {
      return;
    }

    setIsUpdatingItem(true);
    setEditItemMessage("");

    try {
      const updatedContent = await updateLessonSectionItem(
        lesson.slug,
        editItemForm.sectionKey,
        editItemForm.itemId,
        {
          title: editItemForm.title.trim() || undefined,
          content: editItemForm.content,
          code: editItemForm.code.trim() || undefined,
          output: editItemForm.output.trim() || undefined,
          afterText: editItemForm.afterText.trim() || undefined,
          imageUrl: editItemForm.imageUrl.trim() || undefined,
          imageAlt: editItemForm.imageAlt.trim() || undefined,
        }
      );

      setLessonContent(updatedContent);
      setEditItemMessage("Section item updated successfully.");
      setErrorMessage("");
    } catch {
      setEditItemMessage(
        "Could not update item through the backend. Make sure the API is running and the selected item exists."
      );
    } finally {
      setIsUpdatingItem(false);
    }
  }

  async function handleDeleteItem(
    sectionKey: string,
    itemId: number | undefined
  ) {
    if (!lesson || !itemId) {
      return;
    }

    const confirmed = window.confirm("Delete this item?");

    if (!confirmed) {
      return;
    }

    setDeletingItemId(itemId);
    setEditItemMessage("");

    try {
      const updatedContent = await deleteLessonSectionItem(
        lesson.slug,
        sectionKey,
        itemId
      );

      setLessonContent(updatedContent);
      setEditItemMessage("Section item deleted successfully.");
      setErrorMessage("");
    } catch {
      setEditItemMessage(
        "Could not delete item through the backend. Make sure the API is running."
      );
    } finally {
      setDeletingItemId(null);
    }
  }

  function handleTableInputChange(
    event: ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setTableForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleTableSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!lesson) {
      return;
    }

    setIsSavingTable(true);
    setTableMessage("");

    const headers = tableForm.headersText
      .split("|")
      .map((header) => header.trim())
      .filter(Boolean);

    const rows = tableForm.rowsText
      .split("\n")
      .map((row) =>
        row
          .split("|")
          .map((cell) => cell.trim())
          .filter(Boolean)
      )
      .filter((row) => row.length > 0);

    if (headers.length === 0 || rows.length === 0) {
      setTableMessage("Please add headers and at least one row.");
      setIsSavingTable(false);
      return;
    }

    try {
      const updatedContent = await upsertLessonSectionTable(
        lesson.slug,
        tableForm.sectionKey,
        {
          headers,
          rows,
        }
      );

      setLessonContent(updatedContent);
      setTableMessage("Section table saved successfully.");
      setErrorMessage("");
    } catch {
      setTableMessage(
        "Could not save table through the backend. Make sure the API is running and the selected section exists."
      );
    } finally {
      setIsSavingTable(false);
    }
  }

  if (isLoading) {
    return (
      <main className="page">
        <section className="loading-box">
          <h1>Loading lesson...</h1>
          <p>Fetching lesson data for admin preview.</p>
        </section>
      </main>
    );
  }

  if (!lesson) {
    return (
      <main className="page">
        <h1>Lesson not found</h1>
        <p>This lesson does not exist.</p>

        <Link to="/admin/lessons" className="button button-primary">
          Back to lessons
        </Link>
      </main>
    );
  }

  const editableItems = getEditableItems();

  return (
    <main className="page">
      <section className="page-intro">
        <p className="eyebrow">Admin lesson preview</p>
        <h1>{lesson.title}</h1>
        <p>{lesson.shortDescription}</p>

        {errorMessage && <p className="api-notice">{errorMessage}</p>}

        <div className="hero-actions">
          <Link to="/admin/lessons" className="button button-secondary">
            Back to admin lessons
          </Link>

          <Link to={`/lessons/${lesson.slug}`} className="button button-primary">
            Open learner view
          </Link>
        </div>
      </section>

      <section className="admin-detail-grid">
        <article className="admin-card">
          <h2>Metadata</h2>

          <dl className="admin-definition-list">
            <div>
              <dt>Slug</dt>
              <dd>{lesson.slug}</dd>
            </div>

            <div>
              <dt>Track</dt>
              <dd>{lesson.trackSlug}</dd>
            </div>

            <div>
              <dt>Order</dt>
              <dd>{lesson.order}</dd>
            </div>

            <div>
              <dt>Status</dt>
              <dd>
                <span className={`status status-${lesson.status}`}>
                  {lesson.status.replace("_", " ")}
                </span>
              </dd>
            </div>

            <div>
              <dt>Change status</dt>
              <dd>
                <div className="admin-status-control">
                  <select
                    value={lesson.status}
                    disabled={isUpdatingStatus}
                    onChange={(event) =>
                      handleStatusChange(event.target.value as LessonStatus)
                    }
                  >
                    <option value="planned">planned</option>
                    <option value="in_progress">in_progress</option>
                    <option value="coming_soon">coming_soon</option>
                    <option value="published">published</option>
                    <option value="premium">premium</option>
                  </select>

                  {isUpdatingStatus && <span>Saving...</span>}
                </div>

                {statusMessage && (
                  <p className="admin-status-message">{statusMessage}</p>
                )}
              </dd>
            </div>

            <div>
              <dt>Difficulty</dt>
              <dd>{lesson.difficulty}</dd>
            </div>

            <div>
              <dt>Estimated time</dt>
              <dd>{lesson.estimatedTime}</dd>
            </div>
          </dl>
        </article>

        <article className="admin-card">
          <h2>Content summary</h2>

          {lessonContent ? (
            <dl className="admin-definition-list">
              <div>
                <dt>Content title</dt>
                <dd>{lessonContent.title}</dd>
              </div>

              <div>
                <dt>Sections</dt>
                <dd>{lessonContent.sections.length}</dd>
              </div>

              <div>
                <dt>Image prompts</dt>
                <dd>{lessonContent.imagePrompts?.length ?? 0}</dd>
              </div>

              <div>
                <dt>Completion image</dt>
                <dd>{lessonContent.completionImageUrl || "not set"}</dd>
              </div>
              <div>
  <dt>Completion title</dt>
  <dd>{lessonContent.completionTitle || "not set"}</dd>
</div>
            </dl>
          ) : (
            <p>No full lesson content has been added yet.</p>
          )}
        </article>
      </section>

      <section className="admin-edit-panel">
  <h2>Current lesson structure</h2>

  <p className="admin-help-text">
    This overview shows the real block-based lesson structure used by the
    learner view.
  </p>

  {deleteSectionMessage && (
    <p className="admin-status-message">{deleteSectionMessage}</p>
  )}

  {lessonContent && lessonContent.sections.length > 0 ? (
    <div className="admin-section-list">
      {lessonContent.sections.map((section, index) => {
        const sortedBlocks = [...(section.blocks ?? [])].sort(
          (firstBlock, secondBlock) => firstBlock.order - secondBlock.order
        );

        const hasLegacyContent =
          (section.paragraphs?.length ?? 0) > 0 ||
          Boolean(section.code) ||
          Boolean(section.output) ||
          Boolean(section.imageUrl) ||
          (section.items?.length ?? 0) > 0 ||
          Boolean(section.table);

        return (
          <article className="admin-section-card" key={section.id}>
            <div className="admin-section-card-header">
              <div>
                <p className="eyebrow">
                  {index + 1}. {section.type}
                </p>
                <h3>{section.title}</h3>
              </div>

              <button
                type="button"
                className="button button-secondary"
                disabled={deletingSectionKey === section.id}
                onClick={() => handleDeleteSection(section.id)}
              >
                {deletingSectionKey === section.id
                  ? "Deleting..."
                  : "Delete section"}
              </button>
            </div>

            <div className="admin-structure-stats">
              <span>Blocks: {sortedBlocks.length}</span>
              <span>Type: {section.type}</span>

              {hasLegacyContent && (
                <span className="admin-structure-warning">
                  Legacy content exists
                </span>
              )}
            </div>

            {sortedBlocks.length > 0 ? (
              <div className="admin-block-summary-list">
                <h4>Blocks in this section</h4>

                {sortedBlocks.map((block, blockIndex) => (
                  <div
                    className="admin-block-summary-row"
                    key={block.id ?? block.key ?? `${section.id}-${blockIndex}`}
                  >
                    <div>
                      <strong>
                        {blockIndex + 1}. {block.type.replace(/_/g, " ")}
                      </strong>

                      <span>Order: {block.order}</span>
                    </div>

                    <code>{block.key}</code>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-progress-card">
                <h3>No blocks yet.</h3>
                <p>
                  This section will use legacy content until at least one block
                  is added in the Flexible section blocks editor.
                </p>
              </div>
            )}

            {showLegacyEditor && hasLegacyContent && (
              <div className="admin-legacy-summary">
                <h4>Legacy content</h4>

                <ul>
                  <li>Paragraphs: {section.paragraphs?.length ?? 0}</li>
                  <li>Code block: {section.code ? "yes" : "no"}</li>
                  <li>Output block: {section.output ? "yes" : "no"}</li>
                  <li>Image: {section.imageUrl ? section.imageUrl : "no"}</li>
                  <li>Items: {section.items?.length ?? 0}</li>
                  <li>Table: {section.table ? "yes" : "no"}</li>
                </ul>
              </div>
            )}

            {showLegacyEditor && section.items && section.items.length > 0 && (
              <div className="admin-item-list">
                <h4>Items</h4>

                {section.items.map((item) => (
                  <div className="admin-item-row" key={item.id}>
                    <span>
                      {item.title || "Untitled item"}
                      {item.afterText ? " · after text" : ""}
                      {item.imageUrl ? " · image" : ""}
                    </span>

                    <button
                      type="button"
                      className="button button-secondary"
                      disabled={!item.id || deletingItemId === item.id}
                      onClick={() => handleDeleteItem(section.id, item.id)}
                    >
                      {deletingItemId === item.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </article>
        );
      })}
    </div>
  ) : (
    <p>No sections yet.</p>
  )}
</section>

      <section className="admin-edit-panel">
  <h2>Edit lesson content basics</h2>

  <p className="admin-help-text">
    This creates or updates the lesson content shell: title, goal, image
    prompts, and the final completion block.
  </p>

  <form className="admin-form" onSubmit={handleContentSubmit}>
    <label>
      Content title
      <input
        name="title"
        value={contentForm.title}
        onChange={handleContentInputChange}
      />
    </label>

    <label>
      Goal
      <textarea
        name="goal"
        value={contentForm.goal}
        onChange={handleContentInputChange}
        rows={5}
        placeholder="By the end of this lesson, the learner should..."
      />
    </label>

    <label>
      Image prompts
      <textarea
        name="imagePromptsText"
        value={contentForm.imagePromptsText}
        onChange={handleContentInputChange}
        rows={5}
        placeholder="Write one image prompt per line"
      />
          </label>
          
    <div className="admin-completion-editor">
  <h3>Hero visual</h3>

  <div className="admin-form-row admin-form-row-two">
    <label>
      Variant
      <select
        name="heroVisualVariant"
        value={contentForm.heroVisualVariant}
        onChange={handleContentInputChange}
      >
        <option value="code-card">code-card</option>
        <option value="recipe-card">recipe-card</option>
        <option value="ingredient-board">ingredient-board</option>
        <option value="terminal-card">terminal-card</option>
      </select>
    </label>

    <label>
      Tone
      <select
        name="heroVisualTone"
        value={contentForm.heroVisualTone}
        onChange={handleContentInputChange}
      >
        <option value="warm">warm</option>
        <option value="green">green</option>
        <option value="berry">berry</option>
        <option value="blue">blue</option>
        <option value="dark">dark</option>
      </select>
    </label>
  </div>

  <label>
    Hero kicker
    <input
      name="heroVisualKicker"
      value={contentForm.heroVisualKicker}
      onChange={handleContentInputChange}
      placeholder="Today's recipe"
    />
  </label>

  <label>
    Hero title
    <input
      name="heroVisualTitle"
      value={contentForm.heroVisualTitle}
      onChange={handleContentInputChange}
      placeholder="Mutable picnic basket"
    />
  </label>

  <label>
    Hero lines
    <textarea
      name="heroVisualLinesText"
      value={contentForm.heroVisualLinesText}
      onChange={handleContentInputChange}
      rows={4}
      placeholder={`snacks = ["apple", "tea"]
snacks.append("cake")
print(snacks)`}
    />
  </label>

  <label>
    Hero chips
    <textarea
      name="heroVisualChipsText"
      value={contentForm.heroVisualChipsText}
      onChange={handleContentInputChange}
      rows={3}
      placeholder={`mutable
        lists
        references`}
            />
          </label>
        </div>

    <div className="admin-completion-editor">
      <h3>Completion block</h3>

      <div className="admin-form-row admin-form-row-two">
        <label>
          Completion image URL
          <input
            name="completionImageUrl"
            value={contentForm.completionImageUrl}
            onChange={handleContentInputChange}
            placeholder="/lesson-images/lesson2_completion.png"
          />
        </label>

        <label>
          Completion image alt text
          <input
            name="completionImageAlt"
            value={contentForm.completionImageAlt}
            onChange={handleContentInputChange}
            placeholder="Celebration illustration for this lesson"
          />
        </label>
      </div>

      <label>
        Completion kicker
        <input
          name="completionKicker"
          value={contentForm.completionKicker}
          onChange={handleContentInputChange}
          placeholder="Lesson complete"
        />
      </label>

      <label>
        Completion title
        <input
          name="completionTitle"
          value={contentForm.completionTitle}
          onChange={handleContentInputChange}
          placeholder="Nice work. You now know what can change and what cannot."
        />
      </label>

      <label>
        Completion body
        <textarea
          name="completionBody"
          value={contentForm.completionBody}
          onChange={handleContentInputChange}
          rows={7}
          placeholder={`Mutable objects can be changed in place. Immutable objects cannot.

You also saw why reassignment is not the same as mutation — a classic junior interview trap.`}
        />
      </label>
    </div>

    <button
      type="submit"
      className="button button-primary"
      disabled={isUpdatingContent}
    >
      {isUpdatingContent ? "Saving..." : "Save content basics"}
    </button>

    {contentMessage && (
      <p className="admin-status-message">{contentMessage}</p>
    )}
  </form>
</section>

      {showLegacyEditor && (
<section className="admin-edit-panel">
        <h2>Import lesson from Markdown</h2>

        <p className="admin-help-text">
          Paste a full lesson in Markdown. This is useful for loading lesson
          text quickly. Images and after-text can be adjusted after import.
        </p>

        <p className="api-notice">
          Importing will replace the current lesson content sections, items, and
          tables for this lesson.
        </p>

        <form className="admin-form" onSubmit={handleMarkdownImportSubmit}>
          <label>
            Lesson Markdown
            <textarea
              value={markdownImportText}
              onChange={handleMarkdownImportInputChange}
              rows={14}
              placeholder={`# Lesson 1. Variables and Assignment

**Lesson goal:**
By the end of this lesson...

## Tasty Metaphor
...`}
            />
          </label>

          <button
            type="submit"
            className="button button-primary"
            disabled={isImportingMarkdown}
          >
            {isImportingMarkdown ? "Importing..." : "Import Markdown"}
          </button>

          {markdownImportMessage && (
            <p className="admin-status-message">{markdownImportMessage}</p>
          )}
        </form>
      </section>

      )}

      <section className="admin-edit-panel">
        <h2>Add lesson section</h2>

        <p className="admin-help-text">
          Create a section with paragraphs, optional code/output blocks, and an
          optional image.
        </p>

        {!lessonContent && (
          <p className="api-notice">
            Create lesson content basics before adding sections.
          </p>
        )}

        <form className="admin-form" onSubmit={handleSectionSubmit}>
          <div className="admin-form-row">
            <label>
              Section type
              <select
                name="type"
                value={sectionForm.type}
                onChange={handleSectionInputChange}
                disabled={!lessonContent}
              >
                {sectionTypeOptions.map((sectionType) => (
                  <option value={sectionType} key={sectionType}>
                    {sectionType}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Section title
              <input
                name="title"
                value={sectionForm.title}
                onChange={handleSectionInputChange}
                disabled={!lessonContent}
              />
            </label>
          </div>

          <label>
            Paragraphs
            <textarea
              name="paragraphsText"
              value={sectionForm.paragraphsText}
              onChange={handleSectionInputChange}
              rows={5}
              placeholder="Write one paragraph per line"
              disabled={!lessonContent}
            />
          </label>

          <label>
            Code block
            <textarea
              name="code"
              value={sectionForm.code}
              onChange={handleSectionInputChange}
              rows={6}
              placeholder="Optional code block"
              disabled={!lessonContent}
            />
          </label>

          <label>
            Output block
            <textarea
              name="output"
              value={sectionForm.output}
              onChange={handleSectionInputChange}
              rows={4}
              placeholder="Optional output block"
              disabled={!lessonContent}
            />
          </label>

          <div className="admin-form-row">
            <label>
              Section image URL
              <input
                name="imageUrl"
                value={sectionForm.imageUrl}
                onChange={handleSectionInputChange}
                placeholder="/lesson-images/lesson1_jars.png"
                disabled={!lessonContent}
              />
            </label>

            <label>
              Section image alt text
              <input
                name="imageAlt"
                value={sectionForm.imageAlt}
                onChange={handleSectionInputChange}
                placeholder="Illustration for this lesson section"
                disabled={!lessonContent}
              />
            </label>

            <label>
              Image position
              <select
                name="imagePosition"
                value={sectionForm.imagePosition}
                onChange={handleSectionInputChange}
                disabled={!lessonContent}
              >
                {imagePositionOptions.map((position) => (
                  <option value={position} key={position}>
                    {position === "after_code" ? "after code/output" : position}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="submit"
            className="button button-primary"
            disabled={!lessonContent || isCreatingSection}
          >
            {isCreatingSection ? "Creating..." : "Add section"}
          </button>

          {sectionMessage && (
            <p className="admin-status-message">{sectionMessage}</p>
          )}
        </form>
      </section>

      <section className="admin-edit-panel">
        <h2>Edit existing section</h2>

        <p className="admin-help-text">
          Update an existing section, including its optional image.
        </p>

        {(!lessonContent || lessonContent.sections.length === 0) && (
          <p className="api-notice">
            Create at least one lesson section before editing sections.
          </p>
        )}

        <form className="admin-form" onSubmit={handleEditSectionSubmit}>
          <label>
            Target section
            <select
              name="sectionKey"
              value={editSectionForm.sectionKey}
              onChange={handleEditSectionTargetChange}
              disabled={!lessonContent || lessonContent.sections.length === 0}
            >
              {lessonContent?.sections.map((section, index) => (
                <option value={section.id} key={section.id}>
                  {index + 1}. {section.title} ({section.type})
                </option>
              ))}
            </select>
          </label>

          <div className="admin-form-row">
            <label>
              Section type
              <select
                name="type"
                value={editSectionForm.type}
                onChange={handleEditSectionInputChange}
                disabled={!lessonContent || lessonContent.sections.length === 0}
              >
                {sectionTypeOptions.map((sectionType) => (
                  <option value={sectionType} key={sectionType}>
                    {sectionType}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Section title
              <input
                name="title"
                value={editSectionForm.title}
                onChange={handleEditSectionInputChange}
                disabled={!lessonContent || lessonContent.sections.length === 0}
              />
            </label>
          </div>

          <label>
            Paragraphs
            <textarea
              name="paragraphsText"
              value={editSectionForm.paragraphsText}
              onChange={handleEditSectionInputChange}
              rows={5}
              placeholder="Write one paragraph per line"
              disabled={!lessonContent || lessonContent.sections.length === 0}
            />
          </label>

          <label>
            Code block
            <textarea
              name="code"
              value={editSectionForm.code}
              onChange={handleEditSectionInputChange}
              rows={6}
              placeholder="Optional code block"
              disabled={!lessonContent || lessonContent.sections.length === 0}
            />
          </label>

          <label>
            Output block
            <textarea
              name="output"
              value={editSectionForm.output}
              onChange={handleEditSectionInputChange}
              rows={4}
              placeholder="Optional output block"
              disabled={!lessonContent || lessonContent.sections.length === 0}
            />
          </label>

          <div className="admin-form-row">
            <label>
              Section image URL
              <input
                name="imageUrl"
                value={editSectionForm.imageUrl}
                onChange={handleEditSectionInputChange}
                placeholder="/lesson-images/lesson1_cups.png"
                disabled={!lessonContent || lessonContent.sections.length === 0}
              />
            </label>

            <label>
              Section image alt text
              <input
                name="imageAlt"
                value={editSectionForm.imageAlt}
                onChange={handleEditSectionInputChange}
                placeholder="Illustration for this lesson section"
                disabled={!lessonContent || lessonContent.sections.length === 0}
              />
            </label>

            <label>
              Image position
              <select
                name="imagePosition"
                value={editSectionForm.imagePosition}
                onChange={handleEditSectionInputChange}
                disabled={!lessonContent || lessonContent.sections.length === 0}
              >
                {imagePositionOptions.map((position) => (
                  <option value={position} key={position}>
                    {position === "after_code" ? "after code/output" : position}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="submit"
            className="button button-primary"
            disabled={
              !lessonContent ||
              lessonContent.sections.length === 0 ||
              isUpdatingSection
            }
          >
            {isUpdatingSection ? "Saving..." : "Save section changes"}
          </button>

          {editSectionMessage && (
            <p className="admin-status-message">{editSectionMessage}</p>
          )}
        </form>
      </section>

      {lessonContent && (
  <AdminLessonBlockEditor
    lessonSlug={lesson.slug}
    lessonContent={lessonContent}
    onLessonContentChange={setLessonContent}
  />
)}

      {showLegacyEditor && (
<section className="admin-edit-panel">
        <h2>Add item to section</h2>

        <p className="admin-help-text">
          Add an item to an existing section. This is useful for interview
          questions, practice tasks, traps, and answer key entries.
        </p>

        {(!lessonContent || lessonContent.sections.length === 0) && (
          <p className="api-notice">
            Create at least one lesson section before adding items.
          </p>
        )}

        <form className="admin-form" onSubmit={handleItemSubmit}>
          <label>
            Target section
            <select
              name="sectionKey"
              value={itemForm.sectionKey}
              onChange={handleItemInputChange}
              disabled={!lessonContent || lessonContent.sections.length === 0}
            >
              {lessonContent?.sections.map((section, index) => (
                <option value={section.id} key={section.id}>
                  {index + 1}. {section.title} ({section.type})
                </option>
              ))}
            </select>
          </label>

          <label>
            Item title
            <input
              name="title"
              value={itemForm.title}
              onChange={handleItemInputChange}
              placeholder="Optional item title"
              disabled={!lessonContent || lessonContent.sections.length === 0}
            />
          </label>

          <label>
            Content
            <textarea
              name="content"
              value={itemForm.content}
              onChange={handleItemInputChange}
              rows={5}
              placeholder="Item content before code/output"
              disabled={!lessonContent || lessonContent.sections.length === 0}
            />
          </label>

          <label>
            Code
            <textarea
              name="code"
              value={itemForm.code}
              onChange={handleItemInputChange}
              rows={6}
              placeholder="Optional code block"
              disabled={!lessonContent || lessonContent.sections.length === 0}
            />
          </label>

          <label>
            Output
            <textarea
              name="output"
              value={itemForm.output}
              onChange={handleItemInputChange}
              rows={4}
              placeholder="Optional output or correct answer"
              disabled={!lessonContent || lessonContent.sections.length === 0}
            />
          </label>

          <label>
            Text after code/output
            <textarea
              name="afterText"
              value={itemForm.afterText}
              onChange={handleItemInputChange}
              rows={4}
              placeholder="Optional explanation shown after the code/output"
              disabled={!lessonContent || lessonContent.sections.length === 0}
            />
          </label>

          <div className="admin-form-row">
            <label>
              Item image URL
              <input
                name="imageUrl"
                value={itemForm.imageUrl}
                onChange={handleItemInputChange}
                placeholder="/lesson-images/lesson1_receipt.png"
                disabled={!lessonContent || lessonContent.sections.length === 0}
              />
            </label>

            <label>
              Item image alt text
              <input
                name="imageAlt"
                value={itemForm.imageAlt}
                onChange={handleItemInputChange}
                placeholder="Illustration for this practice item"
                disabled={!lessonContent || lessonContent.sections.length === 0}
              />
            </label>
          </div>

          <button
            type="submit"
            className="button button-primary"
            disabled={
              !lessonContent ||
              lessonContent.sections.length === 0 ||
              isCreatingItem
            }
          >
            {isCreatingItem ? "Creating..." : "Add item"}
          </button>

          {itemMessage && (
            <p className="admin-status-message">{itemMessage}</p>
          )}
        </form>
      </section>
      )}

      {showLegacyEditor && (
      <section className="admin-edit-panel">
        <h2>Edit existing item</h2>

        <p className="admin-help-text">
          Update an existing item, including its optional image and after-text.
        </p>

        {editableItems.length === 0 && (
          <p className="api-notice">
            Add at least one editable item before using this form.
          </p>
        )}

        <form className="admin-form" onSubmit={handleEditItemSubmit}>
          <label>
            Target item
            <select
              value={`${editItemForm.sectionKey}::${editItemForm.itemId}`}
              onChange={handleEditItemTargetChange}
              disabled={editableItems.length === 0}
            >
              {editableItems.map((entry) => (
                <option
                  value={`${entry.sectionKey}::${entry.item.id}`}
                  key={`${entry.sectionKey}-${entry.item.id}`}
                >
                  {entry.sectionTitle} — {entry.item.title || "Untitled item"}
                </option>
              ))}
            </select>
          </label>

          <label>
            Item title
            <input
              name="title"
              value={editItemForm.title}
              onChange={handleEditItemInputChange}
              disabled={editableItems.length === 0}
            />
          </label>

          <label>
            Content
            <textarea
              name="content"
              value={editItemForm.content}
              onChange={handleEditItemInputChange}
              rows={5}
              disabled={editableItems.length === 0}
            />
          </label>

          <label>
            Code
            <textarea
              name="code"
              value={editItemForm.code}
              onChange={handleEditItemInputChange}
              rows={6}
              disabled={editableItems.length === 0}
            />
          </label>

          <label>
            Output
            <textarea
              name="output"
              value={editItemForm.output}
              onChange={handleEditItemInputChange}
              rows={4}
              disabled={editableItems.length === 0}
            />
          </label>

          <label>
            Text after code/output
            <textarea
              name="afterText"
              value={editItemForm.afterText}
              onChange={handleEditItemInputChange}
              rows={4}
              placeholder="Optional explanation shown after the code/output"
              disabled={editableItems.length === 0}
            />
          </label>

          <div className="admin-form-row">
            <label>
              Item image URL
              <input
                name="imageUrl"
                value={editItemForm.imageUrl}
                onChange={handleEditItemInputChange}
                placeholder="/lesson-images/lesson1_receipt.png"
                disabled={editableItems.length === 0}
              />
            </label>

            <label>
              Item image alt text
              <input
                name="imageAlt"
                value={editItemForm.imageAlt}
                onChange={handleEditItemInputChange}
                placeholder="Illustration for this practice item"
                disabled={editableItems.length === 0}
              />
            </label>
          </div>

          <button
            type="submit"
            className="button button-primary"
            disabled={editableItems.length === 0 || isUpdatingItem}
          >
            {isUpdatingItem ? "Saving..." : "Save item changes"}
          </button>

          {editItemMessage && (
            <p className="admin-status-message">{editItemMessage}</p>
          )}
        </form>
      </section>
      )}

      {showLegacyEditor && (
      <section className="admin-edit-panel">
        <h2>Section table</h2>

        <p className="admin-help-text">
          Add or replace a table for a section. Headers and row cells are split
          with the pipe character.
        </p>

        <form className="admin-form" onSubmit={handleTableSubmit}>
          <label>
            Target section
            <select
              name="sectionKey"
              value={tableForm.sectionKey}
              onChange={handleTableInputChange}
              disabled={!lessonContent || lessonContent.sections.length === 0}
            >
              {lessonContent?.sections.map((section, index) => (
                <option value={section.id} key={section.id}>
                  {index + 1}. {section.title} ({section.type})
                </option>
              ))}
            </select>
          </label>

          <label>
            Headers
            <textarea
              name="headersText"
              value={tableForm.headersText}
              onChange={handleTableInputChange}
              rows={2}
              placeholder="Concept | Meaning"
              disabled={!lessonContent || lessonContent.sections.length === 0}
            />
          </label>

          <label>
            Rows
            <textarea
              name="rowsText"
              value={tableForm.rowsText}
              onChange={handleTableInputChange}
              rows={6}
              placeholder={`Variable | A name that refers to a value
Assignment | Binding a name to a value`}
              disabled={!lessonContent || lessonContent.sections.length === 0}
            />
          </label>

          <button
            type="submit"
            className="button button-primary"
            disabled={
              !lessonContent ||
              lessonContent.sections.length === 0 ||
              isSavingTable
            }
          >
            {isSavingTable ? "Saving..." : "Save table"}
          </button>

          {tableMessage && (
            <p className="admin-status-message">{tableMessage}</p>
          )}
        </form>
      </section>

      )}

      <section className="admin-edit-panel">
        <h2>Current lesson structure</h2>

        {deleteSectionMessage && (
          <p className="admin-status-message">{deleteSectionMessage}</p>
        )}

        {lessonContent && lessonContent.sections.length > 0 ? (
          <div className="admin-section-list">
            {lessonContent.sections.map((section, index) => (
              <article className="admin-section-card" key={section.id}>
                <div className="admin-section-card-header">
                  <div>
                    <p className="eyebrow">
                      {index + 1}. {section.type}
                    </p>
                    <h3>{section.title}</h3>
                  </div>

                  <button
                    type="button"
                    className="button button-secondary"
                    disabled={deletingSectionKey === section.id}
                    onClick={() => handleDeleteSection(section.id)}
                  >
                    {deletingSectionKey === section.id
                      ? "Deleting..."
                      : "Delete section"}
                  </button>
                </div>

                <ul>
                  <li>Blocks: {section.blocks?.length ?? 0}</li>
                  <li>Section type: {section.type}</li>
                  <li>Legacy paragraphs: {section.paragraphs?.length ?? 0}</li>
                  <li>Legacy items: {section.items?.length ?? 0}</li>
                  <li>Legacy table: {section.table ? "yes" : "no"}</li>
                </ul>

                {showLegacyEditor && section.items && section.items.length > 0 && (
                  <div className="admin-item-list">
                    <h4>Items</h4>

                    {section.items.map((item) => (
                      <div className="admin-item-row" key={item.id}>
                        <span>
                          {item.title || "Untitled item"}
                          {item.afterText ? " · after text" : ""}
                          {item.imageUrl ? " · image" : ""}
                        </span>

                        <button
                          type="button"
                          className="button button-secondary"
                          disabled={!item.id || deletingItemId === item.id}
                          onClick={() => handleDeleteItem(section.id, item.id)}
                        >
                          {deletingItemId === item.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p>No sections yet.</p>
        )}
      </section>
    </main>
  );
}

export default AdminLessonDetailPage;