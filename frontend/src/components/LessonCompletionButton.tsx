import { useLessonProgress } from "../features/progress/useLessonProgress";

interface LessonCompletionButtonProps {
  lessonSlug: string;
}

function LessonCompletionButton({ lessonSlug }: LessonCompletionButtonProps) {
  const { isLessonCompleted, toggleLessonCompletion } = useLessonProgress();

  const completed = isLessonCompleted(lessonSlug);

  return (
    <div className={`completion-box ${completed ? "completion-box-done" : ""}`}>
      <div>
        <h2>{completed ? "Lesson completed" : "Ready to finish?"}</h2>

        <p>
          {completed
            ? "Nice work. This lesson is saved as completed in your local progress."
            : "Mark this lesson as completed when you feel you can explain the idea in your own words."}
        </p>
      </div>

      <button
        type="button"
        className="button button-primary"
        onClick={() => toggleLessonCompletion(lessonSlug)}
      >
        {completed ? "Mark as not completed" : "Mark as completed"}
      </button>
    </div>
  );
}

export default LessonCompletionButton;