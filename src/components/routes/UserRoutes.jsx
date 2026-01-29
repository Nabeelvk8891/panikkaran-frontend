import { Navigate } from "react-router-dom";
import {
  isAuthenticated,
  isUserBlocked,
  logout,
} from "../../utils/auth";

export default function UserRoute({ children }) {
  const role = localStorage.getItem("role");

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (isUserBlocked()) {
    logout();
    return <Navigate to="/login?blocked=true" replace />;
  }

  if (role !== "user") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
