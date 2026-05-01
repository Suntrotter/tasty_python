import { Link } from "react-router-dom";

function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Junior Python interview prep</p>

        <h1>Learn Python one tasty lesson at a time.</h1>

        <p className="hero-text">
          Tasty Python helps junior developers prepare for Python interviews
          through short lessons, friendly metaphors, coding drills, trap zones,
          and interview-style explanations.
        </p>

        <div className="hero-actions">
          <Link to="/tracks" className="button button-primary">
            View roadmap
          </Link>

          <Link
            to="/lessons/variables-and-assignment"
            className="button button-secondary"
          >
            Start first lesson
          </Link>
        </div>
      </section>

      <section className="section">
        <h2>Why Tasty Python?</h2>

        <div className="feature-grid">
          <article className="feature-card">
            <h3>Short lessons</h3>
            <p>Each lesson focuses on one interview-friendly Python concept.</p>
          </article>

          <article className="feature-card">
            <h3>Tasty metaphors</h3>
            <p>
              Abstract ideas become easier through cafés, jars, recipes, and
              other memorable images.
            </p>
          </article>

          <article className="feature-card">
            <h3>Trap zones</h3>
            <p>
              Learners see common junior mistakes before those mistakes bite
              them in interviews.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}

export default HomePage;