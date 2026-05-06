import { Link } from "react-router-dom";
import { getLessonsByTrackSlug } from "../data/lessons";
import type { Track } from "../types/curriculum";

interface TrackCardProps {
  track: Track;
}

function TrackCard({ track }: TrackCardProps) {
  const trackLessons = getLessonsByTrackSlug(track.slug);

  const readyLessons = trackLessons.filter(
    (lesson) => lesson.status === "published"
  ).length;

  const visibleLessonsCount = trackLessons.length || track.lessonCount;

  const availabilityPercent =
    visibleLessonsCount > 0
      ? Math.round((readyLessons / visibleLessonsCount) * 100)
      : 0;

  const hasReadyLessons = readyLessons > 0;

  const statusLabel = hasReadyLessons ? "Start learning" : "Coming soon";
  const statusClassName = hasReadyLessons ? "status-published" : "status-planned";

  return (
    <Link to={`/tracks/${track.slug}`} className="track-card">
      <div className="track-card-header">
        <span className={`status ${statusClassName}`}>{statusLabel}</span>

        <span className="track-progress-percent">
          {readyLessons}/{visibleLessonsCount} ready
        </span>
      </div>

      <h2>{track.title}</h2>

      <p>{track.description}</p>

      <div className="track-progress">
        <div className="track-progress-bar">
          <span style={{ width: `${availabilityPercent}%` }} />
        </div>

        <p>
          {hasReadyLessons
            ? `${readyLessons} lesson${readyLessons === 1 ? "" : "s"} available now`
            : "This path is planned for a future update"}
        </p>
      </div>

      <p className="lesson-count">
        {hasReadyLessons ? "Open track →" : `${track.lessonCount} lessons planned`}
      </p>
    </Link>
  );
}

export default TrackCard;