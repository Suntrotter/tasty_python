import { Link, useParams } from "react-router-dom";
import LessonSectionRenderer from "../components/LessonSectionRenderer";
import { getLessonBySlug } from "../data/lessons";
import { getLessonContentBySlug } from "../data/lessonContent";

function LessonPage() {
  const { lessonSlug } = useParams();

  const lesson = lessonSlug ? getLessonBySlug(lessonSlug) : undefined;
  const lessonContent = lessonSlug
    ? getLessonContentBySlug(lessonSlug)
    : undefined;

  if (!lesson) {
    return (
      <main className="page">
        <h1>Lesson not found</h1>
        <p>This lesson does not exist yet.</p>
        <Link to="/tracks" className="button button-primary">
          Back to tracks
        </Link>
      </main>
    );
  }

  if (lesson.status !== "published") {
    return (
      <main className="page">
        <section className="coming-soon-box">
          <span className={`status status-${lesson.status}`}>
            {lesson.status.replace("_", " ")}
          </span>

          <h1>{lesson.title}</h1>

          <p>{lesson.shortDescription}</p>

          <p>
            This lesson is visible in the roadmap, but the full content is not
            published yet.
          </p>

          <Link
            to={`/tracks/${lesson.trackSlug}`}
            className="button button-primary"
          >
            Back to track
          </Link>
        </section>
      </main>
    );
  }

  if (!lessonContent) {
    return (
      <main className="page">
        <section className="coming-soon-box">
          <h1>{lesson.title}</h1>
          <p>
            This lesson is marked as published, but its full content has not
            been added yet.
          </p>

          <Link
            to={`/tracks/${lesson.trackSlug}`}
            className="button button-primary"
          >
            Back to track
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page lesson-page">
      <section className="lesson-hero">
        <p className="eyebrow">Lesson {lesson.order}</p>
        <h1>{lessonContent.title}</h1>

        <p className="lesson-meta">
          {lesson.difficulty} · {lesson.estimatedTime}
        </p>

        <p>{lessonContent.goal}</p>
      </section>

      {lessonContent.imagePrompts && (
        <section className="lesson-section">
          <h2>Image Prompts</h2>
          <p>
            These prompts are placeholders for future illustrations and visual
            assets.
          </p>

          <ul className="image-prompt-list">
            {lessonContent.imagePrompts.map((prompt) => (
              <li key={prompt}>{prompt}</li>
            ))}
          </ul>
        </section>
      )}

      {lessonContent.sections.map((section) => (
        <LessonSectionRenderer section={section} key={section.id} />
      ))}
    </main>
  );
}

export default LessonPage;