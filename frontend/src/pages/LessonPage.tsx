import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchLessonContentBySlug } from "../api/lessonContentApi";
import { fetchLessonBySlug } from "../api/lessonsApi";
import LessonCompletionButton from "../components/LessonCompletionButton";
import LessonNavigation from "../components/LessonNavigation";
import LessonSectionRenderer from "../components/LessonSectionRenderer";
import { getLessonBySlug, getLessonNavigation } from "../data/lessons";
import { getLessonContentBySlug } from "../data/lessonContent";
import type { LessonPreview } from "../types/curriculum";
import type { LessonContent } from "../types/lesson";

function LessonPage() {
  const { lessonSlug } = useParams();

  const [lesson, setLesson] = useState<LessonPreview | undefined>(undefined);
  const [lessonContent, setLessonContent] = useState<
    LessonContent | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const { previousLesson, nextLesson } = lessonSlug
    ? getLessonNavigation(lessonSlug)
    : { previousLesson: undefined, nextLesson: undefined };

  useEffect(() => {
    async function loadLesson() {
      if (!lessonSlug) {
        setIsLoading(false);
        return;
      }

      try {
        const [lessonFromApi, lessonContentFromApi] = await Promise.all([
          fetchLessonBySlug(lessonSlug),
          fetchLessonContentBySlug(lessonSlug),
        ]);

        setLesson(lessonFromApi);
        setLessonContent(lessonContentFromApi);
        setErrorMessage("");
      } catch {
        const localLesson = getLessonBySlug(lessonSlug);
        const localLessonContent = getLessonContentBySlug(lessonSlug);

        setLesson(localLesson);
        setLessonContent(localLessonContent);
        setErrorMessage(
          "Backend is not available right now. Showing local demo data."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadLesson();
  }, [lessonSlug]);

  if (isLoading) {
    return (
      <main className="page">
        <section className="loading-box">
          <h1>Loading lesson...</h1>
          <p>Fetching lesson data from the backend API.</p>
        </section>
      </main>
    );
  }

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

          {errorMessage && <p className="api-notice">{errorMessage}</p>}

          <p>
            This lesson is visible in the roadmap, but the full content is not
            published yet.
          </p>
        </section>

        <LessonNavigation
          trackSlug={lesson.trackSlug}
          previousLesson={previousLesson}
          nextLesson={nextLesson}
        />
      </main>
    );
  }

  if (!lessonContent) {
    return (
      <main className="page">
        <section className="coming-soon-box">
          <h1>{lesson.title}</h1>

          {errorMessage && <p className="api-notice">{errorMessage}</p>}

          <p>
            This lesson is marked as published, but its full content has not
            been added yet.
          </p>
        </section>

        <LessonNavigation
          trackSlug={lesson.trackSlug}
          previousLesson={previousLesson}
          nextLesson={nextLesson}
        />
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

        {errorMessage && <p className="api-notice">{errorMessage}</p>}
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

      <LessonCompletionButton lessonSlug={lesson.slug} />

      <LessonNavigation
        trackSlug={lesson.trackSlug}
        previousLesson={previousLesson}
        nextLesson={nextLesson}
      />
    </main>
  );
}

export default LessonPage;