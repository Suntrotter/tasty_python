import { useState } from "react";
import { useLessonProgress } from "../features/progress/useLessonProgress";

interface LessonCompletionButtonProps {
  lessonSlug: string;
}

function LessonCompletionButton({ lessonSlug }: LessonCompletionButtonProps) {
  const {
    isLessonCompleted,
    isProgressLoading,
    progressSource,
    toggleLessonCompletion,
  } = useLessonProgress();

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

  const sourceLabel =
    progressSource === "backend"
      ? "Saved to backend"
      : progressSource === "local"
      ? "Saved locally"
      : "Checking progress";

  return (
    <div className={`completion-box ${completed ? "completion-box-done" : ""}`}>
      <div>
        <h2>{completed ? "Lesson completed" : "Ready to finish?"}</h2>

        <p>
          {completed
            ? "Nice work. This lesson is saved as completed."
            : "Mark this lesson as completed when you feel you can explain the idea in your own words."}
        </p>

        <p className="progress-source-label">{sourceLabel}</p>
      </div>

      <button
        type="button"
        className="button button-primary"
        disabled={isProgressLoading || isUpdating}
        onClick={handleToggleCompletion}
      >
        {isUpdating
          ? "Saving..."
          : completed
          ? "Mark as not completed"
          : "Mark as completed"}
      </button>
    </div>
  );
}

export default LessonCompletionButton;