import api from "./api";

/* ================= GET MESSAGES ================= */
export const getMessages = async (chatId) => {
  const res = await api.get(`/messages/${chatId}`);
  return res.data;
};
