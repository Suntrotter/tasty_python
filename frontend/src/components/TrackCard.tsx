import { Link } from "react-router-dom";
import { getLessonsByTrackSlug } from "../data/lessons";
import type { Track } from "../types/curriculum";

interface TrackCardProps {
  track: Track;
}

function TrackCard({ track }: TrackCardProps) {
  const trackLessons = getLessonsByTrackSlug(track.slug);

  const publishedLessons = trackLessons.filter(
    (lesson) => lesson.status === "published"
  ).length;

  const visibleLessonsCount = trackLessons.length || track.lessonCount;

  const progress =
    visibleLessonsCount > 0
      ? Math.round((publishedLessons / visibleLessonsCount) * 100)
      : 0;

  return (
    <Link to={`/tracks/${track.slug}`} className="track-card">
      <div className="track-card-header">
        <span className={`status status-${track.status}`}>
          {track.status.replace("_", " ")}
        </span>

        <span className="track-progress-percent">{progress}%</span>
      </div>

      <h2>{track.title}</h2>

      <p>{track.description}</p>

      <div className="track-progress">
        <div className="track-progress-bar">
          <span style={{ width: `${progress}%` }} />
        </div>

        <p>
          {publishedLessons} of {visibleLessonsCount} lessons published
        </p>
      </div>

      <p className="lesson-count">{track.lessonCount} lessons planned</p>
    </Link>
  );
}

export default TrackCard;