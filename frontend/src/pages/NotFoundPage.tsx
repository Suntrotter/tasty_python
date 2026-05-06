import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <main className="page not-found-page">
      <section className="not-found-card">
        <p className="eyebrow">404</p>

        <h1>This recipe is not on the menu.</h1>

        <p>
          The page you opened does not exist, or the lesson has not been added
          yet. No worries — the Python kitchen is still open.
        </p>

        <div className="hero-actions">
          <Link to="/" className="button button-primary">
            Go home
          </Link>

          <Link to="/tracks" className="button button-secondary">
            View tracks
          </Link>
        </div>
      </section>
    </main>
  );
}

export default NotFoundPage;