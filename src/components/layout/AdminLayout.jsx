import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <AdminSidebar />

      <main
        className="
          pt-14 md:pt-0
          transition-all duration-300
          pl-0 md:pl-[var(--sidebar-width)]
          px-4 sm:px-6 py-6
        "
      >
        <Outlet />
      </main>
    </div>
  );
}

