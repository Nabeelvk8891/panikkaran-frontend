import api from "./api";

export const createReport = (data) => api.post("/reports", data);
export const getAllReports = () => api.get("/reports");
export const updateReportStatus = (id, data) =>
  api.put(`/reports/${id}`, data);
