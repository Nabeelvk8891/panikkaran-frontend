import { socket } from "../utils/socket";

/* ================= AUTH CHANGE EVENT ================= */

const notifyAuthChange = () => {
  window.dispatchEvent(new Event("auth-change"));
};

/* ================= TOKEN ================= */

export const getToken = () => {
  return localStorage.getItem("token");
};

/* ================= AUTH OBJECT ================= */

export const getAuth = () => {
  try {
    const auth = localStorage.getItem("auth");
    if (!auth) return null;
    return JSON.parse(auth);
  } catch (err) {
    console.error("getAuth error:", err);
    return null;
  }
};

/* ================= USER ================= */

export const getUser = () => {
  const auth = getAuth();
  return auth?.user || null;
};

/* ================= ROLE ================= */

export const getRole = () => {
  return localStorage.getItem("role");
};

/* ================= AUTH STATUS ================= */

export const isAuthenticated = () => {
  return (
    !!localStorage.getItem("token") &&
    !!localStorage.getItem("auth")
  );
};

export const isUserBlocked = () => {
  const user = getUser();
  return user?.isBlocked === true;
};

/* ================= LOGIN ================= */

export const setAuth = (data) => {
  if (!data?.token || !data?.user) return;

  localStorage.setItem("token", data.token);
  localStorage.setItem("auth", JSON.stringify(data));
  localStorage.setItem("role", data.role || data.user.role);

  notifyAuthChange();
};

/* ================= LOGOUT ================= */

export const logout = () => {
  try {
    if (socket?.connected) {
      socket.emit("offline");

      setTimeout(() => {
        socket.disconnect();
      }, 100);
    }
  } catch (err) {
    console.error("Socket disconnect error:", err);
  }

  localStorage.clear();
  notifyAuthChange();
};
