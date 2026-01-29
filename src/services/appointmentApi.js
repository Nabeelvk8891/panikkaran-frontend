import axios from "./api";

export const getUserAppointments = (workerId) =>
  axios.get(`/appointments/sent/${workerId}`);

export const createAppointment = (payload) => {
  return axios.post("/appointments", payload);
};

export const getSentAppointments = () => {
  return axios.get("/appointments/sent");
};

export const getReceivedAppointments = () => {
  return axios.get("/appointments/received");
};

export const updateAppointmentStatus = (
  appointmentId,
  status,
  reason = null
) => {
  return axios.patch(`/appointments/${appointmentId}/status`, {
    status,
    reason,
  });
};


export const cancelAppointment = (id, reason) =>
  axios.patch(`/appointments/${id}/cancel`, { reason });


export const deleteAppointment = (id) =>
  axios.delete(`/appointments/${id}`);

export const getWorkerAcceptedSlots = (workerId) =>
  axios.get(`/appointments/worker/${workerId}/accepted`);

export const checkChatPermission = (appointmentId) =>
  axios.get(`/appointments/${appointmentId}/chat-permission`);
