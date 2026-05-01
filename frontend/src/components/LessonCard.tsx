import { Link } from "react-router-dom";
import type { LessonPreview, LessonStatus } from "../types/curriculum";

interface LessonCardProps {
  lesson: LessonPreview;
  isCompleted?: boolean;
}

const statusLabels: Record<LessonStatus, string> = {
  published: "Published",
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
  published: "Start lesson",
  in_progress: "Preview",
  coming_soon: "Coming soon",
  planned: "Roadmap only",
  premium: "Locked",
};

function LessonCard({ lesson, isCompleted = false }: LessonCardProps) {
  const isClickable = lesson.status !== "planned";

  const actionLabel = isCompleted ? "Completed" : actionLabels[lesson.status];

  const cardContent = (
    <>
      <div className="lesson-card-main">
        <div className="lesson-card-top">
          <span className="lesson-order">Lesson {lesson.order}</span>

          <span className={`status status-${lesson.status}`}>
            {statusLabels[lesson.status]}
          </span>

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
              : `lesson-action-${lesson.status}`
          }`}
        >
          {actionLabel}
        </span>
      </div>
    </>
  );

  const cardClassName = `lesson-card lesson-card-${lesson.status} ${
    isCompleted ? "lesson-card-completed" : ""
  }`;

  if (!isClickable) {
    return (
      <article className={`${cardClassName} lesson-card-static`}>
        {cardContent}
      </article>
    );
  }

  return (
    <Link to={`/lessons/${lesson.slug}`} className={`${cardClassName} lesson-card-clickable`}>
      {cardContent}
    </Link>
  );
}

export default LessonCard;