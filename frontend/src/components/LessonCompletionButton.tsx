import { useState } from "react";
import { Link } from "react-router-dom";
import { useLessonProgress } from "../features/progress/useLessonProgress";
import type { LessonPreview } from "../types/curriculum";

interface LessonCompletionButtonProps {
  lessonSlug: string;
  trackSlug: string;
  nextLesson?: LessonPreview;
}

function LessonCompletionButton({
  lessonSlug,
  trackSlug,
  nextLesson,
}: LessonCompletionButtonProps) {
  const { isLessonCompleted, isProgressLoading, toggleLessonCompletion } =
    useLessonProgress();

  const [isUpdating, setIsUpdating] = useState(false);

  const completed = isLessonCompleted(lessonSlug);

  async function handleToggleCompletion() {
    setIsUpdating(true);

    try {
      await toggleLessonCompletion(lessonSlug);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <section
      className={`completion-box completion-celebration ${
        completed ? "completion-box-done" : ""
      }`}
    >
      <div className="completion-image-wrap">
        <img
          src="/lesson-images/lesson1_completion.png"
          alt="Cozy celebration scene for completing a Python lesson."
        />
      </div>

      <div className="completion-content">
        <p className="completion-kicker">Lesson complete</p>

        <h2>Delicious progress. Lesson 1 completed.</h2>

        <p>
          You’ve cooked your first Python concept successfully. Variables,
          assignment, reassignment — all plated and ready.
        </p>

        <p>
          If this lesson feels clear, you’re in a very good place. Ready for the
          next bite?
        </p>

        <div className="completion-actions">
          <button
            type="button"
            className="button button-primary"
            disabled={isProgressLoading || isUpdating}
            onClick={handleToggleCompletion}
          >
            {isUpdating
              ? "Saving..."
              : completed
              ? "Completed ✓"
              : "Mark as completed"}
          </button>

          {nextLesson ? (
            <Link to={`/lessons/${nextLesson.slug}`} className="button">
              Continue to next lesson
            </Link>
          ) : (
            <Link to={`/tracks/${trackSlug}`} className="button">
              Back to track
            </Link>
          )}

          <Link to={`/tracks/${trackSlug}`} className="completion-small-link">
            Back to track
          </Link>
        </div>
      </div>
    </section>
  );
}

export default LessonCompletionButton;