import { Link } from "react-router-dom";

function AboutAuthorPage() {
  return (
    <main className="page info-page">
      <section className="info-card">
        <p className="eyebrow">About the author</p>

        <h1>About the Author</h1>

        <p>
          Tasty Python is a portfolio project created to combine frontend
          development, backend content management, learning design, and a cozy
          visual approach to technical education.
        </p>

        <p>
          The project focuses on making Python concepts easier to understand,
          remember, practice, and explain during junior developer interviews.
        </p>

        <p>
          This page is still under construction. Later it will include more
          about the author, the idea behind the project, the tech stack, and the
          development process.
        </p>

        <div className="info-actions">
          <Link to="/about-tasty-python" className="button button-primary">
            About Tasty Python
          </Link>

          <Link to="/" className="button button-secondary">
            Back home
          </Link>
        </div>
      </section>
    </main>
  );
}

export default AboutAuthorPage;