import { Link } from "react-router-dom";
import { lessons } from "../data/lessons";
import { tracks } from "../data/tracks";
import { getInterviewQuestionsToReview } from "../features/interview/interviewProgress";
import { getAllLessonPracticeStats } from "../features/practice/practiceProgress";
import { useLessonProgress } from "../features/progress/useLessonProgress";

const REVIEW_THRESHOLD = 70;

function DashboardPage() {
  const {
    completedLessonSlugs,
    completedLessonsCount,
    isProgressLoading,
  } = useLessonProgress();

  const publishedLessons = lessons.filter(
    (lesson) => lesson.status === "published"
  );

  const completedLessons = publishedLessons.filter((lesson) =>
    completedLessonSlugs.includes(lesson.slug)
  );

  const nextLesson =
    publishedLessons.find(
      (lesson) => !completedLessonSlugs.includes(lesson.slug)
    ) ?? publishedLessons[0];

  const totalPublishedLessons = publishedLessons.length;
  const progressPercent =
    totalPublishedLessons > 0
      ? Math.round((completedLessonsCount / totalPublishedLessons) * 100)
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

  return (
    <main className="page progress-page">
      <section className="page-intro progress-intro">
        <p className="eyebrow">Your progress</p>
        <h1>Keep going, one Python bite at a time.</h1>

        <p>
          Track completed lessons, continue where you left off, and return to
          topics that need more practice.
        </p>
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
              {completedLessonsCount > 0 ? "Continue learning" : "Start lesson"}
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
              } as React.CSSProperties
            }
          >
            <span>{isProgressLoading ? "..." : `${progressPercent}%`}</span>
          </div>

          <p>
            {completedLessonsCount} of {totalPublishedLessons} available lessons
            completed
          </p>
        </div>
      </section>

      <section className="progress-grid">
        <article className="progress-card">
          <p className="progress-card-kicker">Completed</p>
          <h2>{isProgressLoading ? "..." : completedLessonsCount}</h2>
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
            <p className="eyebrow">Continue</p>
            <h2>Your next lesson</h2>
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