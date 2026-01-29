import api from "./api";

export const createJob = async (data) => {
  try {
    const res = await api.post("/jobs", data);
    return res.data;
  } catch (err) {
    if (err.response?.data?.requireProfessionalProfile) {
      throw {
        requireProfessionalProfile: true,
        message: err.response.data.message,
      };
    }
    throw err;
  }
};
export const getJobs = (filters) => api.get("/jobs", { params: filters });
export const getJobById = (id) => api.get(`/jobs/${id}`);
export const getJobsByUser = (userId) =>
  api.get(`/jobs/user/${userId}`);

export const getLatestJobs = () => api.get("/jobs/latest");
export const getMyJobs = () => api.get("/jobs/my");
export const updateJob = (id, data) =>
  api.put(`/jobs/${id}`, data);

export const deleteJob = (id) =>
  api.delete(`/jobs/${id}`);

export const addJobReview = (id, data) =>
  api.post(`/jobs/${id}/reviews`, data);

export const getJobReviews = (id) =>
  api.get(`/jobs/${id}/reviews`);

export const getNearbyJobs = ({ lat, lng, radius = 10 }) =>
  api.get("/jobs/nearby", {
    params: { lat, lng, radius },
  });