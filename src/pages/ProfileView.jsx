import { useEffect, useState, useCallback, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaMapMarkerAlt,
  FaTools,
  FaMoneyBill,
  FaBriefcase,
  FaEdit,
  FaPhoneAlt,
  FaPlusCircle,
} from "react-icons/fa";
import { getMyProfile } from "../services/profileApi";

export default function ProfileView() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  const mountedRef = useRef(true);

  /* ---------- Fetch Profile (SAFE + OPTIMIZED) ---------- */
  const fetchProfile = useCallback(async () => {
    try {
      const res = await getMyProfile();
      if (!mountedRef.current) return;

      const profileUser = res.data.user;
      setUser(profileUser);
      setHasProfile(res.data.hasProfile);

      // 🔥 Sync navbar DP only if changed
      const authRaw = localStorage.getItem("auth");
      if (authRaw && profileUser?.profileImage) {
        const auth = JSON.parse(authRaw);
        if (auth?.user?.profileImage !== profileUser.profileImage) {
          localStorage.setItem(
            "auth",
            JSON.stringify({
              ...auth,
              user: {
                ...auth.user,
                profileImage: profileUser.profileImage,
              },
            })
          );
        }
      }
    } catch (err) {
      console.error("PROFILE FETCH ERROR:", err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchProfile();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchProfile]);

  /* ---------- Early exits ---------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading profile…
      </div>
    );
  }

  if (!user) return null;

  /* ---------- Handlers ---------- */
  const goEdit = () => navigate("/profile-edit");
  const goJobs = () => navigate("/my-jobs");

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-6 space-y-8">

        {/* ================= PROFILE CARD ================= */}
        <div className="bg-white border rounded-2xl shadow-sm">
          {/* Header */}
          <div className="px-6 py-5 border-b flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Profile Image */}
              <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <FaUser className="text-gray-400 text-2xl" />
                )}
              </div>

              {/* Name & Phone */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {user.name}
                </h2>

                {user.phone && (
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <FaPhoneAlt /> {user.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Create / Edit Button */}
            <button
              onClick={goEdit}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2
                         text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              {hasProfile ? (
                <>
                  <FaEdit /> Edit Profile
                </>
              ) : (
                <>
                  <FaPlusCircle /> Create Profile
                </>
              )}
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6 space-y-6">
            {/* Info Grid */}
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
              <Info icon={<FaBriefcase />} label="Profession" value={user.profession} />
              <Info icon={<FaMapMarkerAlt />} label="Location" value={user.location} />
              <Info
                icon={<FaMoneyBill />}
                label="Daily Rate"
                value={user.rate && `₹${user.rate}/day`}
              />
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  About
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {user.bio}
                </p>
              </div>
            )}

            {/* Skills */}
            {user.skills?.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FaTools /> Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="rounded-full border px-3 py-1 text-xs text-gray-700 bg-gray-50"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= WORK POSTS ================= */}
        <div className="bg-white border rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Your Work Posts
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Manage the jobs you have posted or track responses.
              </p>
            </div>

            <button
              onClick={goJobs}
              className="inline-flex items-center rounded-lg bg-gray-900 px-5 py-2.5
                         text-sm font-medium text-white hover:bg-gray-800 transition"
            >
              View My Jobs →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= MEMOIZED INFO ROW ================= */
const Info = memo(function Info({ icon, label, value }) {
  if (!value) return null;

  return (
    <div className="flex items-center gap-3 text-gray-700 text-sm">
      <span className="text-gray-400">{icon}</span>
      <span className="font-medium">{label}:</span>
      <span>{value}</span>
    </div>
  );
});
