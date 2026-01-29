import api from "./api";

/* ================= GET ================= */
export const getNotifications = () => {
  return api.get("/notifications");
};

/* ================= READ ================= */
export const markNotificationRead = (id) => {
  return api.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsRead = () => {
  return api.patch("/notifications/read-all");
};

/* ================= CLEAR ================= */
export const clearAllNotifications = () => {
  return api.delete("/notifications/clear");
};
