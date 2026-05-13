import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";

interface LocationState {
  from?: {
    pathname?: string;
  };
}

function AdminLoginPage() {
  const location = useLocation();

  const {
    currentUser,
    backendUser,
    isAuthLoading,
    isBackendUserLoading,
  } = useAuth();

  const locationState = location.state as LocationState | null;
  const targetPath = locationState?.from?.pathname || "/admin";

  if (isAuthLoading || isBackendUserLoading) {
    return (
      <main className="page admin-login-page">
        <section className="admin-login-card">
          <p className="eyebrow">Admin access</p>
          <h1>Checking your kitchen pass...</h1>
          <p>Please wait while we verify your account.</p>
        </section>
      </main>
    );
  }

  if (currentUser && backendUser?.is_admin) {
    return <Navigate to={targetPath} replace />;
  }

  return (
    <main className="page admin-login-page">
      <section className="admin-login-card">
        <p className="eyebrow">Admin access</p>

        <h1>Open the kitchen door.</h1>

        {!currentUser ? (
          <>
            <p>
              Sign in with an account that has admin access to manage tracks,
              lessons, sections, practice tasks, and learning content.
            </p>

            <div className="completion-actions">
              <Link to="/login" className="button button-primary">
                Sign in
              </Link>

              <Link to="/" className="button">
                Back home
              </Link>
            </div>
          </>
        ) : (
          <>
            <p>
              You are signed in, but this account does not have admin access.
            </p>

            <div className="completion-actions">
              <Link to="/dashboard" className="button button-primary">
                Go to dashboard
              </Link>

              <Link to="/" className="button">
                Back home
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default AdminLoginPage;