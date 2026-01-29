import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import AuthForm from "../components/forms/AuthForm";
import GoogleButton from "../components/ui/GoogleButton";

import useAuthForm from "../hooks/useAuthForm";
import { setAuth } from "../utils/auth";

import {
  loginUser,
  googleLogin,
  resendEmailOtp,
} from "../services/authApi";

export default function Login() {
  const navigate = useNavigate();
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  const {
    form,
    handleChange,
    loading,
    setLoading,
    error,
    setError,
  } = useAuthForm({
    email: "",
    password: "",
  });

  /* ================= EMAIL + PASSWORD LOGIN ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const res = await loginUser({
        email: form.email,
        password: form.password,
      });

      const { token, user } = res.data;

      /* ✅ STORE AUTH + ROLE */
      setAuth({
        token,
        user,
        role: user.role,
      });

      /* ✅ ROLE BASED REDIRECT */
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      const code = err.response?.data?.code;
      const message =
        err.response?.data?.message || "Login failed";

      /* 🔒 BLOCKED USER */
      if (code === "USER_BLOCKED") {
        setError(
          "Your account has been blocked by admin. " +
            "If you think this is a mistake, please mail to admin@panikkaran.com"
        );
        return;
      }

      /* 🔴 EMAIL NOT VERIFIED */
      if (message.toLowerCase().includes("verify")) {
        setUnverifiedEmail(form.email);
        setError("Email not verified. Please verify to continue.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESEND OTP ================= */

  const handleResendOtp = async () => {
    if (!unverifiedEmail || loading) return;

    setLoading(true);
    setError("");

    try {
      await resendEmailOtp({ email: unverifiedEmail });
      setError("OTP resent to your email 📩");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to resend OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= GOOGLE LOGIN ================= */

  const handleGoogleSuccess = async (credentialResponse) => {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await googleLogin({
        token: credentialResponse.credential,
      });

      const { token, user } = res.data;

      /* ✅ STORE AUTH + ROLE */
      setAuth({
        token,
        user,
        role: user.role,
      });

      /* ✅ ROLE BASED REDIRECT */
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      const code = err.response?.data?.code;

      if (code === "USER_BLOCKED") {
        setError(
          "Your account has been blocked by admin. " +
            "If you think this is a mistake, please mail to admin@panikkaran.com"
        );
        return;
      }

      setError("Google login failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <AuthForm
      title="Login"
      buttonText="Login"
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
      fields={[
        {
          name: "email",
          type: "email",
          placeholder: "Email",
          onChange: handleChange,
        },
        {
          name: "password",
          type: "password",
          placeholder: "Password",
          onChange: handleChange,
        },
      ]}
      footer={
        <>
          <div className="text-right text-xs mb-2">
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* 🔴 EMAIL NOT VERIFIED OPTIONS */}
          {unverifiedEmail && (
            <div className="mt-3 text-center space-y-2">
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-blue-600 text-sm hover:underline"
                disabled={loading}
              >
                Resend OTP
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/verify-otp", {
                    state: { email: unverifiedEmail },
                  })
                }
                className="block text-sm text-green-600 hover:underline"
              >
                Verify OTP
              </button>
            </div>
          )}

          {/* ✅ GOOGLE BUTTON (SAFE) */}
          <div className="mt-4">
            <GoogleButton
              onSuccess={handleGoogleSuccess}
              type="button"
            />
          </div>

          <div className="mt-4 text-sm text-center">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 hover:underline font-medium"
            >
              Create account
            </Link>
          </div>
        </>
      }
    />
  );
}
