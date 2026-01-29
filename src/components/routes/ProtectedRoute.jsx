import { Navigate } from "react-router-dom";
import {
  isAuthenticated,
  isUserBlocked,
  logout,
} from "../../utils/auth";

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (isUserBlocked()) {
    logout();
    return <Navigate to="/login?blocked=true" replace />;
  }

  return children;
}

