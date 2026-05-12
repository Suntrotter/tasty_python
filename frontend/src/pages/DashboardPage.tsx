import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { lessons } from "../data/lessons";
import { tracks } from "../data/tracks";
import { useAuth } from "../features/auth/AuthContext";
import { getInterviewQuestionsToReview } from "../features/interview/interviewProgress";
import { getAllLessonPracticeStats } from "../features/practice/practiceProgress";
import { useLessonProgress } from "../features/progress/useLessonProgress";

const REVIEW_THRESHOLD = 70;

function DashboardPage() {
  const { currentUser, isAuthLoading } = useAuth();

  const {
    completedLessonSlugs,
    completedLessonsCount,
    progressSource,
    isProgressLoading,
  } = useLessonProgress();

  const publishedLessons = lessons.filter(
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

  const currentTrack = tracks.find((track) => track.slug === "python-core");

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

  const isCheckingProgress = isAuthLoading || isProgressLoading;

  return (
    <main className="page progress-page">
      <section className="page-intro progress-intro">
        <p className="eyebrow">Your progress</p>
        <h1>Keep going, one Python bite at a time.</h1>

        <p>
          Track completed lessons, continue where you left off, and return to
          topics that need more practice.
        </p>

        {!currentUser && !isAuthLoading && (
          <div className="empty-progress-card">
            <h3>Sign in to save your progress.</h3>
            <p>
              You can still explore lessons, but authenticated progress is saved
              only after signing in.
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

        {currentUser && progressSource === "backend" && (
          <p className="home-progress-note">
            Progress is saved to your account.
          </p>
        )}

        {currentUser && progressSource === "local" && (
          <p className="api-notice">
            Backend progress is not available right now. Showing local progress.
          </p>
        )}
      </section>

      <section className="progress-hero-card">
        <div>
          <p className="progress-card-kicker">Current path</p>
          <h2>{currentTrack?.title ?? "Python Core"}</h2>

          <p>
            Start with the essentials: variables, types, simple operations,
            strings, and the small ideas that make Python feel clear.
          </p>

          {nextLesson ? (
            <Link
              to={`/lessons/${nextLesson.slug}`}
              className="button button-primary"
            >
              {completedLessons.length > 0 ? "Continue learning" : "Start lesson"}
            </Link>
          ) : allPublishedLessonsCompleted ? (
            <Link to="/tracks" className="button button-primary">
              Review lessons
            </Link>
          ) : (
            <Link to="/tracks" className="button button-primary">
              Choose a track
            </Link>
          )}
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
            {completedLessons.length} of {totalPublishedLessons} available
            lessons completed
          </p>
        </div>
      </section>

      <section className="progress-grid">
        <article className="progress-card">
          <p className="progress-card-kicker">Completed</p>
          <h2>{isCheckingProgress ? "..." : completedLessonsCount}</h2>
          <p>
            Lesson{completedLessonsCount === 1 ? "" : "s"} marked as completed.
          </p>
        </article>

        <article className="progress-card">
          <p className="progress-card-kicker">Practice accuracy</p>
          <h2>{practiceAccuracy === null ? "—" : `${practiceAccuracy}%`}</h2>
          <p>
            {totalPracticeAttempts > 0
              ? `${correctPracticeAttempts} of ${totalPracticeAttempts} first attempts correct.`
              : "Answer practice questions to start tracking accuracy."}
          </p>
        </article>

        <article className="progress-card">
          <p className="progress-card-kicker">Practice review</p>
          <h2>{reviewTopics.length}</h2>
          <p>
            Lesson{reviewTopics.length === 1 ? "" : "s"} below{" "}
            {REVIEW_THRESHOLD}% first-attempt accuracy.
          </p>
        </article>

        <article className="progress-card">
          <p className="progress-card-kicker">Interview review</p>
          <h2>{interviewQuestionsToReview.length}</h2>
          <p>
            Question{interviewQuestionsToReview.length === 1 ? "" : "s"} marked
            for later review.
          </p>
        </article>
      </section>

      <section className="progress-section">
        <div className="progress-section-header">
          <div>
            <p className="eyebrow">
              {allPublishedLessonsCompleted ? "Review" : "Continue"}
            </p>
            <h2>
              {allPublishedLessonsCompleted
                ? "You completed all available lessons"
                : "Your next lesson"}
            </h2>
          </div>

          <Link to="/tracks" className="progress-secondary-link">
            View all tracks →
          </Link>
        </div>

        {nextLesson ? (
          <Link to={`/lessons/${nextLesson.slug}`} className="next-lesson-card">
            <div>
              <p className="progress-card-kicker">Next step</p>
              <h3>{nextLesson.title}</h3>
              <p>{nextLesson.shortDescription}</p>
            </div>

            <span>Open lesson →</span>
          </Link>
        ) : allPublishedLessonsCompleted ? (
          <div className="next-lesson-card">
            <div>
              <p className="progress-card-kicker">Course complete</p>
              <h3>Every published lesson is complete.</h3>
              <p>
                You can review previous lessons or keep practicing interview
                explanations.
              </p>
            </div>

            <Link to="/interview-mode" className="button button-secondary">
              Practice interview answers
            </Link>
          </div>
        ) : (
          <div className="next-lesson-card">
            <div>
              <p className="progress-card-kicker">All caught up</p>
              <h3>No published lesson is waiting right now.</h3>
              <p>New lessons will appear here as the curriculum grows.</p>
            </div>
          </div>
        )}
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

      <section className="progress-section">
        <div className="progress-section-header">
          <div>
            <p className="eyebrow">Finished</p>
            <h2>Completed lessons</h2>
          </div>
        </div>

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
      </section>
    </main>
  );
}

export default DashboardPage;