import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { getLessonsByTrackSlug, lessons } from "../data/lessons";
import { tracks } from "../data/tracks";
import { useAuth } from "../features/auth/AuthContext";
import { getInterviewQuestionsToReview } from "../features/interview/interviewProgress";
import { getAllLessonPracticeStats } from "../features/practice/practiceProgress";
import { useLessonProgress } from "../features/progress/useLessonProgress";

const REVIEW_THRESHOLD = 70;
const CURRENT_TRACK_SLUG = "python-core";

function getPluralLabel(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
}

function DashboardPage() {
  const { currentUser, isAuthLoading } = useAuth();

  const { completedLessonSlugs, progressSource, isProgressLoading } =
    useLessonProgress();

  const currentTrack = tracks.find((track) => track.slug === CURRENT_TRACK_SLUG);
  const currentTrackLessons = currentTrack
    ? getLessonsByTrackSlug(currentTrack.slug)
    : lessons;

  const publishedLessons = currentTrackLessons.filter(
    (lesson) => lesson.status === "published"
  );

  const completedLessons = publishedLessons.filter((lesson) =>
    completedLessonSlugs.includes(lesson.slug)
  );

  const totalPublishedLessons = publishedLessons.length;

  const allPublishedLessonsCompleted =
    totalPublishedLessons > 0 &&
    completedLessons.length >= totalPublishedLessons;

  const nextLesson = allPublishedLessonsCompleted
    ? undefined
    : publishedLessons.find(
        (lesson) => !completedLessonSlugs.includes(lesson.slug)
      );

  const progressPercent =
    totalPublishedLessons > 0
      ? Math.round((completedLessons.length / totalPublishedLessons) * 100)
      : 0;

  const practiceStats = getAllLessonPracticeStats()
    .map((stat) => {
      const lesson = publishedLessons.find(
        (publishedLesson) => publishedLesson.slug === stat.lessonSlug
      );

      return {
        ...stat,
        lesson,
      };
    })
    .filter((stat) => stat.lesson);

  const lessonsWithPractice = practiceStats.filter(
    (stat) => stat.accuracy !== null
  );

  const reviewTopics = lessonsWithPractice.filter(
    (stat) => stat.accuracy !== null && stat.accuracy < REVIEW_THRESHOLD
  );

  const totalPracticeAttempts = lessonsWithPractice.reduce(
    (sum, stat) => sum + stat.totalFirstAttempts,
    0
  );

  const correctPracticeAttempts = lessonsWithPractice.reduce(
    (sum, stat) => sum + stat.correctFirstAttempts,
    0
  );

  const practiceAccuracy =
    totalPracticeAttempts > 0
      ? Math.round((correctPracticeAttempts / totalPracticeAttempts) * 100)
      : null;

  const interviewQuestionsToReview = getInterviewQuestionsToReview().sort(
    (firstQuestion, secondQuestion) =>
      new Date(secondQuestion.updatedAt).getTime() -
      new Date(firstQuestion.updatedAt).getTime()
  );

  const reviewQueueCount =
    reviewTopics.length + interviewQuestionsToReview.length;

  const isCheckingProgress = isAuthLoading || isProgressLoading;

  return (
    <main className="page progress-page">
      <section className="page-intro progress-intro">
        <p className="eyebrow">Your progress</p>
        <h1>Keep going, one Python bite at a time.</h1>

        <p>
          Continue your current track, review weak spots, and keep completed
          lessons tucked away for later.
        </p>

        {!currentUser && !isAuthLoading && (
          <div className="empty-progress-card progress-signin-card">
            <h3>Sign in to keep your progress across devices.</h3>
            <p>
              You can still explore lessons as a guest, but account progress is
              available after signing in.
            </p>

            <div className="hero-actions">
              <Link to="/login" className="button button-primary">
                Sign in
              </Link>

              <Link to="/register" className="button button-secondary">
                Create account
              </Link>
            </div>
          </div>
        )}

        {currentUser && progressSource === "local" && (
          <p className="api-notice">
            Backend progress is not available right now. Showing local progress.
          </p>
        )}
      </section>

      <section className="progress-hero-card">
        <div className="progress-hero-copy">
          <p className="progress-card-kicker">Current path</p>
          <h2>{currentTrack?.title ?? "Python Core"}</h2>

          <p>
            {currentTrack?.description ??
              "Start with the essential Python ideas every junior developer should explain clearly."}
          </p>

          <div className="progress-next-inline">
            <p className="progress-card-kicker">
              {nextLesson ? "Next lesson" : "Current status"}
            </p>

            {nextLesson ? (
              <>
                <strong>{nextLesson.title}</strong>
                <span>{nextLesson.shortDescription}</span>
              </>
            ) : allPublishedLessonsCompleted ? (
              <>
                <strong>All available lessons are complete.</strong>
                <span>
                  You can review completed lessons or practice interview
                  answers.
                </span>
              </>
            ) : (
              <>
                <strong>No published lesson is waiting right now.</strong>
                <span>New lessons will appear as the curriculum grows.</span>
              </>
            )}
          </div>

          <div className="progress-hero-actions">
            {nextLesson ? (
              <Link
                to={`/lessons/${nextLesson.slug}`}
                className="button button-primary"
              >
                {completedLessons.length > 0
                  ? "Continue learning"
                  : "Start lesson"}
              </Link>
            ) : allPublishedLessonsCompleted ? (
              <Link to="/interview-mode" className="button button-primary">
                Practice interview answers
              </Link>
            ) : (
              <Link to="/tracks" className="button button-primary">
                View roadmap
              </Link>
            )}

            <Link to="/tracks" className="progress-secondary-link">
              View full roadmap →
            </Link>
          </div>
        </div>

        <div className="progress-ring-card">
          <div
            className="progress-ring"
            style={
              {
                "--progress": `${progressPercent}%`,
              } as CSSProperties
            }
          >
            <span>{isCheckingProgress ? "..." : `${progressPercent}%`}</span>
          </div>

          <p>
            {completedLessons.length} of {totalPublishedLessons} available{" "}
            {getPluralLabel(totalPublishedLessons, "lesson", "lessons")}{" "}
            completed
          </p>
        </div>
      </section>

      <section className="progress-snapshot" aria-label="Progress snapshot">
        <article className="progress-card">
          <p className="progress-card-kicker">Completed</p>
          <h2>{isCheckingProgress ? "..." : completedLessons.length}</h2>
          <p>
            {getPluralLabel(
              completedLessons.length,
              "Lesson completed in this track.",
              "Lessons completed in this track."
            )}
          </p>
        </article>

        <article className="progress-card">
          <p className="progress-card-kicker">Track progress</p>
          <h2>{isCheckingProgress ? "..." : `${progressPercent}%`}</h2>
          <p>
            {completedLessons.length} of {totalPublishedLessons} available{" "}
            {getPluralLabel(totalPublishedLessons, "lesson", "lessons")} done.
          </p>
        </article>

        <article className="progress-card">
          <p className="progress-card-kicker">First-attempt accuracy</p>
          <h2>{practiceAccuracy === null ? "—" : `${practiceAccuracy}%`}</h2>
          <p>
            {totalPracticeAttempts > 0
              ? `${correctPracticeAttempts} of ${totalPracticeAttempts} first attempts correct.`
              : "Answer practice questions to start tracking accuracy."}
          </p>
        </article>

        <article className="progress-card">
          <p className="progress-card-kicker">Review queue</p>
          <h2>{reviewQueueCount}</h2>
          <p>
            {reviewQueueCount === 0
              ? "No review items waiting right now."
              : "Practice topics and interview questions waiting for review."}
          </p>
        </article>
      </section>

      <section className="progress-section">
        <div className="progress-section-header">
          <div>
            <p className="eyebrow">Practice review</p>
            <h2>Topics to review</h2>
          </div>
        </div>

        {reviewTopics.length > 0 ? (
          <div className="review-topic-list">
            {reviewTopics.map((stat) => (
              <Link
                to={`/lessons/${stat.lessonSlug}`}
                className="review-topic-card"
                key={stat.lessonSlug}
              >
                <div>
                  <p className="progress-card-kicker">Needs another look</p>
                  <h3>{stat.lesson?.title}</h3>
                  <p>
                    First-attempt score: {stat.correctFirstAttempts} of{" "}
                    {stat.totalFirstAttempts} correct.
                  </p>
                </div>

                <span className="review-topic-score">{stat.accuracy}%</span>
              </Link>
            ))}
          </div>
        ) : lessonsWithPractice.length > 0 ? (
          <div className="empty-progress-card empty-progress-card-success">
            <h3>No weak practice topics right now.</h3>
            <p>
              Nice work. Your first-attempt practice scores are currently above
              the review threshold.
            </p>
          </div>
        ) : (
          <div className="empty-progress-card">
            <h3>No practice data yet.</h3>
            <p>
              Answer practice questions in a lesson. If your first-attempt score
              is below {REVIEW_THRESHOLD}%, that lesson will appear here for
              review.
            </p>
          </div>
        )}
      </section>

      <section className="progress-section">
        <div className="progress-section-header">
          <div>
            <p className="eyebrow">Interview review</p>
            <h2>Questions to revisit</h2>
          </div>

          <Link to="/interview-mode" className="progress-secondary-link">
            Open Interview Mode →
          </Link>
        </div>

        {interviewQuestionsToReview.length > 0 ? (
          <div className="interview-review-list">
            {interviewQuestionsToReview.map((question) => (
              <Link
                to="/interview-mode"
                className="interview-review-card"
                key={question.questionId}
              >
                <div>
                  <p className="progress-card-kicker">{question.lessonTitle}</p>
                  <h3>{question.question}</h3>
                  <p>Marked for review in Interview Mode.</p>
                </div>

                <span>Practice →</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-progress-card empty-progress-card-success">
            <h3>No interview questions waiting for review.</h3>
            <p>
              When a question feels shaky, mark it as “Review later” in
              Interview Mode. It will appear here.
            </p>
          </div>
        )}
      </section>

      <details className="progress-details">
        <summary>
          <span>Completed lessons</span>
          <strong>{completedLessons.length}</strong>
        </summary>

        {completedLessons.length > 0 ? (
          <div className="completed-lessons-list">
            {completedLessons.map((lesson) => (
              <Link
                to={`/lessons/${lesson.slug}`}
                className="completed-lesson-card"
                key={lesson.slug}
              >
                <span>✓</span>

                <div>
                  <strong>{lesson.title}</strong>
                  <p>{lesson.shortDescription}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-progress-card">
            <h3>No completed lessons yet.</h3>
            <p>
              Finish your first lesson and mark it as completed. This section
              will start filling up from there.
            </p>
          </div>
        )}
      </details>
    </main>
  );
}

export default DashboardPage;