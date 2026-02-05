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
      (pos) =>
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
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

        setJobs(mergedJobs.filter((job) => !job.isBlocked).slice(0, 6));
      } catch {
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_65%)]" />

        <div className="relative max-w-7xl mx-auto px-4 py-10 sm:py-20 text-center">
          <h1 className="text-2xl sm:text-5xl font-bold text-gray-900 leading-tight">
            Skilled work,
            <span className="block text-blue-600">real opportunities</span>
          </h1>

          <p className="mt-3 sm:mt-6 text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
            Find trusted daily-wage jobs and workers near you.
          </p>

     {/* ================= ACTIONS ================= */}
<div className="mt-7 sm:mt-10">

  {/* ===== MOBILE ACTION CARDS (REFINED) ===== */}
  <div className="sm:hidden grid grid-cols-2 gap-3">
    {/* Find Workers */}
    <div
      onClick={() => navigate("/workers")}
      className="
        cursor-pointer
        bg-white
        border
        rounded-2xl
        p-4
        shadow-sm
        transition
        active:scale-95
      "
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <FaSearch className="text-base" />
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900 leading-tight">
            Find Workers
          </p>
          <p className="text-xs text-gray-500">
            Nearby skills
          </p>
        </div>
      </div>
    </div>

    {/* Post Job */}
    <div
      onClick={() => navigate("/post-job")}
      className="
        cursor-pointer
        bg-white
        border
        rounded-2xl
        p-4
        shadow-sm
        transition
        active:scale-95
      "
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <FaPlusCircle className="text-base" />
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900 leading-tight">
            Post Job
          </p>
          <p className="text-xs text-gray-500">
            Post your job
          </p>
        </div>
      </div>
    </div>
  </div>

  {/* ===== MOBILE MY JOBS BUTTON ===== */}
  <button
    onClick={() => navigate("/my-jobs")}
    className="
      sm:hidden
      mt-3
      w-full
      flex items-center justify-center gap-2
      rounded-xl
      bg-white
      border
      px-4 py-3
      text-sm font-medium
      text-gray-800
      shadow-sm
      transition
      active:scale-95
    "
  >
    <FaBriefcase className="text-gray-600" />
    My Jobs
  </button>

  {/* ===== DESKTOP BUTTONS (UNCHANGED) ===== */}
  <div className="hidden sm:flex gap-4 justify-center">
    <HeroButton
      icon={<FaSearch />}
      label="Find Workers"
      primary
      onClick={() => navigate("/workers")}
    />
    <HeroButton
      icon={<FaPlusCircle />}
      label="Post Job"
      onClick={() => navigate("/post-job")}
    />
    <HeroButton
      icon={<FaBriefcase />}
      label="My Jobs"
      onClick={() => navigate("/my-jobs")}
    />
  </div>

</div>


          {hasProfile === false && (
            <div className="mt-6 mx-auto max-w-md rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-xs sm:text-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-gray-700">
                <FaUser className="text-yellow-600" />
                Complete your profile
              </div>
              <button
                onClick={() => navigate("/profile-edit")}
                className="font-medium text-blue-600"
              >
                Complete →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ================= JOB LIST ================= */}
      <section className="max-w-7xl mx-auto px-4 py-10 sm:py-16">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">
            Jobs near you
          </h2>
          <button
            onClick={() => navigate("/workers")}
            className="text-xs sm:text-sm font-medium text-blue-600"
          >
            View all →
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-gray-500">No jobs available</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs sm:text-sm text-gray-500">
          <span>© {new Date().getFullYear()} • Built for real work</span>
          <span className="text-gray-400">Simple • Local • Trustworthy</span>
        </div>
      </footer>
    </div>
  );
}

/* ================= HERO BUTTON ================= */
function HeroButton({ icon, label, onClick, primary, full }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition active:scale-95
        ${full ? "col-span-2 sm:col-span-1" : ""}
        ${
          primary
            ? "bg-blue-600 text-white shadow hover:bg-blue-700"
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
      className="cursor-pointer rounded-xl border bg-white p-4 transition hover:shadow-lg"
    >
      <div className="flex justify-between gap-3">
        <div className="flex gap-3">
          <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
            {job.user?.profileImage ? (
              <img
                src={job.user.profileImage}
                alt={job.user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <FaUser className="text-gray-400 text-xs" />
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900">
              {job.title}
            </h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <FaMapMarkerAlt /> {job.location}
            </p>
            <p className="text-[11px] text-gray-400">
              {timeAgo(job.createdAt)}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-green-600 font-semibold text-sm flex items-center justify-end gap-1">
            <FaRupeeSign /> {job.wage}
          </p>
          <span className="text-xs text-blue-600">View →</span>
        </div>
      </div>
    </div>
  );
}
