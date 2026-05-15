import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import SiteFooter from "./SiteFooter";

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    currentUser,
    backendUser,
    isAuthLoading,
    isBackendUserLoading,
    isAuthenticated,
    logout,
  } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAdminArea =
    location.pathname === "/admin" || location.pathname.startsWith("/admin/");

  const isLessonPage = location.pathname.startsWith("/lessons/");

  const isAdmin = backendUser?.is_admin === true;

  const showAdminBar = isAdminArea && isAdmin;

  const showHeaderCta = !isLessonPage && !isAdminArea && !isAuthenticated;

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  async function handleUserLogout() {
    await logout();
    setIsMenuOpen(false);
    navigate("/", { replace: true });
  }

  function toggleMenu() {
    setIsMenuOpen((currentValue) => !currentValue);
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <div className="app">
      <header className="site-header">
        <div
          className={`site-header__inner ${
            isMenuOpen ? "site-header__inner--menu-open" : ""
          }`}
        >
          <Link to="/" className="logo" onClick={closeMenu}>
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

          <button
            type="button"
            className="site-menu-toggle"
            aria-label={
              isMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={isMenuOpen}
            aria-controls="site-navigation"
            onClick={toggleMenu}
          >
            <img
              src="/burger-menu.png"
              alt=""
              aria-hidden="true"
              className="site-menu-toggle__icon"
            />
          </button>

          <nav
            id="site-navigation"
            className="site-nav"
            aria-label="Main navigation"
          >
            <NavLink to="/" end onClick={closeMenu}>
              Home
            </NavLink>

            <NavLink to="/tracks" onClick={closeMenu}>
              Tracks
            </NavLink>

            <NavLink to="/dashboard" onClick={closeMenu}>
              Progress
            </NavLink>

            <NavLink to="/interview-mode" onClick={closeMenu}>
              Interview Mode
            </NavLink>

            {isAdmin && (
              <NavLink to="/admin" onClick={closeMenu}>
                Admin
              </NavLink>
            )}
          </nav>

          <div className="header-actions">
            {showHeaderCta && (
              <Link to="/tracks" className="header-cta" onClick={closeMenu}>
                Start cooking
              </Link>
            )}

            {isAuthLoading ? (
              <span className="nav-auth-label">Checking user...</span>
            ) : isAuthenticated ? (
              <div className="nav-auth">
                <span className="nav-auth-label">
                  {isBackendUserLoading
                    ? "Syncing..."
                    : backendUser?.display_name ||
                      backendUser?.email ||
                      currentUser?.displayName ||
                      currentUser?.email ||
                      "Learner"}
                </span>

                <button
                  type="button"
                  className="button button-secondary nav-auth-button"
                  onClick={handleUserLogout}
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="nav-auth">
                <Link
                  to="/login"
                  className="button button-secondary nav-auth-button"
                  onClick={closeMenu}
                >
                  Sign in
                </Link>

                <Link
                  to="/register"
                  className="button button-primary nav-auth-button"
                  onClick={closeMenu}
                >
                  Create account
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {showAdminBar && (
        <div className="admin-session-bar">
          <div>
            <strong>Admin mode</strong>
            <span>Managing Tasty Python content</span>
          </div>

          <button type="button" onClick={handleUserLogout}>
            Log out
          </button>
        </div>
      )}

      <Outlet />
      <SiteFooter />
    </div>
  );
}

export default Layout;