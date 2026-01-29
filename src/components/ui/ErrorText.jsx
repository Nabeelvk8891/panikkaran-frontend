export default function ErrorText({ message }) {
  if (!message) return null;

  return (
    <p className="mb-4 text-sm text-red-600 text-center">
      {message}
    </p>
  );
}
