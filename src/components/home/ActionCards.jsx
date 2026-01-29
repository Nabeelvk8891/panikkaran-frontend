import { useNavigate } from "react-router-dom";
import { FaBriefcase, FaUsers } from "react-icons/fa";

export default function ActionCards() {
  const navigate = useNavigate();

  return (
    <section className="py-14 px-4 bg-gradient-to-b from-white via-blue-50/40 to-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">

        {/* 🔹 Post Work */}
        <div
          onClick={() => navigate("/post-job")}
          className="
            cursor-pointer
            bg-white
            border
            rounded-2xl
            p-6 sm:p-8
            shadow-sm
            hover:shadow-md
            transition
            group
          "
        >
          <div
            className="
              w-12 h-12 rounded-xl
              bg-blue-50
              text-blue-600
              flex items-center justify-center
              mb-4
              transition
            "
          >
            <FaBriefcase className="text-xl" />
          </div>

          <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-900">
            Post Your Work
          </h3>

          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Are you a skilled worker? Post your service details and let people contact you directly.
          </p>

          {/* Button */}
          <div className="mt-5 flex">
            <span
              className="
                inline-flex items-center justify-center
                px-4 py-2
                text-xs sm:text-sm
                font-medium
                rounded-lg
                bg-blue-600 text-white
              "
            >
              Get started →
            </span>
          </div>
        </div>

        {/* 🔹 Find Workers */}
        <div
          onClick={() => navigate("/workers")}
          className="
            cursor-pointer
            bg-white
            border
            rounded-2xl
            p-6 sm:p-8
            shadow-sm
            hover:shadow-md
            transition
            group
          "
        >
          <div
            className="
              w-12 h-12 rounded-xl
              bg-gray-100
              text-gray-700
              flex items-center justify-center
              mb-4
            "
          >
            <FaUsers className="text-xl" />
          </div>

          <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-900">
            Find Workers
          </h3>

          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Looking for skilled workers nearby? Browse by skill, location, and daily wage.
          </p>

          {/* Button */}
          <div className="mt-5 flex">
            <span
              className="
                inline-flex items-center justify-center
                px-4 py-2
                text-xs sm:text-sm
                font-medium
                rounded-lg
                bg-gray-900 text-white
              "
            >
              Browse workers →
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
