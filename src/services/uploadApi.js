import api from "./api";

export const uploadJobImages = async (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const token = localStorage.getItem("token"); 

  const res = await api.post("/upload/job-images", formData, {
    headers: {
      Authorization: `Bearer ${token}`
    },
  });

  return res.data.images;
};
