import api from "./api";

/* DASHBOARD */
export const getAdminDashboard = () =>
  api.get("/admin/dashboard");

/* USERS */
export const getAdminUsers = (page = 1, search = "") =>
  api.get("/admin/users", { params: { page, search } });

export const blockUser = (id) =>
  api.put(`/admin/users/${id}/block`);

export const unblockUser = (id) =>
  api.put(`/admin/users/${id}/unblock`);

export const deleteUser = (id) =>
  api.delete(`/admin/users/${id}`);

/* JOBS */
export const getAdminJobs = (page = 1, search = "") =>
  api.get("/admin/jobs", { params: { page, search } });

export const getJobsByUser = (userId) =>
  api.get(`/admin/jobs/user/${userId}`);

export const blockJob = (id, reason) =>
  api.put(`/admin/jobs/${id}/block`, { reason });

export const unblockJob = (id) =>
  api.put(`/admin/jobs/${id}/unblock`);

export const deleteJobAdmin = (id) =>
  api.delete(`/admin/jobs/${id}`);
