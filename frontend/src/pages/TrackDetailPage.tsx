import { Link, useParams } from "react-router-dom";
import { getTrackBySlug } from "../data/tracks";
import { getLessonsByTrackSlug } from "../data/lessons";

function TrackDetailPage() {
  const { trackSlug } = useParams();

  const track = trackSlug ? getTrackBySlug(trackSlug) : undefined;
  const trackLessons = trackSlug ? getLessonsByTrackSlug(trackSlug) : [];

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

      {trackLessons.length > 0 ? (
        <section className="lesson-list">
          {trackLessons.map((lesson) => (
            <Link
              to={`/lessons/${lesson.slug}`}
              className="lesson-card"
              key={lesson.slug}
            >
              <div>
                <span className={`status status-${lesson.status}`}>
                  {lesson.status.replace("_", " ")}
                </span>

                <h2>
                  {lesson.order}. {lesson.title}
                </h2>

                <p>{lesson.shortDescription}</p>
              </div>

              <p className="lesson-meta">
                {lesson.difficulty} · {lesson.estimatedTime}
              </p>
            </Link>
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