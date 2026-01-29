import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaSearch,
  FaPlusCircle,
  FaBriefcase,
  FaMapMarkerAlt,
  FaRupeeSign,
} from "react-icons/fa";
import { getLatestJobs, getNearbyJobs } from "../services/jobApi";
import { getMyProfile } from "../services/profileApi";

/* ================= TIME HELPER ================= */
const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [hasProfile, setHasProfile] = useState(null);
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= GET LOCATION ================= */
  useEffect(() => {
    if (!navigator.geolocation) return setCoords(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => setCoords(null)
    );
  }, []);

  /* ================= FETCH JOBS ================= */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let nearbyJobs = [];
        let latestJobs = [];

        if (coords?.lat && coords?.lng) {
          const nearbyRes = await getNearbyJobs({
            lat: coords.lat,
            lng: coords.lng,
            radius: 10,
          });
          nearbyJobs = nearbyRes?.data?.jobs || [];
        }

        const latestRes = await getLatestJobs();
        latestJobs = latestRes?.data?.jobs || [];

        const mergedJobs = [
          ...nearbyJobs,
          ...latestJobs.filter(
            (latest) => !nearbyJobs.some((near) => near._id === latest._id)
          ),
        ];

        setJobs(
          mergedJobs.filter((job) => !job.isBlocked).slice(0, 6)
        );
      } catch (err) {
        console.error(err);
        setJobs([]);
      } finally {
        setLoading(false);
      }

      try {
        const profileRes = await getMyProfile();
        setHasProfile(profileRes?.data?.hasProfile ?? null);
      } catch {
        setHasProfile(null);
      }
    };

    load();
  }, [coords]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* ================= HERO ================= */}
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.15),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-gray-900">
            Skilled work,
            <span className="block text-blue-600">real opportunities</span>
          </h1>

          <p className="mt-4 sm:mt-6 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Find trusted daily-wage jobs and workers near you. Fast, local and reliable.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <HeroButton
              icon={<FaSearch />}
              label="Find Workers"
              primary
              onClick={() => navigate("/workers")}
            />
            <HeroButton
              icon={<FaPlusCircle />}
              label="Post a Job"
              onClick={() => navigate("/post-job")}
            />
            <HeroButton
              icon={<FaBriefcase />}
              label="My Jobs"
              onClick={() => navigate("/my-jobs")}
            />
          </div>

          {hasProfile === false && (
            <div className="mt-8 sm:mt-10 inline-flex flex-col sm:flex-row items-center gap-3 rounded-xl border border-yellow-300 bg-yellow-50 px-5 py-3 text-sm shadow-sm">
              <div className="flex items-center gap-2">
                <FaUser className="text-yellow-600" />
                <span className="text-gray-700">
                  Complete your profile to appear in searches
                </span>
              </div>
              <button
                onClick={() => navigate("/profile-edit")}
                className="font-medium text-blue-600 hover:underline"
              >
                Complete →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ================= JOB LIST ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Opportunities near you
          </h2>
          <button
            onClick={() => navigate("/workers")}
            className="text-sm font-medium text-blue-600 hover:underline self-start sm:self-auto"
          >
            View all
          </button>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-gray-500">No jobs available right now</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onClick={() => navigate(`/jobs/${job._id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500">
          <span>© {new Date().getFullYear()} • Built for real work</span>
          <span className="text-gray-400">Simple • Local • Trustworthy</span>
        </div>
      </footer>
    </div>
  );
}

/* ================= HERO BUTTON ================= */
function HeroButton({ icon, label, onClick, primary }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-3 w-full sm:w-auto rounded-xl px-6 py-3 text-sm font-medium transition-all active:scale-95
        ${
          primary
            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
            : "bg-white border border-gray-200 text-gray-800 hover:bg-gray-50"
        }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* ================= JOB CARD ================= */
function JobCard({ job, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl border bg-white p-4 sm:p-5 transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
            {job.user?.profileImage ? (
              <img
                src={job.user.profileImage}
                alt={job.user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <FaUser className="text-gray-400 text-sm" />
            )}
          </div>

          <div>
            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition">
              {job.title}
            </h3>
            <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
              <FaMapMarkerAlt /> {job.location}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Posted {timeAgo(job.createdAt)}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right mt-2 sm:mt-0">
          <p className="text-green-600 font-semibold text-sm flex items-center sm:justify-end gap-1">
            <FaRupeeSign /> {job.wage}
          </p>
          <span className="mt-2 inline-block text-xs text-blue-600 font-medium">
            View →
          </span>
        </div>
      </div>
    </div>
  );
}
