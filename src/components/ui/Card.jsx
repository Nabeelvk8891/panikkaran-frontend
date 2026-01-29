export default function Card({ children }) {
  return (
    <div className="
      w-full max-w-md
      bg-white
      rounded-2xl
      shadow-xl
      p-6 sm:p-8
    ">
      {children}
    </div>
  );
}
