import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../../utils/auth";

export default function HomeRoute({ children }) {
  const role = localStorage.getItem("role");

  if (isAuthenticated()) {
    return role === "admin"
      ? <Navigate to="/admin/jobs" replace />
      : <Navigate to="/dashboard" replace />;
  }

  return children;
}
