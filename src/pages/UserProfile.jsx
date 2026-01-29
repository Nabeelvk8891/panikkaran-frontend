import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, getPhoneVisibility } from "../services/userApi";
import { getJobsByUser } from "../services/jobApi";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaBriefcase,
  FaMoneyBillWave,
  FaClock,
  FaLock,
} from "react-icons/fa";

/* ================= HELPERS ================= */
const maskPhone = (phone) => {
  if (!phone) return "—";
  return phone.replace(/\d(?=\d{4})/g, "x");
};

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [canViewPhone, setCanViewPhone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userRes = await getUserById(id);
        const jobsRes = await getJobsByUser(id);
        const phoneRes = await getPhoneVisibility(id);

        setUser(userRes.data);
        setJobs(jobsRes.data || []);
        setCanViewPhone(phoneRes.data?.canView || false);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-20 text-center text-red-500">
        User not found
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">

        {/* ================= HEADER ================= */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">

            {/* Avatar */}
            <div className="w-20 h-20 shrink-0 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-2xl font-semibold text-gray-700">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                user.name?.charAt(0)
              )}
            </div>

            {/* Basic info */}
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">
                {user.name}
              </h1>

              {user.role && (
                <p className="text-sm text-gray-500 capitalize">
                  {user.role}
                </p>
              )}

              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                {user.location && (
                  <div className="flex items-center gap-1">
                    <FaMapMarkerAlt />
                    <span>{user.location}</span>
                  </div>
                )}

                {user.phone && (
                  <div className="flex items-center gap-1">
                    <FaPhoneAlt />
                    <span>
                      {canViewPhone
                        ? user.phone
                        : maskPhone(user.phone)}
                    </span>
                  </div>
                )}
              </div>

              {!canViewPhone && user.phone && (
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <FaLock className="text-gray-400" />
                  <span>
                    Phone number will be available after appointment
                  </span>
                </div>
              )}
            </div>

            {/* Meta */}
            <div className="text-sm text-gray-500 sm:text-right">
              <p>
                Joined{" "}
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
              <p className="mt-1">
                <span className="font-medium text-gray-900">
                  {jobs.length}
                </span>{" "}
                jobs posted
              </p>
            </div>
          </div>
        </div>

        {/* ================= INFO GRID ================= */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Personal Info */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Personal Information
            </h2>

            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div>
                <p className="text-gray-500">Full Name</p>
                <p className="text-gray-900 font-medium">
                  {user.name}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Role</p>
                <p className="text-gray-900 font-medium capitalize">
                  {user.role || "—"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Phone</p>
                <p className="text-gray-900 font-medium">
                  {canViewPhone
                    ? user.phone
                    : maskPhone(user.phone)}
                </p>
                {!canViewPhone && user.phone && (
                  <p className="text-xs text-orange-500 mt-1">
                    Phone number will be available after appointment
                  </p>
                )}
              </div>

              <div>
                <p className="text-gray-500">Location</p>
                <p className="text-gray-900 font-medium">
                  {user.location || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              About
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {user.bio || "No bio information provided."}
            </p>
          </div>
        </div>

        {/* ================= JOB LIST ================= */}
        <div className="bg-white rounded-xl border">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900">
              Job Listings
            </h2>
            <span className="text-sm text-gray-500">
              {jobs.length} total
            </span>
          </div>

          {jobs.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">
              This user has not posted any jobs yet.
            </div>
          ) : (
            <div className="divide-y">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  onClick={() => navigate(`/jobs/${job._id}`)}
                  className="px-6 py-5 hover:bg-gray-50 cursor-pointer transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {job.title}
                      </h3>

                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <FaBriefcase />
                          {job.category}
                        </div>

                        <div className="flex items-center gap-1">
                          <FaMoneyBillWave />
                          ₹{job.wage}
                        </div>

                        <div className="flex items-center gap-1">
                          <FaClock />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs text-gray-400">
                      View →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
