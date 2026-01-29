import api from "./api";

export const getUserById = (id) =>
  api.get(`/users/${id}`);

export const getPhoneVisibility = (userId) =>
  api.get(`/users/${userId}/phone-visibility`);
