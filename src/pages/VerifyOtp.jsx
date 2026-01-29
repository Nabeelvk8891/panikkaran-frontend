import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  verifyEmailOtp,
  resendEmailOtp,
} from "../services/authApi";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  /* 🚫 Redirect if email missing */
  useEffect(() => {
    if (!email) navigate("/login", { replace: true });
  }, [email, navigate]);

  /* ⏳ Stable cooldown timer */
  useEffect(() => {
    if (cooldown <= 0) return;

    const timeout = setTimeout(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [cooldown]);

  /* ✅ VERIFY OTP + AUTO LOGIN */
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || loading) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await verifyEmailOtp({ email, otp });

      const { token, user, role } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem(
        "auth",
        JSON.stringify({ user, token, role })
      );

      if (role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Invalid or expired OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  /* 🔁 RESEND OTP */
  const handleResendOtp = async () => {
    if (cooldown > 0 || loading) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await resendEmailOtp({ email });
      setMessage(res.data.message || "OTP sent again");
      setCooldown(60); // ✅ start countdown
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Please wait before resending OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white border rounded-xl p-6 max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-2 text-center">
          Verify Email
        </h2>

        <p className="text-sm text-gray-600 mb-4 text-center">
          Enter OTP sent to <br />
          <span className="font-medium">{email}</span>
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className="w-full border rounded-lg px-3 py-2 text-center tracking-widest"
          />

          {message && (
            <p className="text-sm text-center text-red-500">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleResendOtp}
            disabled={cooldown > 0 || loading}
            className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
          >
            {cooldown > 0
              ? `Resend OTP in ${cooldown}s`
              : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}
