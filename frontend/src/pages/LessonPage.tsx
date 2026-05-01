import { Link, useParams } from "react-router-dom";
import { getLessonBySlug } from "../data/lessons";

function LessonPage() {
  const { lessonSlug } = useParams();

  const lesson = lessonSlug ? getLessonBySlug(lessonSlug) : undefined;

  if (!lesson) {
    return (
      <main className="page">
        <h1>Lesson not found</h1>
        <p>This lesson does not exist yet.</p>
        <Link to="/tracks" className="button button-primary">
          Back to tracks
        </Link>
      </main>
    );
  }

  if (lesson.status !== "published") {
    return (
      <main className="page">
        <section className="coming-soon-box">
          <span className={`status status-${lesson.status}`}>
            {lesson.status.replace("_", " ")}
          </span>

          <h1>{lesson.title}</h1>

          <p>{lesson.shortDescription}</p>

          <p>
            This lesson is visible in the roadmap, but the full content is not
            published yet.
          </p>

          <Link to={`/tracks/${lesson.trackSlug}`} className="button button-primary">
            Back to track
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page lesson-page">
      <section className="lesson-hero">
        <p className="eyebrow">Lesson {lesson.order}</p>
        <h1>{lesson.title}</h1>

        <p className="lesson-meta">
          {lesson.difficulty} · {lesson.estimatedTime}
        </p>

        <p>{lesson.shortDescription}</p>
      </section>

      <section className="lesson-section">
        <h2>Tasty Metaphor</h2>
        <p>
          Imagine a kitchen full of jars. Each jar contains something delicious:
          strawberry jam, honey, cinnamon, or chocolate cream.
        </p>
        <p>
          A variable is like a label on a jar. In Python, a variable is not a
          box. It is a name tag attached to a value.
        </p>
      </section>

      <section className="lesson-section">
        <h2>Short Theory</h2>
        <p>
          A variable is a name that refers to a value. The symbol{" "}
          <code>=</code> means assignment. It takes the value on the right and
          assigns it to the name on the left.
        </p>

        <pre>
          <code>{`tea = "green tea"
cups = 3
price = 4.5
is_hot = True`}</code>
        </pre>
      </section>

      <section className="lesson-section">
        <h2>Interview Spot</h2>

        <h3>What is a variable in Python?</h3>

        <p>
          A variable in Python is a name that refers to an object or value. It
          does not store the value directly like a physical box; it points to an
          object in memory.
        </p>
      </section>
    </main>
  );
}

export default LessonPage;