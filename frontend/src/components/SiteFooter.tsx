import { Link, NavLink } from "react-router-dom";

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Link to="/" className="logo">
            <img
              src="/Logo.png"
              alt="Tasty Python logo"
              className="logo-image"
            />

            <span className="logo-wordmark">
              <span className="logo-wordmark__tasty">Tasty</span>
              <span className="logo-wordmark__python">Python</span>
            </span>
          </Link>

          <p>Junior Python interview prep with cozy metaphors and real code.</p>
        </div>

        <nav className="site-footer__nav" aria-label="Footer navigation">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/tracks">Tracks</NavLink>
          <NavLink to="/dashboard">Progress</NavLink>
          <NavLink to="/interview-mode">Interview Mode</NavLink>
          <NavLink to="/about-tasty-python">About Tasty Python</NavLink>
          <NavLink to="/about-author">About the Author</NavLink>
        </nav>
      </div>
    </footer>
  );
}

export default SiteFooter;