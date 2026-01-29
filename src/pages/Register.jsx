import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthForm from "../components/forms/AuthForm";
import useAuthForm from "../hooks/useAuthForm";
import { registerUser } from "../services/authApi";

export default function Register() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const {
    form,
    handleChange,
    loading,
    setLoading,
    error,
    setError,
  } = useAuthForm({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      await registerUser(form);
      setRegisteredEmail(form.email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white border rounded-xl p-6 text-center max-w-sm w-full">
          <h2 className="text-lg font-semibold mb-2">Verify Your Email 📩</h2>
          <p className="text-sm text-gray-600 mb-6">
            An OTP has been sent to <br />
            <span className="font-medium">{registeredEmail}</span>
          </p>

          <button
            onClick={() =>
              navigate("/verify-otp", {
                state: { email: registeredEmail },
              })
            }
            className="w-full bg-blue-600 text-white py-2 rounded-lg"
          >
            Verify OTP
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthForm
      title="Create Account"
      buttonText="Register"
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
      fields={[
        { name: "name", placeholder: "Full Name", onChange: handleChange },
        {
          name: "email",
          type: "email",
          placeholder: "Email",
          onChange: handleChange,
        },
        {
          name: "phone",
          placeholder: "Phone Number",
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
        <div className="mt-4 text-sm text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Login
          </Link>
        </div>
      }
    />
  );
}
