import { Link, Outlet } from "react-router-dom";

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
</nav>
      </header>

      <Outlet />
    </div>
  );
}

export default Layout;