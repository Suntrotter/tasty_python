import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { isAdminLoggedIn, loginAdmin } from "../../features/admin/adminAuth";

interface LocationState {
  from?: {
    pathname?: string;
  };
}

function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const locationState = location.state as LocationState | null;
  const targetPath = locationState?.from?.pathname || "/admin";

  if (isAdminLoggedIn()) {
    return <Navigate to="/admin" replace />;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const success = loginAdmin(password);

    if (!success) {
      setErrorMessage("Wrong admin password. Try again.");
      return;
    }

    navigate(targetPath, { replace: true });
  }

  return (
    <main className="page admin-login-page">
      <section className="admin-login-card">
        <p className="eyebrow">Admin access</p>

        <h1>Open the kitchen door.</h1>

        <p>
          This area is for managing tracks, lessons, sections, practice tasks,
          and learning content.
        </p>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <label htmlFor="admin-password">Admin password</label>

          <input
            id="admin-password"
            type="password"
            value={password}
            placeholder="Enter admin password"
            onChange={(event) => {
              setPassword(event.target.value);
              setErrorMessage("");
            }}
          />

          {errorMessage && <p className="admin-login-error">{errorMessage}</p>}

          <button type="submit" className="button button-primary">
            Enter admin panel
          </button>
        </form>

        <p className="admin-login-hint">
          Local dev password is controlled by{" "}
          <code>VITE_ADMIN_PASSWORD</code>.
        </p>
      </section>
    </main>
  );
}

export default AdminLoginPage;