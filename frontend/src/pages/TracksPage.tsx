import TrackCard from "../components/TrackCard";
import { tracks } from "../data/tracks";

function TracksPage() {
  const totalTracks = tracks.length;
  const inProgressTracks = tracks.filter(
    (track) => track.status === "in_progress"
  ).length;
  const plannedTracks = tracks.filter((track) => track.status === "planned")
    .length;

  const totalLessons = tracks.reduce(
    (sum, track) => sum + track.lessonCount,
    0
  );

  return (
    <main className="page">
      <section className="page-intro">
        <p className="eyebrow">Learning roadmap</p>
        <h1>Python tracks</h1>
        <p>
          The full curriculum is visible from the start. Some tracks are already
          in progress, while others are planned for future development.
        </p>
      </section>

      <section className="roadmap-summary">
        <article>
          <strong>{totalTracks}</strong>
          <span>Tracks</span>
        </article>

        <article>
          <strong>{totalLessons}</strong>
          <span>Lessons planned</span>
        </article>

        <article>
          <strong>{inProgressTracks}</strong>
          <span>In progress</span>
        </article>

        <article>
          <strong>{plannedTracks}</strong>
          <span>Planned</span>
        </article>
      </section>

      <section className="track-grid">
        {tracks.map((track) => (
          <TrackCard track={track} key={track.slug} />
        ))}
      </section>
    </main>
  );
}

export default TracksPage;