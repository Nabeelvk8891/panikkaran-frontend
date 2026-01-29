import { useState } from "react";

export default function useAuthForm(initialState) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return {
    form,
    setForm,
    loading,
    setLoading,
    error,
    setError,
    handleChange,
  };
}
