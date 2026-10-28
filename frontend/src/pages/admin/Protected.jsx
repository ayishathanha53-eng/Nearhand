
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function AdminProtectedRoute() {
  const token = localStorage.getItem("adminToken");
  const location = useLocation();

  if (!token) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          unauthorized: true,
          message: "403 Forbidden: You must log in as an administrator to access this page.",
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
}
