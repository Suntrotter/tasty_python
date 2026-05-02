import { Link, Outlet } from "react-router-dom";
import ApiStatus from "./ApiStatus";

function Layout() {
  return (
    <div className="app">
      <header className="site-header">
        <Link to="/" className="logo">
          Tasty Python
        </Link>

        <nav className="site-nav">
          <Link to="/">Home</Link>
          <Link to="/tracks">Tracks</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/interview-mode">Interview Mode</Link>
        </nav>

        <ApiStatus />
      </header>

      <Outlet />
    </div>
  );
}

export default Layout;