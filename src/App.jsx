import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { socket } from "./utils/socket";

/* Layouts */
import MainLayout from "./components/layout/MainLayout";
import AdminLayout from "./components/layout/AdminLayout";

/* Route Guards */
import PublicRoute from "./components/routes/PublicRoute";
import AdminRoute from "./components/routes/AdminRoute";
import UserRoute from "./components/routes/UserRoutes";
import HomeRoute from "./components/routes/HomeRoute";

/* Pages */
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import Dashboard from "./pages/Dashboard";
import PostJob from "./pages/PostJob";
import FindWorkers from "./pages/FindWorkers";
import ProfileEdit from "./pages/ProfileEdit";
import ProfileView from "./pages/ProfileView";
import JobDetails from "./pages/JobDetails";
import UserProfile from "./pages/UserProfile";
import EditJob from "./pages/EditJob";
import MyJobs from "./pages/MyJobs";
import Appointment from "./pages/Appointment";
import Notification from "./pages/Notification";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChatsPage from "./pages/ChatsPage";


/* Admin Pages */
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminUsers from "./pages/admin/AdminUsers";
import Reports from "./pages/admin/Reports";

export default function App() {
  const auth = JSON.parse(localStorage.getItem("auth"));
  const myId = auth?.user?._id;

  /* ================= SOCKET PRESENCE ================= */





  return (
    <Routes>
      {/* USER / PUBLIC */}
      <Route element={<MainLayout />}>
        <Route
          path="/"
          element={
            <HomeRoute>
              <Home />
            </HomeRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          path="/verify-otp"
          element={
            <PublicRoute>
              <VerifyOtp />
            </PublicRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        <Route
          path="/reset-password/:token"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />

        {/* USER ONLY */}
        <Route
          path="/dashboard"
          element={
            <UserRoute>
              <Dashboard />
            </UserRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <UserRoute>
              <Notification />
            </UserRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <UserRoute>
              <ProfileView />
            </UserRoute>
          }
        />

        <Route
          path="/profile/:id"
          element={
            <UserRoute>
              <UserProfile />
            </UserRoute>
          }
        />

        <Route
          path="/profile-edit"
          element={
            <UserRoute>
              <ProfileEdit />
            </UserRoute>
          }
        />

        <Route
          path="/post-job"
          element={
            <UserRoute>
              <PostJob />
            </UserRoute>
          }
        />

        <Route
          path="/edit-job/:id"
          element={
            <UserRoute>
              <EditJob />
            </UserRoute>
          }
        />

        <Route
          path="/workers"
          element={
            <UserRoute>
              <FindWorkers />
            </UserRoute>
          }
        />

        <Route
          path="/jobs/:id"
          element={
            <UserRoute>
              <JobDetails />
            </UserRoute>
          }
        />

        <Route
          path="/my-jobs"
          element={
            <UserRoute>
              <MyJobs />
            </UserRoute>
          }
        />

        <Route
          path="/appointments"
          element={
            <UserRoute>
              <Appointment />
            </UserRoute>
          }
        />

        <Route
          path="/chats"
          element={
            <UserRoute>
              <ChatsPage />
            </UserRoute>
          }
        />
      </Route>

      {/* ADMIN ONLY */}
      <Route
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/jobs" element={<AdminJobs />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}
