import { Link } from "react-router-dom";
import type { LessonPreview, LessonStatus } from "../types/curriculum";

interface LessonCardProps {
  lesson: LessonPreview;
  isCompleted?: boolean;
  isNextLesson?: boolean;
}

const statusLabels: Record<LessonStatus, string> = {
  published: "Ready",
  in_progress: "In progress",
  coming_soon: "Coming soon",
  planned: "Planned",
  premium: "Premium",
};

const statusIcons: Record<LessonStatus, string> = {
  published: "✓",
  in_progress: "⏳",
  coming_soon: "🧁",
  planned: "○",
  premium: "🔒",
};

const actionLabels: Record<LessonStatus, string> = {
  published: "Open lesson",
  in_progress: "Preview",
  coming_soon: "Coming soon",
  planned: "Roadmap only",
  premium: "Locked",
};

function LessonCard({
  lesson,
  isCompleted = false,
  isNextLesson = false,
}: LessonCardProps) {
  const isClickable =
    lesson.status === "published" || lesson.status === "in_progress";

  let actionLabel = actionLabels[lesson.status];

  if (isCompleted) {
    actionLabel = "Review lesson";
  } else if (isNextLesson && lesson.status === "published") {
    actionLabel = "Continue here";
  }

  const cardClassName = `lesson-card lesson-card-${lesson.status} ${
    isCompleted ? "lesson-card-completed" : ""
  } ${isNextLesson ? "lesson-card-next" : ""}`;

  const cardContent = (
    <>
      <div className="lesson-card-main">
        <div className="lesson-card-top">
          <span className="lesson-order">Lesson {lesson.order}</span>

          <span className={`status status-${lesson.status}`}>
            {statusLabels[lesson.status]}
          </span>

          {isNextLesson && !isCompleted && (
            <span className="next-badge">Next step</span>
          )}

          {isCompleted && <span className="completed-badge">Completed</span>}
        </div>

        <h2>
          <span className="lesson-status-icon">
            {isCompleted ? "✅" : statusIcons[lesson.status]}
          </span>{" "}
          {lesson.title}
        </h2>

        <p>{lesson.shortDescription}</p>
      </div>

      <div className="lesson-card-footer">
        <p className="lesson-meta">
          {lesson.difficulty} · {lesson.estimatedTime}
        </p>

        <span
          className={`lesson-action ${
            isCompleted
              ? "lesson-action-completed"
              : isNextLesson
              ? "lesson-action-next"
              : `lesson-action-${lesson.status}`
          }`}
        >
          {actionLabel}
        </span>
      </div>
    </>
  );

  if (!isClickable) {
    return (
      <article className={`${cardClassName} lesson-card-static`}>
        {cardContent}
      </article>
    );
  }

  return (
    <Link
      to={`/lessons/${lesson.slug}`}
      className={`${cardClassName} lesson-card-clickable`}
    >
      {cardContent}
    </Link>
  );
}

export default LessonCard;