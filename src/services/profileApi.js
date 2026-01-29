import api from "./api";

export const getMyProfile = () => api.get("/profile/me");
export const saveProfile = (data) => api.put("/profile/save", data);
export const deleteMyProfile = () => api.delete("/profile/delete");

