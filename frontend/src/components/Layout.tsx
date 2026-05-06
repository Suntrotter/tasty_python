import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { isAdminLoggedIn, logoutAdmin } from "../features/admin/adminAuth";

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminArea =
    location.pathname === "/admin" || location.pathname.startsWith("/admin/");

  const showAdminBar = isAdminArea && isAdminLoggedIn();

  function handleLogout() {
    logoutAdmin();
    navigate("/", { replace: true });
  }

  return (
    <div className="app">
      <header className="site-header">
        <Link to="/" className="logo">
          <img
            src="/Logo.png"
            alt="Tasty Python logo"
            className="logo-image"
          />
          <span>Tasty Python</span>
        </Link>

        <nav className="site-nav">
          <NavLink to="/" end>
            Home
          </NavLink>

          <NavLink to="/tracks">Tracks</NavLink>

          <NavLink to="/dashboard">Progress</NavLink>

          <NavLink to="/interview-mode">Interview Mode</NavLink>
        </nav>
      </header>

      {showAdminBar && (
        <div className="admin-session-bar">
          <div>
            <strong>Admin mode</strong>
            <span>Managing Tasty Python content</span>
          </div>

          <button type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      )}

      <Outlet />
    </div>
  );
}

export default Layout;