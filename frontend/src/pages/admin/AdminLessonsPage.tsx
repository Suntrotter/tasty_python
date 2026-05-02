import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchLessons } from "../../api/lessonsApi";
import { lessons as localLessons } from "../../data/lessons";
import type { LessonPreview } from "../../types/curriculum";

function AdminLessonsPage() {
  const [lessons, setLessons] = useState<LessonPreview[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadLessons() {
      try {
        const apiLessons = await fetchLessons();
        setLessons(apiLessons);
      } catch {
        setLessons(localLessons);
        setErrorMessage("Backend is not available. Showing local demo data.");
      }
    }

    loadLessons();
  }, []);

  return (
    <main className="page">
      <section className="page-intro">
        <p className="eyebrow">Admin</p>
        <h1>Lessons</h1>
        <p>View all lesson metadata. Editing and content creation will be added later.</p>

        {errorMessage && <p className="api-notice">{errorMessage}</p>}
      </section>

      <section className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Title</th>
              <th>Track</th>
              <th>Status</th>
              <th>Time</th>
              <th>Open</th>
            </tr>
          </thead>

          <tbody>
            {lessons.map((lesson) => (
              <tr key={lesson.slug}>
                <td>{lesson.order}</td>
                <td>{lesson.title}</td>
                <td>{lesson.trackSlug}</td>
                <td>{lesson.status}</td>
                <td>{lesson.estimatedTime}</td>
                <td>
                <Link to={`/admin/lessons/${lesson.slug}`}>Preview</Link>                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

export default AdminLessonsPage;