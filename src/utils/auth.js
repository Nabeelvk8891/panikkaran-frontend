import { socket } from "../utils/socket";

/* ================= AUTH CHANGE EVENT ================= */
const notifyAuthChange = () => {
  window.dispatchEvent(new Event("auth-change"));
};

/* ================= TOKEN ================= */
export const getToken = () => localStorage.getItem("token");

/* ================= AUTH OBJECT ================= */
export const getAuth = () => {
  try {
    const auth = localStorage.getItem("auth");
    if (!auth) return null;
    return JSON.parse(auth);
  } catch {
    return null;
  }
};

/* ================= USER ================= */
export const getUser = () => getAuth()?.user || null;

/* ================= ROLE ================= */
export const getRole = () => localStorage.getItem("role");

/* ================= AUTH STATUS ================= */
export const isAuthenticated = () =>
  !!localStorage.getItem("token") &&
  !!localStorage.getItem("auth");

export const isUserBlocked = () => getUser()?.isBlocked === true;

/* ================= SOCKET AUTH SYNC ================= */

// 🔥 DO NOT block rebinds
let listenersAttached = false;

const syncSocketAuth = () => {
  const user = getUser();
  if (!user?._id) return;

  // ensure connection
  if (!socket.connected) {
    socket.connect();
  }

  // 🔥 ALWAYS emit online (safe)
  socket.emit("online", user._id);
  console.log("🟢 ONLINE EMITTED:", user._id);

  // attach listeners ONCE
  if (listenersAttached) return;
  listenersAttached = true;

  socket.on("connect", () => {
    console.log("✅ SOCKET CONNECTED:", socket.id);
    const currentUser = getUser();
    if (currentUser?._id) {
      socket.emit("online", currentUser._id);
      console.log("🟢 RE-ONLINE (reconnect):", currentUser._id);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("🔴 SOCKET DISCONNECTED:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("Socket error:", err.message);
  });
};

/* ================= INITIAL SYNC ================= */
// page load / refresh
setTimeout(syncSocketAuth, 0);

/* ================= LISTEN FOR AUTH CHANGES ================= */
window.addEventListener("auth-change", syncSocketAuth);

/* ================= LOGIN ================= */
export const setAuth = (data) => {
  if (!data?.token || !data?.user) return;

  localStorage.setItem("token", data.token);
  localStorage.setItem("auth", JSON.stringify(data));
  localStorage.setItem("role", data.role || data.user.role);

  notifyAuthChange(); // 🔥 triggers socket sync
};

/* ================= LOGOUT ================= */
export const logout = () => {
  try {
    if (socket.connected) {
      socket.disconnect(); // triggers lastSeen on backend
    }
  } catch {}

  localStorage.clear();
  notifyAuthChange();
};
