import { Link } from "react-router-dom";
import type { LessonPreview } from "../types/curriculum";

interface LessonNavigationProps {
  trackSlug: string;
  previousLesson?: LessonPreview;
  nextLesson?: LessonPreview;
}

function LessonNavigation({
  trackSlug,
  previousLesson,
  nextLesson,
}: LessonNavigationProps) {
  return (
    <nav className="lesson-navigation" aria-label="Lesson navigation">
      <Link to={`/tracks/${trackSlug}`} className="lesson-nav-card">
        <span>Back to track</span>
        <strong>View roadmap</strong>
      </Link>

      {previousLesson ? (
        <Link
          to={`/lessons/${previousLesson.slug}`}
          className="lesson-nav-card"
        >
          <span>Previous lesson</span>
          <strong>{previousLesson.title}</strong>
        </Link>
      ) : (
        <div className="lesson-nav-card lesson-nav-card-disabled">
          <span>Previous lesson</span>
          <strong>Start of track</strong>
        </div>
      )}

      {nextLesson ? (
        <Link to={`/lessons/${nextLesson.slug}`} className="lesson-nav-card">
          <span>Next lesson</span>
          <strong>{nextLesson.title}</strong>
        </Link>
      ) : (
        <div className="lesson-nav-card lesson-nav-card-disabled">
          <span>Next lesson</span>
          <strong>More lessons coming soon</strong>
        </div>
      )}
    </nav>
  );
}

export default LessonNavigation;