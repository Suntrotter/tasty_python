import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

function RequireAdminAuth() {
  const location = useLocation();

  const {
    currentUser,
    backendUser,
    isAuthLoading,
    isBackendUserLoading,
  } = useAuth();

  if (isAuthLoading || isBackendUserLoading) {
    return (
      <main className="page admin-login-page">
        <section className="admin-login-card">
          <p className="eyebrow">Admin access</p>
          <h1>Checking your kitchen pass...</h1>
          <p>Please wait while we verify your admin access.</p>
        </section>
      </main>
    );
  }

  if (!currentUser) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  if (!backendUser?.is_admin) {
    return (
      <main className="page admin-login-page">
        <section className="admin-login-card">
          <p className="eyebrow">Access denied</p>
          <h1>This kitchen is for admins only.</h1>
          <p>
            You are signed in, but this account does not have admin access.
          </p>
        </section>
      </main>
    );
  }

  return <Outlet />;
}

export default RequireAdminAuth;