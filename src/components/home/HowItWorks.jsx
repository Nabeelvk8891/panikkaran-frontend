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
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-10">How It Works</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="p-6 border rounded-xl">
              <div className="text-blue-600 text-3xl mb-4 flex justify-center">
                {step.icon}
              </div>
              <h4 className="font-semibold mb-2">{step.title}</h4>
              <p className="text-gray-600 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
