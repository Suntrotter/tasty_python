import { useEffect, useState } from "react";
import TrackCard from "../components/TrackCard";
import { fetchTracks } from "../api/tracksApi";
import { tracks as localTracks } from "../data/tracks";
import type { Track } from "../types/curriculum";

function TracksPage() {
  const [apiTracks, setApiTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadTracks() {
      try {
        const tracksFromApi = await fetchTracks();
        setApiTracks(tracksFromApi);
      } catch {
        setErrorMessage(
          "Backend is not available right now. Showing local demo data."
        );
        setApiTracks(localTracks);
      } finally {
        setIsLoading(false);
      }
    }

    loadTracks();
  }, []);

  const tracks = apiTracks.length > 0 ? apiTracks : localTracks;

  const totalTracks = tracks.length;

  const inProgressTracks = tracks.filter(
    (track) => track.status === "in_progress"
  ).length;

  const plannedTracks = tracks.filter(
    (track) => track.status === "planned"
  ).length;

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

        {errorMessage && <p className="api-notice">{errorMessage}</p>}
      </section>

      {isLoading ? (
        <section className="loading-box">
          <h2>Loading tracks...</h2>
          <p>Fetching the learning roadmap from the backend API.</p>
        </section>
      ) : (
        <>
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
        </>
      )}
    </main>
  );
}

export default TracksPage;