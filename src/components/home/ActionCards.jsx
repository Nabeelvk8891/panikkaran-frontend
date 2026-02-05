import { useNavigate } from "react-router-dom";
import { FaBriefcase, FaUsers } from "react-icons/fa";

export default function ActionCards() {
  const navigate = useNavigate();

  return (
    <section className="py-8 sm:py-14 px-4 bg-gradient-to-b from-white via-blue-50/40 to-white">
      <div
        className="
          max-w-6xl mx-auto
          grid grid-cols-2 gap-3
          md:grid-cols-2 md:gap-6
        "
      >
        {/* Post Work */}
        <div
          onClick={() => navigate("/post-job")}
          className="
            cursor-pointer
            bg-white
            border
            rounded-xl sm:rounded-2xl
            p-4 sm:p-8
            shadow-sm
            hover:shadow-md
            transition
          "
        >
          <div
            className="
              w-9 h-9 sm:w-12 sm:h-12
              rounded-lg sm:rounded-xl
              bg-blue-50
              text-blue-600
              flex items-center justify-center
              mb-2 sm:mb-4
            "
          >
            <FaBriefcase className="text-base sm:text-xl" />
          </div>

          <h3 className="text-sm sm:text-2xl font-semibold mb-1 sm:mb-2 text-gray-900">
            Post Work
          </h3>

          <p className="text-[11px] sm:text-base text-gray-600 leading-snug sm:leading-relaxed">
            Post your service and get hired.
          </p>

          <div className="mt-3 sm:mt-5">
            <span className="inline-flex px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm font-medium rounded-md sm:rounded-lg bg-blue-600 text-white">
              Get started →
            </span>
          </div>
        </div>

        {/* Find Workers */}
        <div
          onClick={() => navigate("/workers")}
          className="
            cursor-pointer
            bg-white
            border
            rounded-xl sm:rounded-2xl
            p-4 sm:p-8
            shadow-sm
            hover:shadow-md
            transition
          "
        >
          <div
            className="
              w-9 h-9 sm:w-12 sm:h-12
              rounded-lg sm:rounded-xl
              bg-gray-100
              text-gray-700
              flex items-center justify-center
              mb-2 sm:mb-4
            "
          >
            <FaUsers className="text-base sm:text-xl" />
          </div>

          <h3 className="text-sm sm:text-2xl font-semibold mb-1 sm:mb-2 text-gray-900">
            Find Workers
          </h3>

          <p className="text-[11px] sm:text-base text-gray-600 leading-snug sm:leading-relaxed">
            Browse nearby skilled workers.
          </p>

          <div className="mt-3 sm:mt-5">
            <span className="inline-flex px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm font-medium rounded-md sm:rounded-lg bg-gray-900 text-white">
              Browse →
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
