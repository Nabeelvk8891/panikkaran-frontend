export default function Button({
  children,
  loading,
  type = "button",
  onClick,
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`
        w-full
        py-3
        rounded-lg
        bg-blue-600
        text-white
        font-medium
        hover:bg-blue-700
        transition
        disabled:opacity-60
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
