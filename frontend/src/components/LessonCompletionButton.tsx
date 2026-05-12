import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { useLessonProgress } from "../features/progress/useLessonProgress";
import type { LessonPreview } from "../types/curriculum";

interface LessonCompletionButtonProps {
  lessonSlug: string;
  trackSlug: string;
  nextLesson?: LessonPreview;
  completionImageUrl?: string;
  completionImageAlt?: string;
  completionKicker?: string;
  completionTitle?: string;
  completionBody?: string;
}

const defaultCompletionImage = {
  src: "/lesson-images/lesson1_completion.png",
  alt: "Cozy celebration scene for completing a Python lesson.",
};

const defaultCompletionText = {
  kicker: "Lesson complete",
  title: "Delicious progress. Lesson completed.",
  body: `You’ve cooked this Python concept successfully. The main idea, examples, traps, and practice tasks are all plated and ready.

If this lesson feels clear, you’re in a very good place. Ready for the next bite?`,
};

function renderCompletionBody(body: string) {
  return body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => (
      <p key={`completion-body-${index}`}>{paragraph}</p>
    ));
}

function LessonCompletionButton({
  lessonSlug,
  trackSlug,
  nextLesson,
  completionImageUrl,
  completionImageAlt,
  completionKicker,
  completionTitle,
  completionBody,
}: LessonCompletionButtonProps) {
  const { currentUser, isAuthLoading } = useAuth();

  const {
    isLessonCompleted,
    isProgressLoading,
    progressSource,
    toggleLessonCompletion,
  } = useLessonProgress();

  const [isUpdating, setIsUpdating] = useState(false);

  const completed = isLessonCompleted(lessonSlug);

  const imageSrc = completionImageUrl || defaultCompletionImage.src;
  const imageAlt = completionImageAlt || defaultCompletionImage.alt;

  const kicker = completionKicker || defaultCompletionText.kicker;
  const title = completionTitle || defaultCompletionText.title;
  const body = completionBody || defaultCompletionText.body;

  const isCheckingProgress = isAuthLoading || isProgressLoading;

  function getProgressMessage() {
    if (isCheckingProgress) {
      return "Checking your progress...";
    }

    if (!currentUser) {
      return completed
        ? "Marked locally on this device. Sign in to save progress across devices."
        : "You can mark this lesson locally, but sign in to save progress across devices.";
    }

    if (progressSource === "backend") {
      return completed
        ? "Saved to your account."
        : "Your progress will be saved to your account.";
    }

    if (progressSource === "local") {
      return "Backend progress is not available right now. Changes are saved locally on this device.";
    }

    return "Progress is being prepared.";
  }

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
        <img src={imageSrc} alt={imageAlt} />
      </div>

      <div className="completion-content">
        <p className="completion-kicker">{kicker}</p>

        <h2>{title}</h2>

        {renderCompletionBody(body)}

        <p className="completion-progress-note">{getProgressMessage()}</p>

        {!currentUser && !isAuthLoading && (
          <div className="completion-auth-actions">
            <Link to="/login" className="completion-auth-link">
              Sign in to save progress
            </Link>
          </div>
        )}

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