import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobById, getJobReviews } from "../services/jobApi";
import { getUser, isAuthenticated } from "../utils/auth";
import AppointmentModal from "../components/AppointmentModal";
import ReviewModal from "../components/ReviewModal";
import ReportModal from "../components/ReportModal";
import {
  FaUserCircle,
  FaMapMarkerAlt,
  FaClock,
  FaLayerGroup,
  FaMoneyBill,
  FaShieldAlt,
  FaExclamationTriangle,
  FaBriefcase,
  FaCheckCircle,
} from "react-icons/fa";

/* ---------------- helpers ---------------- */
const getRelativeTime = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(diff / 3600000);
  const day = Math.floor(diff / 86400000);

  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  if (hr < 24) return `${hr} hour${hr > 1 ? "s" : ""} ago`;
  if (day < 7) return `${day} day${day > 1 ? "s" : ""} ago`;

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getUser();

  const [job, setJob] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAppointment, setOpenAppointment] = useState(false);
  const [openReview, setOpenReview] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);

  const touchX = useRef(0);

  const fetchReviews = async () => {
    const res = await getJobReviews(id);
    setReviews(res.data || []);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getJobById(id);
        setJob(res.data);
        await fetchReviews();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!job?.images || job.images.length <= 1) return;
    const t = setInterval(() => {
      setActiveImage((p) =>
        p === job.images.length - 1 ? 0 : p + 1
      );
    }, 3500);
    return () => clearInterval(t);
  }, [job]);

  if (loading) return <div className="py-20 text-center">Loading…</div>;
  if (!job) return <div className="py-20 text-center">Job not found</div>;

  const employer = job.user;
  const isOwner = user?._id === employer?._id;
  const disableActions = !isAuthenticated() || isOwner;
  const images = job.images || [];

  /* swipe handlers */
  const onTouchStart = (e) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) < 50) return;
    setActiveImage((p) =>
      dx > 0 ? (p === 0 ? images.length - 1 : p - 1)
             : (p === images.length - 1 ? 0 : p + 1)
    );
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div
              className="bg-white rounded-2xl border overflow-hidden"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {images.length ? (
                <>
                  <img
                    src={images[activeImage]}
                    className="w-full h-[240px] sm:h-[300px] lg:h-[360px] object-cover"
                  />
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        onClick={() => setActiveImage(i)}
                        className={`w-20 h-20 rounded-lg object-cover border cursor-pointer ${
                          activeImage === i ? "border-black" : "border-transparent"
                        }`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[240px] flex items-center justify-center text-gray-400">
                  No images
                </div>
              )}
            </div>

            {/* Job Info */}
            <div className="bg-white rounded-2xl border p-5">
              <h1 className="text-2xl font-semibold">{job.title}</h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                <FaMapMarkerAlt /> {job.location}
              </p>

              {job.wage && (
                <div className="mt-3 inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-semibold">
                  <FaMoneyBill /> {job.wage}
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {job.skills?.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 bg-gray-100 rounded-full text-xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border p-5">
              <h2 className="text-lg font-semibold mb-2">Job Description</h2>
              <p
                className={`text-sm text-gray-700 leading-relaxed ${
                  !showFullDesc ? "line-clamp-4" : ""
                }`}
              >
                {job.description}
              </p>
              {job.description?.length > 200 && (
                <button
                  onClick={() => setShowFullDesc((p) => !p)}
                  className="mt-2 text-sm text-blue-600"
                >
                  {showFullDesc ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          </div>

          {/* RIGHT (mobile grid like OLX) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">

            {/* Employer */}
            <div
              className="bg-white rounded-2xl border p-6"
            >
              <div className="flex gap-4 items-center">
                {employer?.profileImage ? (
                  <img
                    src={employer.profileImage}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="w-16 h-16 text-gray-400" />
                )}
                <div>
                  <p className="font-semibold flex items-center gap-2">
                    {employer?.name}
                    <span className="text-green-600 text-xs flex items-center gap-1">
                      <FaCheckCircle /> Panikkaran Verified
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    {employer?.profession}
                  </p>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600 space-y-1">
                <p className="flex items-center gap-2">
                  <FaBriefcase /> {employer?.experience}
                </p>
                <p className="flex items-center gap-2">
                  <FaMapMarkerAlt /> {employer?.location}
                </p>
              </div>
              <button
  onClick={() => navigate(`/profile/${job.user._id}`)}
  className="mt-2 inline-flex items-center gap-2 rounded-md border px-3 py-1.5
             text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
>
  View Profile →
</button>


              <button
                disabled={disableActions}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenAppointment(true);
                }}
                className={`mt-5 w-full py-3 rounded-xl font-semibold ${
                  disableActions
                    ? "bg-gray-300 text-gray-600"
                    : "bg-indigo-600 text-white"
                }`}
              >
                Request Appointment
              </button>

              <button
                disabled={disableActions}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenReview(true);
                }}
                className="mt-2 w-full py-2 rounded-xl bg-gray-100"
              >
                Add Review
              </button>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl border p-6 space-y-2">
              <h3 className="font-semibold">Job Summary</h3>
              <p className="flex items-center gap-2 text-sm">
                <FaLayerGroup /> {job.category || "General"}
              </p>
              <p className="flex items-center gap-2 text-sm">
                <FaClock /> {job.jobDuration || "Flexible"}
              </p>
              <p className="flex items-center gap-2 text-sm">
                <FaClock /> {getRelativeTime(job.createdAt)}
              </p>
            </div>

            {/* Safety */}
            <div className="bg-white rounded-2xl border p-6 space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <FaShieldAlt /> Safety & Trust
              </h3>
              <p className="text-sm text-gray-600">
                Avoid advance payments. Verify details before appointments.
              </p>
              <button
                disabled={disableActions}
                onClick={() => setOpenReport(true)}
                className="text-sm underline text-red-600"
              >
                <FaExclamationTriangle className="inline mr-1" />
                Report this job
              </button>
            </div>
          </div>
        </div>

        {/* Reviews – full width bottom */}
        <div className="mt-10 bg-white rounded-2xl border p-5">
          <h2 className="text-lg font-semibold mb-3">Reviews</h2>
          {reviews.length === 0 && (
            <p className="text-sm text-gray-500">No reviews yet</p>
          )}
          {reviews.map((r) => (
            <div key={r._id} className="border-t pt-3">
              <div className="flex justify-between">
                <p className="text-sm font-semibold">{r.user?.name}</p>
                <p className="text-xs text-yellow-500">
                  {"★".repeat(r.rating)}
                </p>
              </div>
              {r.comment && (
                <p className="mt-1 text-sm text-gray-600">{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {openAppointment && (
        <AppointmentModal job={job} onClose={() => setOpenAppointment(false)} />
      )}
      {openReview && (
        <ReviewModal
          jobId={job._id}
          onSuccess={fetchReviews}
          onClose={() => setOpenReview(false)}
        />
      )}
      {openReport && (
        <ReportModal job={job} onClose={() => setOpenReport(false)} />
      )}
    </>
  );
}
