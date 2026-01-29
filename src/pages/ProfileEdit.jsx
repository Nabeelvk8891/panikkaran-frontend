import {
  useEffect,
  useState,
  useCallback,
  useRef,
  memo,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaBriefcase,
  FaCheckCircle,
  FaPhone,
  FaMapMarkerAlt,
  FaTools,
  FaMoneyBill,
  FaAlignLeft,
  FaCamera,
} from "react-icons/fa";
import Button from "../components/ui/Button";
import {
  getMyProfile,
  saveProfile,
  deleteMyProfile,
} from "../services/profileApi";

export default function ProfileEdit() {
  const navigate = useNavigate();
  const mountedRef = useRef(true);
  const previewUrlRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [accountType, setAccountType] = useState(null);
  const [lockedEmployer, setLockedEmployer] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    location: "",
    profession: "",
    bio: "",
    skills: "",
    experience: "",
    rate: "",
  });

  /* ================= LOAD PROFILE (SAFE) ================= */
  useEffect(() => {
    mountedRef.current = true;

    (async () => {
      try {
        const res = await getMyProfile();
        if (!mountedRef.current) return;

        const u = res.data.user || {};

        const hasEmployerData =
          u.profession || u.skills?.length || u.rate;

        const hasSavedProfile =
          u.bio || u.location || hasEmployerData;

        if (hasEmployerData && hasSavedProfile) {
          setAccountType("employer");
          setLockedEmployer(true);
        }

        setForm({
          name: u.name || "",
          phone: u.phone || "",
          location: u.location || "",
          profession: u.profession || "",
          bio: u.bio || "",
          skills: u.skills?.join(", ") || "",
          experience: u.experience || "",
          rate: u.rate || "",
        });

        if (u.profileImage) setImagePreview(u.profileImage);
      } catch (err) {
        console.error("PROFILE LOAD ERROR:", err);
      }
    })();

    return () => {
      mountedRef.current = false;
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  /* ================= HANDLERS ================= */
  const handleChange = useCallback(
    (e) =>
      setForm((p) => ({ ...p, [e.target.name]: e.target.value })),
    []
  );

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;

    setProfileImage(file);
    setImagePreview(url);
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!accountType) return;

      setLoading(true);
      try {
        const formData = new FormData();

        Object.entries(form).forEach(([key, value]) => {
          if (
            accountType === "user" &&
            ["profession", "skills", "experience", "rate"].includes(key)
          )
            return;

          if (key === "skills") {
            formData.append(
              "skills",
              value ? value.split(",").map((s) => s.trim()) : []
            );
          } else {
            formData.append(key, value);
          }
        });

        if (profileImage) formData.append("image", profileImage);

        const res = await saveProfile(formData);

        const authRaw = localStorage.getItem("auth");
        if (authRaw && res.data?.user) {
          const auth = JSON.parse(authRaw);
          if (
            auth?.user?.profileImage !== res.data.user.profileImage
          ) {
            auth.user = res.data.user;
            localStorage.setItem("auth", JSON.stringify(auth));
          }
        }

        navigate("/profile");
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [accountType, form, profileImage, navigate]
  );

  const handleDeleteProfile = useCallback(async () => {
    setLoading(true);
    try {
      await deleteMyProfile();
      navigate("/profile", { replace: true });
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setConfirmDelete(false);
      }
    }
  }, [navigate]);

  /* ================= ROLE SELECTION ================= */
  if (!accountType) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-center mb-3">
          Choose how you want to use Panikkaran
        </h1>
        <p className="text-gray-600 text-center mb-10">
          You can upgrade later. Employer role locks after saving.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <RoleCard
            icon={<FaUser />}
            title="User"
            desc="Hire workers and manage jobs."
            onClick={() => setAccountType("user")}
          />
          <RoleCard
            icon={<FaBriefcase />}
            title="Employer"
            desc="Create a professional profile and get hired."
            highlight
            onClick={() => setAccountType("employer")}
          />
        </div>
      </div>
    );
  }

  /* ================= EDIT FORM ================= */
  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {lockedEmployer ? "Employer Profile" : "Edit Profile"}
      </h1>

      {!lockedEmployer && (
        <div className="mb-6 flex gap-4">
          <SwitchBtn
            active={accountType === "user"}
            onClick={() => setAccountType("user")}
            label="User"
          />
          <SwitchBtn
            active={accountType === "employer"}
            onClick={() => setAccountType("employer")}
            label="Employer"
          />
        </div>
      )}

      {/* ================= PROFILE IMAGE ================= */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-28 h-28 rounded-full border overflow-hidden bg-gray-100 flex items-center justify-center">
          {imagePreview ? (
            <img
              src={imagePreview}
              className="w-full h-full object-cover"
            />
          ) : (
            <FaUser className="text-gray-400 text-4xl" />
          )}
        </div>

        <label className="mt-3 flex items-center gap-2 text-sm text-blue-600 cursor-pointer">
          <FaCamera /> Change Photo
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageChange}
          />
        </label>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-2xl p-6 space-y-5"
      >
        <Input icon={<FaUser />} name="name" value={form.name} onChange={handleChange} placeholder="Full name" />
        <Input icon={<FaPhone />} name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number" />
        <Input icon={<FaMapMarkerAlt />} name="location" value={form.location} onChange={handleChange} placeholder="Your location" />
        <Textarea icon={<FaAlignLeft />} name="bio" value={form.bio} onChange={handleChange} placeholder="Short bio about you" />

        {accountType === "employer" && (
          <>
            <Input icon={<FaBriefcase />} name="profession" value={form.profession} onChange={handleChange} placeholder="Profession" />
            <Input icon={<FaTools />} name="skills" value={form.skills} onChange={handleChange} placeholder="Skills (comma separated)" />
            <Input icon={<FaBriefcase />} name="experience" value={form.experience} onChange={handleChange} placeholder="Experience (e.g. 3 years)" />
            <Input icon={<FaMoneyBill />} name="rate" value={form.rate} onChange={handleChange} placeholder="Daily rate" />
          </>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Save Profile
        </Button>

        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="w-full text-sm text-red-600 hover:bg-red-50 py-2 rounded-xl"
        >
          Delete Profile
        </button>
      </form>

      {confirmDelete && (
        <ConfirmPopup
          onCancel={() => setConfirmDelete(false)}
          onConfirm={handleDeleteProfile}
          loading={loading}
        />
      )}
    </div>
  );
}

/* ================= MEMOIZED SMALL COMPONENTS ================= */

const SwitchBtn = memo(function SwitchBtn({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-5 py-2 rounded-xl text-sm font-medium border
        ${active ? "bg-blue-600 text-white border-blue-600" : "bg-white"}`}
    >
      {label}
    </button>
  );
});

const RoleCard = memo(function RoleCard({
  icon,
  title,
  desc,
  onClick,
  highlight,
}) {
  return (
    <button
      onClick={onClick}
      className={`border rounded-2xl p-6 text-left transition
        hover:shadow-lg hover:border-blue-500
        ${highlight ? "border-blue-500 bg-blue-50" : ""}`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="text-3xl text-blue-600">{icon}</div>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <p className="text-sm text-gray-600 mb-4">{desc}</p>
      <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
        <FaCheckCircle /> Choose {title}
      </div>
    </button>
  );
});

const ConfirmPopup = memo(function ConfirmPopup({
  onCancel,
  onConfirm,
  loading,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="text-xl font-semibold text-center">
          Delete Profile
        </h2>
        <p className="text-sm text-gray-600 mt-2 mb-6 text-center">
          This will permanently remove your profile and all job posts
          created by you.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border rounded-xl py-2 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-600 text-white rounded-xl py-2 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
});

const Input = memo(function Input({ icon, ...props }) {
  return (
    <div className="flex items-center gap-3 border rounded-xl px-4 py-3">
      <span className="text-gray-500">{icon}</span>
      <input {...props} className="w-full outline-none text-sm" />
    </div>
  );
});

const Textarea = memo(function Textarea({ icon, ...props }) {
  return (
    <div className="flex items-start gap-3 border rounded-xl px-4 py-3">
      <span className="text-gray-500 mt-1">{icon}</span>
      <textarea
        {...props}
        rows={4}
        className="w-full outline-none resize-none text-sm"
      />
    </div>
  );
});
