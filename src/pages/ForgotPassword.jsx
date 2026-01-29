import { useState } from "react";
import { forgotPassword } from "../services/authApi";
import AuthForm from "../components/forms/AuthForm";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
  await forgotPassword({ email });
  setSuccess("Password reset link sent to your email 📩");
} catch (err) {
  const code = err.response?.data?.code;

  if (code === "GOOGLE_ACCOUNT") {
    setError(
      "This email is registered with Google. Please use Google login."
    );
  } else {
    setError(
      err.response?.data?.message || "Failed to send reset link"
    );
  }
}

  };

  return (
    <AuthForm
      title="Forgot Password"
      buttonText="Send Reset Link"
      loading={loading}
      error={error || success}
      onSubmit={handleSubmit}
      fields={[
        {
          name: "email",
          type: "email",
          placeholder: "Enter your email",
          value: email,
          onChange: (e) => setEmail(e.target.value),
        },
      ]}
    />
  );
}
