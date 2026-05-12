import { Link } from "react-router-dom";

function AboutTastyPythonPage() {
  return (
    <main className="page info-page">
      <section className="info-card">
        <p className="eyebrow">About the project</p>

        <h1>About Tasty Python</h1>

        <p>
          Tasty Python is built for junior Python interview preparation. It
          turns core Python topics into short lessons with visual metaphors,
          real code practice, instant feedback, and interview-style
          explanations.
        </p>

        <p>
          The goal is simple: help learners not only understand Python basics,
          but explain them clearly and confidently when applying for their first
          IT job.
        </p>

        <p>
          This page is still under construction. Soon it will include more about
          the course structure, learning approach, practice logic, and future
          features.
        </p>

        <div className="info-actions">
          <Link to="/tracks" className="button button-primary">
            View tracks
          </Link>

          <Link to="/" className="button button-secondary">
            Back home
          </Link>
        </div>
      </section>
    </main>
  );
}

export default AboutTastyPythonPage;