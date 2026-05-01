import { Link, useParams } from "react-router-dom";
import LessonCard from "../components/LessonCard";
import { getLessonsByTrackSlug } from "../data/lessons";
import { getTrackBySlug } from "../data/tracks";

function TrackDetailPage() {
  const { trackSlug } = useParams();

  const track = trackSlug ? getTrackBySlug(trackSlug) : undefined;
  const trackLessons = trackSlug ? getLessonsByTrackSlug(trackSlug) : [];

  const publishedLessons = trackLessons.filter(
    (lesson) => lesson.status === "published"
  ).length;

  const inProgressLessons = trackLessons.filter(
    (lesson) => lesson.status === "in_progress"
  ).length;

  const plannedLessons = trackLessons.filter(
    (lesson) => lesson.status === "planned"
  ).length;

  if (!track) {
    return (
      <main className="page">
        <h1>Track not found</h1>
        <p>This track does not exist yet.</p>
        <Link to="/tracks" className="button button-primary">
          Back to tracks
        </Link>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="page-intro">
        <p className="eyebrow">Track</p>
        <h1>{track.title}</h1>
        <p>{track.description}</p>
      </section>

      {trackLessons.length > 0 && (
        <section className="track-summary">
          <article>
            <strong>{trackLessons.length}</strong>
            <span>Total lessons</span>
          </article>

          <article>
            <strong>{publishedLessons}</strong>
            <span>Published</span>
          </article>

          <article>
            <strong>{inProgressLessons}</strong>
            <span>In progress</span>
          </article>

          <article>
            <strong>{plannedLessons}</strong>
            <span>Planned</span>
          </article>
        </section>
      )}

      {trackLessons.length > 0 ? (
        <section className="lesson-list">
          {trackLessons.map((lesson) => (
            <LessonCard lesson={lesson} key={lesson.slug} />
          ))}
        </section>
      ) : (
        <section className="coming-soon-box">
          <h2>This track is currently under development.</h2>
          <p>
            Planned lessons will appear here as the curriculum grows. The track
            is visible now to show the full learning roadmap.
          </p>
        </section>
      )}
    </main>
  );
}

export default TrackDetailPage;