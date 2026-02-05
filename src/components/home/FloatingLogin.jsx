import { useNavigate } from "react-router-dom";

export default function FloatingLogin() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  if (isLoggedIn) return null;

  return (
    <button
      onClick={() => navigate("/login")}
      className="
        fixed
        bottom-5 right-5
        z-50
        px-5 py-3
        rounded-full
        bg-blue-600
        text-white
        font-semibold
        shadow-lg
        animate-bounce
        hover:bg-blue-700
        active:scale-95
      "
    >
      Login
    </button>
  );
}
