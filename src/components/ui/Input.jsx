export default function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div className="space-y-1">
      {/* Always visible label */}
      {label && (
        <label
          htmlFor={name}
          className="block text-xs font-medium text-gray-500"
        >
          {label}
        </label>
      )}

      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder} // optional (example text only)
        className="
          w-full
          px-4 py-3
          border border-gray-300
          rounded-lg
          text-sm
          bg-white
          focus:outline-none
          focus:ring-2 focus:ring-blue-500
          focus:border-blue-500
          transition
        "
      />
    </div>
  );
}
