import api from "./api";

/* ================= GET MY CHATS ================= */
export const getChats = async () => {
  const res = await api.get("/chats");
  return res.data;
};

/* ================= CLEAR CHAT (ONLY ME) ================= */
export const clearChatForMe = async (chatId) => {
  const res = await api.post(`/chats/clear/${chatId}`);
  return res.data;
};

/* ================= DELETE CHAT (BOTH SIDES) ================= */
export const deleteChatForBoth = async (chatId) => {
  const res = await api.delete(`/chats/${chatId}`);
  return res.data;
};
