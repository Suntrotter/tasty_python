import { useEffect, useState } from "react";
import TrackCard from "../components/TrackCard";
import { fetchTracks } from "../api/tracksApi";
import { tracks as localTracks } from "../data/tracks";
import { getLessonsByTrackSlug } from "../data/lessons";
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

  const readyLessons = tracks.reduce((sum, track) => {
    const lessons = getLessonsByTrackSlug(track.slug);
    const publishedLessons = lessons.filter(
      (lesson) => lesson.status === "published"
    );

    return sum + publishedLessons.length;
  }, 0);

  const totalLessons = tracks.reduce(
    (sum, track) => sum + track.lessonCount,
    0
  );

  const availableTracks = tracks.filter((track) => {
    const lessons = getLessonsByTrackSlug(track.slug);

    return lessons.some((lesson) => lesson.status === "published");
  }).length;

  return (
    <main className="page">
      <section className="page-intro">
        <p className="eyebrow">Choose your path</p>
        <h1>Python tracks</h1>

        <p>
          Learn Python step by step. Start with the basics, practice small
          concepts, return to tricky topics, and build confidence for real
          coding tasks and junior interviews.
        </p>

        {errorMessage && <p className="api-notice">{errorMessage}</p>}
      </section>

      {isLoading ? (
        <section className="loading-box">
          <h2>Loading tracks...</h2>
          <p>Preparing your Python learning paths.</p>
        </section>
      ) : (
        <>
          <section className="roadmap-summary">
            <article>
              <strong>{totalTracks}</strong>
              <span>Learning paths</span>
            </article>

            <article>
              <strong>{readyLessons}</strong>
              <span>Lessons ready</span>
            </article>

            <article>
              <strong>{availableTracks}</strong>
              <span>Open now</span>
            </article>

            <article>
              <strong>{totalLessons}</strong>
              <span>Total planned</span>
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