export default function Hero() {
  return (
    <section
      className="
        relative
        min-h-[50vh] sm:min-h-[70vh] md:min-h-[85vh]
        flex items-center justify-center
        px-4
        text-white
      "
      style={{
        backgroundImage: "url('/hero-workers.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/25" />

      {/* Content */}
      <div className="relative max-w-3xl text-center">
        <h1
          className="
            text-2xl sm:text-4xl md:text-5xl lg:text-6xl
            font-extrabold
            leading-tight
          "
          style={{
            textShadow: "0 4px 12px rgba(0,0,0,0.45)",
          }}
        >
          Find Trusted Workers Near You
        </h1>

        <p
          className="
            mt-3 sm:mt-4
            text-xs sm:text-base md:text-lg
            text-white/90
          "
          style={{
            textShadow: "0 2px 6px rgba(0,0,0,0.35)",
          }}
        >
          A simple platform connecting daily-wage workers with people who need reliable work done.
        </p>
      </div>
    </section>
  );
}
