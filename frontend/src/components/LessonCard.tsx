import { Link } from "react-router-dom";
import type { LessonPreview, LessonStatus } from "../types/curriculum";

interface LessonCardProps {
  lesson: LessonPreview;
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

function LessonCard({ lesson }: LessonCardProps) {
  const isClickable = lesson.status !== "planned";

  const cardContent = (
    <>
      <div className="lesson-card-main">
        <div className="lesson-card-top">
          <span className="lesson-order">Lesson {lesson.order}</span>

          <span className={`status status-${lesson.status}`}>
            {statusLabels[lesson.status]}
          </span>
        </div>

        <h2>
          <span className="lesson-status-icon">{statusIcons[lesson.status]}</span>{" "}
          {lesson.title}
        </h2>

        <p>{lesson.shortDescription}</p>
      </div>

      <div className="lesson-card-footer">
        <p className="lesson-meta">
          {lesson.difficulty} · {lesson.estimatedTime}
        </p>

        <span className={`lesson-action lesson-action-${lesson.status}`}>
          {actionLabels[lesson.status]}
        </span>
      </div>
    </>
  );

  if (!isClickable) {
    return (
      <article className={`lesson-card lesson-card-${lesson.status} lesson-card-static`}>
        {cardContent}
      </article>
    );
  }

  return (
    <Link
      to={`/lessons/${lesson.slug}`}
      className={`lesson-card lesson-card-${lesson.status} lesson-card-clickable`}
    >
      {cardContent}
    </Link>
  );
}

export default LessonCard;