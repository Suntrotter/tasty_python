import { Link } from "react-router-dom";

function AdminDashboardPage() {
  return (
    <main className="page">
      <section className="page-intro">
        <p className="eyebrow">Admin area</p>
        <h1>Content management</h1>
        <p>
          This area will later allow admins to manage tracks, lessons, statuses,
          and full lesson content.
        </p>
      </section>

      <section className="admin-grid">
        <Link to="/admin/tracks" className="admin-card">
          <h2>Manage tracks</h2>
          <p>View and later edit learning tracks, statuses, and lesson counts.</p>
        </Link>

        <Link to="/admin/lessons" className="admin-card">
          <h2>Manage lessons</h2>
          <p>View and later edit lessons, statuses, metadata, and content.</p>
        </Link>

        <article className="admin-card admin-card-muted">
          <h2>Admin auth</h2>
          <p>Planned: protect this area with authentication and admin role checks.</p>
        </article>

        <article className="admin-card admin-card-muted">
          <h2>Content editor</h2>
          <p>Planned: structured editor for lesson sections, code examples, and practice tasks.</p>
        </article>
      </section>
    </main>
  );
}

export default AdminDashboardPage;