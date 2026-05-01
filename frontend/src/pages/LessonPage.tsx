import { Link, useParams } from "react-router-dom";
import LessonNavigation from "../components/LessonNavigation";
import LessonSectionRenderer from "../components/LessonSectionRenderer";
import { getLessonBySlug, getLessonNavigation } from "../data/lessons";
import { getLessonContentBySlug } from "../data/lessonContent";
import LessonCompletionButton from "../components/LessonCompletionButton";

function LessonPage() {
  const { lessonSlug } = useParams();

  const lesson = lessonSlug ? getLessonBySlug(lessonSlug) : undefined;

  const lessonContent = lessonSlug
    ? getLessonContentBySlug(lessonSlug)
    : undefined;

  const { previousLesson, nextLesson } = lessonSlug
    ? getLessonNavigation(lessonSlug)
    : { previousLesson: undefined, nextLesson: undefined };

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