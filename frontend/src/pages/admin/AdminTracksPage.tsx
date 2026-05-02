import { useEffect, useState } from "react";
import { fetchTracks } from "../../api/tracksApi";
import { tracks as localTracks } from "../../data/tracks";
import type { Track } from "../../types/curriculum";
import { Link } from "react-router-dom";

function AdminTracksPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadTracks() {
      try {
        const apiTracks = await fetchTracks();
        setTracks(apiTracks);
      } catch {
        setTracks(localTracks);
        setErrorMessage("Backend is not available. Showing local demo data.");
      }
    }

    loadTracks();
  }, []);

  return (
    <main className="page">
      <section className="page-intro">
        <p className="eyebrow">Admin</p>
        <h1>Tracks</h1>
        <p>View all learning tracks. Editing will be added later.</p>

        {errorMessage && <p className="api-notice">{errorMessage}</p>}
      </section>

      <section className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Lessons</th>
            </tr>
          </thead>

          <tbody>
            {tracks.map((track) => (
              <tr key={track.slug}>
                <td>
                  <Link to={`/admin/tracks/${track.slug}`}>{track.title}</Link>
                </td>
                <td>{track.slug}</td>
                <td>{track.status}</td>
                <td>{track.lessonCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

export default AdminTracksPage;