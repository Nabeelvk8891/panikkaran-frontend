import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../../utils/auth";

export default function AdminRoute({ children }) {
  const role = localStorage.getItem("role");

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
