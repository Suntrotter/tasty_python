import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchLessonContentBySlug } from "../../api/lessonContentApi";
import { fetchLessonBySlug } from "../../api/lessonsApi";
import { getLessonBySlug } from "../../data/lessons";
import { getLessonContentBySlug } from "../../data/lessonContent";
import type { LessonPreview, LessonStatus } from "../../types/curriculum";
import type { LessonContent } from "../../types/lesson";
import { updateLessonStatus } from "../../api/adminApi";

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
  setLesson(getLessonBySlug(lessonSlug));
  setLessonContent(getLessonContentBySlug(lessonSlug));
  setErrorMessage("Backend is not available. Showing local demo data.");
} finally {
  setIsLoading(false);
}
    }

    loadLessonData();
  }, [lessonSlug]);

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

    {statusMessage && <p className="admin-status-message">{statusMessage}</p>}
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
            </dl>
          ) : (
            <p>No full lesson content has been added yet.</p>
          )}
        </article>
      </section>

      {lessonContent && (
        <section className="admin-sections-preview">
          <h2>Lesson sections</h2>

          <div className="admin-section-list">
            {lessonContent.sections.map((section, index) => (
              <article className="admin-section-card" key={section.id}>
                <div>
                  <p className="eyebrow">Section {index + 1}</p>
                  <h3>{section.title}</h3>
                  <p>
                    Type: <strong>{section.type}</strong>
                  </p>
                </div>

                <ul>
                  <li>Paragraphs: {section.paragraphs?.length ?? 0}</li>
                  <li>Items: {section.items?.length ?? 0}</li>
                  <li>Code block: {section.code ? "yes" : "no"}</li>
                  <li>Output block: {section.output ? "yes" : "no"}</li>
                  <li>Table: {section.table ? "yes" : "no"}</li>
                </ul>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default AdminLessonDetailPage;