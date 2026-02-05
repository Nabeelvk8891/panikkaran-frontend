import { FaUserPlus, FaSearch, FaHandshake } from "react-icons/fa";

export default function HowItWorks() {
  const steps = [
    {
      icon: <FaUserPlus />,
      title: "Create Account",
      desc: "Register and verify your account in minutes.",
    },
    {
      icon: <FaSearch />,
      title: "Post or Search",
      desc: "Post a job or find workers easily.",
    },
    {
      icon: <FaHandshake />,
      title: "Connect & Work",
      desc: "Hire, work, and get things done.",
    },
  ];

  return (
    <>
      {/* ================= HOW IT WORKS ================= */}
      <section className="py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">
            How It Works
          </h2>

          {/* Short description (mobile-first) */}
          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto mb-6 sm:mb-10">
            Get started in just three simple steps and connect with the right people near you.
          </p>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {steps.map((step, i) => (
              <div
                key={i}
                className="p-4 sm:p-6 border rounded-xl"
              >
                <div className="text-blue-600 text-2xl sm:text-3xl mb-3 sm:mb-4 flex justify-center">
                  {step.icon}
                </div>
                <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                  {step.title}
                </h4>
                <p className="text-gray-600 text-xs sm:text-sm">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-4 py-5 sm:py-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs sm:text-sm text-gray-500">
          <span>© {new Date().getFullYear()} • Built for real work</span>
          <span className="text-gray-400">
            Simple • Local • Trustworthy
          </span>
        </div>
      </footer>
    </>
  );
}
