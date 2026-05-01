import { Link } from "react-router-dom";
import { tracks } from "../data/tracks";

function TracksPage() {
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

      <section className="track-grid">
        {tracks.map((track) => (
          <Link
            to={`/tracks/${track.slug}`}
            className="track-card"
            key={track.slug}
          >
            <span className={`status status-${track.status}`}>
              {track.status.replace("_", " ")}
            </span>

            <h2>{track.title}</h2>
            <p>{track.description}</p>

            <p className="lesson-count">{track.lessonCount} lessons</p>
          </Link>
        ))}
      </section>
    </main>
  );
}

export default TracksPage;