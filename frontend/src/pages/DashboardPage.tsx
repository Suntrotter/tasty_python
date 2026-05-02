import { Link } from "react-router-dom";
import { lessons } from "../data/lessons";
import { useLessonProgress } from "../features/progress/useLessonProgress";

function DashboardPage() {
  const {
  completedLessonSlugs,
  completedLessonsCount,
  progressSource,
  isProgressLoading,
} = useLessonProgress();

  const completedLessons = lessons.filter((lesson) =>
    completedLessonSlugs.includes(lesson.slug)
  );

  const publishedLessons = lessons.filter(
    (lesson) => lesson.status === "published"
  );

  const currentLesson = lessons.find(
    (lesson) => lesson.slug === "variables-and-assignment"
  );

  return (
    <main className="page">
      <section className="page-intro">
        <p className="eyebrow">Learner dashboard</p>
        <h1>Your Python journey</h1>
        <p>
          This dashboard currently uses local progress saved in your browser.
          Later, this data will move to user accounts and the backend.
        </p>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-card dashboard-card-large">
          <p className="eyebrow">Continue learning</p>

          <h2>{currentLesson?.title ?? "Variables and Assignment"}</h2>

          <p>
            Continue with the first Python Core lesson and learn how variable
            names are attached to values in Python.
          </p>

          <Link
            to="/lessons/variables-and-assignment"
            className="button button-primary"
          >
            Continue lesson
          </Link>
        </article>

        <article className="dashboard-card">
          <h2>Current track</h2>
          <p className="dashboard-number">Python Core</p>
          <p>1 of 14 lessons published</p>
        </article>

        <article className="dashboard-card">
  <h2>Completed lessons</h2>
  <p className="dashboard-number">
    {isProgressLoading ? "..." : completedLessonsCount}
  </p>
  <p>
    {progressSource === "backend"
      ? "Your completed lessons are saved in the backend database."
      : "Your completed lessons are saved locally in this browser."}
  </p>
</article>

        <article className="dashboard-card">
          <h2>Published lessons</h2>
          <p className="dashboard-number">{publishedLessons.length}</p>
          <p>More lessons will be added as the curriculum grows.</p>
        </article>

        <article className="dashboard-card">
          <h2>Weak topics</h2>
          <p className="dashboard-number">Coming soon</p>
          <p>
            Later, this block will help learners return to topics they struggle
            with.
          </p>
        </article>
      </section>

      {completedLessons.length > 0 && (
        <section className="completed-lessons-section">
          <h2>Completed lessons</h2>

          <div className="completed-lessons-list">
            {completedLessons.map((lesson) => (
              <Link
                to={`/lessons/${lesson.slug}`}
                className="completed-lesson-card"
                key={lesson.slug}
              >
                <span>✓</span>
                <strong>{lesson.title}</strong>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default DashboardPage;