import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchLessonsByTrackSlug } from "../../api/lessonsApi";
import { fetchTrackBySlug } from "../../api/tracksApi";
import { getLessonsByTrackSlug } from "../../data/lessons";
import { getTrackBySlug } from "../../data/tracks";
import type { LessonPreview, Track } from "../../types/curriculum";

function AdminTrackDetailPage() {
  const { trackSlug } = useParams();

  const [track, setTrack] = useState<Track | undefined>(undefined);
  const [trackLessons, setTrackLessons] = useState<LessonPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadTrackData() {
      if (!trackSlug) {
        setIsLoading(false);
        return;
      }

      try {
        const [trackFromApi, lessonsFromApi] = await Promise.all([
          fetchTrackBySlug(trackSlug),
          fetchLessonsByTrackSlug(trackSlug),
        ]);

        setTrack(trackFromApi);
        setTrackLessons(lessonsFromApi);
        setErrorMessage("");
      } catch {
        setTrack(getTrackBySlug(trackSlug));
        setTrackLessons(getLessonsByTrackSlug(trackSlug));
        setErrorMessage("Backend is not available. Showing local demo data.");
      } finally {
        setIsLoading(false);
      }
    }

    loadTrackData();
  }, [trackSlug]);

  const publishedLessons = trackLessons.filter(
    (lesson) => lesson.status === "published"
  ).length;

  const comingSoonLessons = trackLessons.filter(
    (lesson) => lesson.status === "coming_soon"
  ).length;

  const plannedLessons = trackLessons.filter(
    (lesson) => lesson.status === "planned"
  ).length;

  const inProgressLessons = trackLessons.filter(
    (lesson) => lesson.status === "in_progress"
  ).length;

  if (isLoading) {
    return (
      <main className="page">
        <section className="loading-box">
          <h1>Loading track...</h1>
          <p>Fetching track data for admin preview.</p>
        </section>
      </main>
    );
  }

  if (!track) {
    return (
      <main className="page">
        <h1>Track not found</h1>
        <p>This track does not exist.</p>

        <Link to="/admin/tracks" className="button button-primary">
          Back to tracks
        </Link>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="page-intro">
        <p className="eyebrow">Admin track preview</p>
        <h1>{track.title}</h1>
        <p>{track.description}</p>

        {errorMessage && <p className="api-notice">{errorMessage}</p>}

        <div className="hero-actions">
          <Link to="/admin/tracks" className="button button-secondary">
            Back to admin tracks
          </Link>

          <Link to={`/tracks/${track.slug}`} className="button button-primary">
            Open learner track
          </Link>
        </div>
      </section>

      <section className="admin-detail-grid">
        <article className="admin-card">
          <h2>Metadata</h2>

          <dl className="admin-definition-list">
            <div>
              <dt>Slug</dt>
              <dd>{track.slug}</dd>
            </div>

            <div>
              <dt>Status</dt>
              <dd>
                <span className={`status status-${track.status}`}>
                  {track.status.replace("_", " ")}
                </span>
              </dd>
            </div>

            <div>
              <dt>Lessons planned</dt>
              <dd>{track.lessonCount}</dd>
            </div>

            <div>
              <dt>Lessons currently listed</dt>
              <dd>{trackLessons.length}</dd>
            </div>
          </dl>
        </article>

        <article className="admin-card">
          <h2>Lesson status summary</h2>

          <dl className="admin-definition-list">
            <div>
              <dt>Published</dt>
              <dd>{publishedLessons}</dd>
            </div>

            <div>
              <dt>In progress</dt>
              <dd>{inProgressLessons}</dd>
            </div>

            <div>
              <dt>Coming soon</dt>
              <dd>{comingSoonLessons}</dd>
            </div>

            <div>
              <dt>Planned</dt>
              <dd>{plannedLessons}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Title</th>
              <th>Status</th>
              <th>Difficulty</th>
              <th>Time</th>
              <th>Preview</th>
            </tr>
          </thead>

          <tbody>
            {trackLessons.map((lesson) => (
              <tr key={lesson.slug}>
                <td>{lesson.order}</td>
                <td>{lesson.title}</td>
                <td>{lesson.status}</td>
                <td>{lesson.difficulty}</td>
                <td>{lesson.estimatedTime}</td>
                <td>
                  <Link to={`/admin/lessons/${lesson.slug}`}>Preview</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {trackLessons.length === 0 && (
          <p className="admin-empty-note">
            No lessons have been added to this track yet.
          </p>
        )}
      </section>
    </main>
  );
}

export default AdminTrackDetailPage;