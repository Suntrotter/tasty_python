import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchTracks } from "../api/tracksApi";
import {
  fetchTracksSummary,
  type TrackSummaryCard,
  type TracksSummary,
} from "../api/tracksSummaryApi";
import { tracks as localTracks } from "../data/tracks";
import { getLessonsByTrackSlug } from "../data/lessons";
import { useAuth } from "../features/auth/AuthContext";
import type { Track } from "../types/curriculum";

function getFirstPublishedLessonSlug(trackSlug: string) {
  const lessons = getLessonsByTrackSlug(trackSlug);
  const firstPublishedLesson = lessons.find(
    (lesson) => lesson.status === "published"
  );

  return firstPublishedLesson?.slug;
}

function mapTrackToSummaryCard(track: Track): TrackSummaryCard {
  const lessons = getLessonsByTrackSlug(track.slug);
  const readyLessons = lessons.filter(
    (lesson) => lesson.status === "published"
  );

  const firstPublishedLessonSlug = getFirstPublishedLessonSlug(track.slug);
  const hasReadyLessons = readyLessons.length > 0;

  return {
    id: track.slug,
    slug: track.slug,
    title: track.title,
    description: track.description,
    status: track.status,
    totalLessonsCount: track.lessonCount,
    readyLessonsCount: readyLessons.length,
    completedLessonsCount: 0,
    progressPercent: 0,
    ctaLabel: hasReadyLessons ? "Start track" : "View roadmap",
    ctaTo: firstPublishedLessonSlug
      ? `/lessons/${firstPublishedLessonSlug}`
      : `/tracks/${track.slug}`,
  };
}

function buildGuestTracksSummary(tracks: Track[]): TracksSummary {
  const cards = tracks.map(mapTrackToSummaryCard);

  const firstAvailableTrackIndex = cards.findIndex(
    (track) => track.readyLessonsCount > 0
  );

  const currentTrackIndex = firstAvailableTrackIndex >= 0 ? firstAvailableTrackIndex : 0;
  const currentTrack = cards[currentTrackIndex] ?? null;

  const incompleteTracks = cards.filter((_, index) => index !== currentTrackIndex);

  return {
    completedTracks: [],
    currentTrack: currentTrack
      ? {
          ...currentTrack,
          ctaLabel: currentTrack.readyLessonsCount > 0 ? "Start Python Core" : "View roadmap",
        }
      : null,
    upNextTracks: incompleteTracks.slice(0, 3),
    moreTracks: incompleteTracks.slice(3),
  };
}

function getAllTracksFromSummary(summary: TracksSummary) {
  return [
    ...summary.completedTracks,
    ...(summary.currentTrack ? [summary.currentTrack] : []),
    ...summary.upNextTracks,
    ...summary.moreTracks,
  ];
}

interface TrackMapCardProps {
  track: TrackSummaryCard;
  variant?: "featured" | "compact";
}

function TrackMapCard({ track, variant = "compact" }: TrackMapCardProps) {
  const isFeatured = variant === "featured";
  const hasReadyLessons = track.readyLessonsCount > 0;
  const hasProgress = track.completedLessonsCount > 0;
  const isCompleted =
    hasReadyLessons &&
    track.completedLessonsCount >= track.readyLessonsCount;

  return (
    <article
      className={`track-map-card ${
        isFeatured ? "track-map-card-featured" : ""
      } ${isCompleted ? "track-map-card-completed" : ""}`}
    >
      <div className="track-map-card-header">
        <span className={`status status-${track.status}`}>
          {isCompleted ? "completed" : track.status.replace("_", " ")}
        </span>

        {hasProgress && (
          <span className="track-map-progress-label">
            {track.completedLessonsCount}/{track.readyLessonsCount} ready lessons
          </span>
        )}
      </div>

      <h3>{track.title}</h3>

      <p>{track.description}</p>

      <div className="track-map-meta">
        <span>{track.readyLessonsCount} ready</span>
        <span>{track.totalLessonsCount} mapped</span>
      </div>

      <div
        className="track-map-progress"
        aria-label={`${track.progressPercent}% completed`}
      >
        <span style={{ width: `${track.progressPercent}%` }} />
      </div>

      <Link to={track.ctaTo || "/tracks"} className="track-map-link">
        {track.ctaLabel}
      </Link>
    </article>
  );
}

function TracksPage() {
  const { currentUser, isAuthLoading } = useAuth();
  const [tracksSummary, setTracksSummary] = useState<TracksSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let shouldIgnore = false;

    async function loadGuestTracks() {
      try {
        const tracksFromApi = await fetchTracks();

        if (!shouldIgnore) {
          setTracksSummary(buildGuestTracksSummary(tracksFromApi));
        }
      } catch {
        if (!shouldIgnore) {
          setErrorMessage(
            "Backend is not available right now. Showing local demo data."
          );
          setTracksSummary(buildGuestTracksSummary(localTracks));
        }
      }
    }

    async function loadTracks() {
      if (isAuthLoading) {
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        if (currentUser) {
          const idToken = await currentUser.getIdToken();
          const summary = await fetchTracksSummary(idToken);

          if (!shouldIgnore) {
            setTracksSummary(summary);
          }

          return;
        }

        await loadGuestTracks();
      } catch {
        if (!shouldIgnore) {
          setErrorMessage(
            "Could not load your account roadmap. Showing the public roadmap instead."
          );
          await loadGuestTracks();
        }
      } finally {
        if (!shouldIgnore) {
          setIsLoading(false);
        }
      }
    }

    loadTracks();

    return () => {
      shouldIgnore = true;
    };
  }, [currentUser, isAuthLoading]);

  const allTracks = useMemo(() => {
    if (!tracksSummary) {
      return [];
    }

    return getAllTracksFromSummary(tracksSummary);
  }, [tracksSummary]);

  const totalTracks = allTracks.length;

  const readyLessons = allTracks.reduce(
    (sum, track) => sum + track.readyLessonsCount,
    0
  );

  const totalLessons = allTracks.reduce(
    (sum, track) => sum + track.totalLessonsCount,
    0
  );

  const availableTracks = allTracks.filter(
    (track) => track.readyLessonsCount > 0
  ).length;

  const hasCompletedTracks =
  (tracksSummary?.completedTracks.length ?? 0) > 0;

  return (
    <main className="page">
      <section className="page-intro">
        <p className="eyebrow">Choose your path</p>
        <h1>Python tracks</h1>

        <p>
          Start with your current path, see what comes next, and open the full
          roadmap only when you need it. Tasty Python is designed to keep the
          next step clear instead of showing you the whole mountain at once.
        </p>

        {errorMessage && <p className="api-notice">{errorMessage}</p>}
      </section>

      {isLoading || !tracksSummary ? (
        <section className="loading-box">
          <h2>Loading tracks...</h2>
          <p>Preparing your Python learning map.</p>
        </section>
      ) : (
        <>
          <section className="roadmap-summary">
            <article>
              <strong>{totalTracks}</strong>
              <span>Tracks mapped</span>
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
              <span>Lesson ideas</span>
            </article>
          </section>

          {hasCompletedTracks && (
            <details className="track-map-toggle">
              <summary>
                <span>Completed tracks</span>
                <strong>{tracksSummary.completedTracks.length}</strong>
              </summary>

              <div className="track-map-grid">
                {tracksSummary.completedTracks.map((track) => (
                  <TrackMapCard track={track} key={track.id} />
                ))}
              </div>
            </details>
          )}

          <section className="track-map-section">
            <div className="track-map-section-heading">
              <p className="eyebrow">
                {tracksSummary.currentTrack ? "Current path" : "Roadmap complete"}
              </p>

              <h2>
                {tracksSummary.currentTrack
                  ? "Your main track now"
                  : "You completed the available roadmap"}
              </h2>
            </div>

            {tracksSummary.currentTrack ? (
              <TrackMapCard track={tracksSummary.currentTrack} variant="featured" />
            ) : (
              <article className="track-map-card track-map-card-featured">
                <span className="status status-published">complete</span>
                <h3>All available tracks completed</h3>
                <p>
                  You have completed the currently available published tracks.
                  Review your progress or practice interview answers while more
                  content is being prepared.
                </p>

                <Link to="/dashboard" className="track-map-link">
                  Review progress
                </Link>
              </article>
            )}
          </section>

          {tracksSummary.upNextTracks.length > 0 && (
            <section className="track-map-section">
              <div className="track-map-section-heading">
                <p className="eyebrow">Up next</p>
                <h2>Next recommended tracks</h2>
              </div>

              <div className="track-map-grid">
                {tracksSummary.upNextTracks.map((track) => (
                  <TrackMapCard track={track} key={track.id} />
                ))}
              </div>
            </section>
          )}

          {tracksSummary.moreTracks.length > 0 && (
            <details className="track-map-toggle track-map-toggle-more">
              <summary>
                <span>More tracks</span>
                <strong>{tracksSummary.moreTracks.length}</strong>
              </summary>

              <p>
                Explore the rest of the roadmap when you want to see where the
                course is going next.
              </p>

              <div className="track-map-grid">
                {tracksSummary.moreTracks.map((track) => (
                  <TrackMapCard track={track} key={track.id} />
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </main>
  );
}

export default TracksPage;