import { Link } from "react-router-dom";

function HomePage() {
  return (
    <main className="page home-page">
      <section className="hero home-hero">
        <div className="home-hero-content">
          <p className="eyebrow">Junior Python interview prep</p>

          <h1>Learn Python one tasty concept at a time.</h1>

          <p className="hero-text">
            Tasty Python helps you understand Python through short lessons,
            cozy metaphors, instant practice feedback, a real code runner, and
            interview-style explanations.
          </p>

          <div className="hero-actions">
            <Link to="/tracks" className="button button-primary">
              Start learning
            </Link>

            <Link to="/interview-mode" className="button button-secondary">
              Practice interview answers
            </Link>
          </div>
        </div>

        <div className="home-hero-card" aria-label="Tasty Python preview">
          <div className="home-hero-card-top">
            <span />
            <span />
            <span />
          </div>

          <div className="home-hero-card-body">
            <p className="home-card-kicker">Today’s bite</p>
            <h2>Variables are labels</h2>

            <div className="home-code-preview">
              <code>flavor = "strawberry"</code>
              <code>flavor = "chocolate"</code>
            </div>

            <p>
              A name can point to a value. Reassignment moves the label. Simple,
              visual, memorable.
            </p>
          </div>
        </div>
      </section>

      <section className="section home-section">
        <div className="section-heading">
          <p className="eyebrow">How it works</p>
          <h2>Small bites. Real progress.</h2>
          <p>
            Each lesson gives you one clear idea, then helps you test it,
            explain it, and remember it.
          </p>
        </div>

        <div className="feature-grid home-feature-grid">
          <article className="feature-card home-feature-card">
            <span className="feature-icon">🍓</span>
            <h3>Tasty metaphors</h3>
            <p>
              Abstract Python ideas become easier through cafés, jars, recipes,
              labels, and other visual hooks.
            </p>
          </article>

          <article className="feature-card home-feature-card">
            <span className="feature-icon">⚡</span>
            <h3>Instant practice</h3>
            <p>
              Choose answers, get immediate feedback, and see which topics need
              another look on your Progress page.
            </p>
          </article>

          <article className="feature-card home-feature-card">
            <span className="feature-icon">👩‍💻</span>
            <h3>Python code runner</h3>
            <p>
              Write and run Python directly in the lesson with a Monaco editor
              and browser-based Pyodide execution.
            </p>
          </article>

          <article className="feature-card home-feature-card">
            <span className="feature-icon">🎙️</span>
            <h3>Interview mode</h3>
            <p>
              Practice explaining concepts aloud, reveal suggested answers, and
              mark shaky questions for review.
            </p>
          </article>
        </div>
      </section>

      <section className="home-learning-path">
        <div>
          <p className="eyebrow">Start here</p>
          <h2>Python Core</h2>

          <p>
            Begin with variables and assignment, then move step by step through
            the foundations every junior developer should explain with
            confidence.
          </p>
        </div>

        <Link
          to="/lessons/variables-and-assignment"
          className="button button-primary"
        >
          Open first lesson
        </Link>
      </section>

      <section className="home-final-cta">
        <h2>Ready for the next bite?</h2>

        <p>
          Learn a concept, test it, explain it, and keep going. Python gets much
          friendlier when every idea has a picture, a practice task, and a clear
          explanation.
        </p>

        <div className="hero-actions">
          <Link to="/tracks" className="button button-primary">
            View tracks
          </Link>

          <Link to="/dashboard" className="button button-secondary">
            See progress
          </Link>
        </div>
      </section>
    </main>
  );
}

export default HomePage;