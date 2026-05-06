import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAdminLoggedIn } from "../features/admin/adminAuth";

function RequireAdminAuth() {
  const location = useLocation();

  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export default RequireAdminAuth;