import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaTools,
  FaMoneyBill,
  FaPhone,
  FaAlignLeft,
  FaImage,
  FaLayerGroup,
  FaClock,
  FaInfoCircle,
  FaLocationArrow,
} from "react-icons/fa";
import Button from "../components/ui/Button";
import { createJob } from "../services/jobApi";
import { uploadJobImages } from "../services/uploadApi";
import { geocodeLocation } from "../services/geocodeApi";

import { getUser } from "../utils/auth";

export default function PostJob() {
  const navigate = useNavigate();
  const user = getUser();

  const isProfessional =
    user?.profession &&
    user?.rate &&
    Array.isArray(user?.skills) &&
    user.skills.filter((s) => s.trim()).length > 0;

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    skills: "",
    wage: "",
    phone: "",
    category: "",
    jobDuration: "",
  });

  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validateForm = () => {
  if (!form.title.trim()) return "Job title is required";
  if (!form.description.trim()) return "Job description is required";
  if (!form.location.trim() && !coords)
    return "Please add a location (manual or GPS)";
  if (!form.skills.trim()) return "Skills are required";
  if (!form.wage.trim()) return "Expected wage is required";
  if (!form.phone.trim()) return "Contact number is required";

  return null;
};


  /* ---------------- LOCATION HANDLER ---------------- */

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation not supported on this device");
      return;
    }

    setLocating(true);
    setLocationStatus("");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });

        setLocationStatus("Location added successfully ✔");
        setLocating(false);
      },
      (err) => {
        let msg = "Unable to get location. You can enter it manually.";

        if (err.code === err.PERMISSION_DENIED) {
          msg = "Location permission denied. Manual entry is available.";
        }
        if (err.code === err.TIMEOUT) {
          msg = "Location request timed out. Please try again.";
        }
        if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "Location unavailable on this device.";
        }

        setLocationStatus(msg);
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  /* ---------------- IMAGE HANDLERS ---------------- */

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + imageFiles.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---------------- SUBMIT ---------------- */

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  const validationError = validateForm();
  if (validationError) {
    setError(validationError);
    return;
  }

  setLoading(true);

  try {
    let imageUrls = [];

    if (imageFiles.length > 0) {
      imageUrls = await uploadJobImages(imageFiles);
    }

    let finalCoords = coords;

    // IF USER DID NOT USE GPS → GEOCODE TEXT LOCATION
    if (!finalCoords && form.location) {
      const geo = await geocodeLocation(form.location);
      if (geo) finalCoords = geo;
    }

    await createJob({
      ...form,
      category: form.category || "General Service",
      jobDuration: form.jobDuration || "Depends on worksite",
      skills: form.skills.split(",").map((s) => s.trim()),
      images: imageUrls,
      ...(finalCoords ? { lat: finalCoords.lat, lng: finalCoords.lng } : {}),
    });

    setSuccess(true);

} catch (err) {
  if (err.requireProfessionalProfile) {
    navigate("/profile-edit", {
      state: { needProfessionalProfile: true },
    });
    return;
  }

  let message = "Something went wrong. Please try again.";

  if (err.response?.status === 400) {
    message = "Please fill all required fields correctly";
  } else if (err.response?.status === 401) {
    message = "You must be logged in to post a job";
  } else if (err.response?.status === 500) {
    message = "Server error. Please try later";
  }

  setError(message);
} finally {
  setLoading(false);
}
};

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <h1 className="text-2xl font-bold mb-4">Post a Job</h1>

      {user && !isProfessional && (
        <div className="mb-6 flex gap-3 rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
          <FaInfoCircle className="mt-0.5 shrink-0" />
          <p>
            To post jobs, complete your
            <span className="font-semibold"> professional profile</span>.
            Required: profession, skills, and wage.
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-2xl p-6 space-y-5"
      >
        <Input
          icon={<FaBriefcase />}
          name="title"
          placeholder="Job Title / Profession"
          value={form.title}
          onChange={handleChange}
        />

        <Textarea
          icon={<FaAlignLeft />}
          name="description"
          placeholder="Job description"
          value={form.description}
          onChange={handleChange}
        />

        <Input
          icon={<FaMapMarkerAlt />}
          name="location"
          placeholder="Location (area / town)"
          value={form.location}
          onChange={handleChange}
        />

        {/* LOCATION BUTTON */}
        <div className="flex items-center justify-between text-xs mt-1">
          <span
            className={
              locationStatus.includes("successfully")
                ? "text-green-600"
                : "text-gray-500"
            }
          >
            {locationStatus ||
              "Adding location helps nearby workers find your job"}
          </span>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={locating}
            className="flex items-center gap-1 text-blue-600 hover:underline font-medium disabled:opacity-50"
          >
            <FaLocationArrow />
            {locating ? "Locating..." : "Use current location"}
          </button>
        </div>

        <Select
          icon={<FaLayerGroup />}
          name="category"
          value={form.category}
          onChange={handleChange}
        >
          <option value="">Select Job Category (optional)</option>
          <option value="Construction">Construction</option>
          <option value="Electrical">Electrical</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Carpentry">Carpentry</option>
          <option value="Painting">Painting</option>
          <option value="Repair & Maintenance">Repair & Maintenance</option>
          <option value="House Cleaning">House Cleaning</option>
          <option value="Sales & Delivery">Sales & Delivery</option>
          <option value="Healthcare Support">Healthcare Support</option>
          <option value="Cooking">Cooking</option>
          <option value="Gardening">Gardening</option>
          <option value="Other">Other</option>
        </Select>

        <Select
          icon={<FaClock />}
          name="jobDuration"
          value={form.jobDuration}
          onChange={handleChange}
        >
          <option value="">Select Job Duration (optional)</option>
          <option value="1 hour">1 hour</option>
          <option value="Few hours">Few hours</option>
          <option value="1 day">1 day</option>
          <option value="2 days">2 days</option>
          <option value="3 days">3 days</option>
          <option value="Few days">Few days</option>
          <option value="1 week">1 week</option>
          <option value="Few weeks">Few weeks</option>
          <option value="Depends on worksite">Depends on worksite</option>
        </Select>

        <Input
          icon={<FaTools />}
          name="skills"
          placeholder="Your skills (comma separated)"
          value={form.skills}
          onChange={handleChange}
        />

        <Input
          icon={<FaMoneyBill />}
          name="wage"
          placeholder="Expected wage"
          value={form.wage}
          onChange={handleChange}
        />

        <Input
          icon={<FaPhone />}
          name="phone"
          placeholder="Contact number"
          value={form.phone}
          onChange={handleChange}
        />

        <div>
          <label className="text-sm font-medium mb-2 flex items-center gap-2">
            <FaImage /> Upload Job Images (max 5)
          </label>

          <input type="file" multiple accept="image/*" onChange={handleImageChange} />

          <div className="grid grid-cols-3 gap-3 mt-3">
            {imagePreviews.map((img, i) => (
              <div key={i} className="relative">
                <img src={img} className="h-24 w-full object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-black/70 text-white rounded-full px-2 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <Button type="submit" loading={loading} disabled={loading}>
          {loading ? "Posting..." : "Post Job"}
        </Button>
      </form>

      {success && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
            <h2 className="text-lg font-semibold mb-2">
              Job Posted Successfully 🎉
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Your job is now visible to workers.
            </p>
            <Button onClick={() => navigate("/dashboard", { replace: true })}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- UI COMPONENTS ---------------- */

function Input({ icon, ...props }) {
  return (
    <div className="flex items-center gap-3 border rounded-xl px-4 py-3">
      <span className="text-gray-500">{icon}</span>
      <input {...props} className="w-full outline-none text-sm" />
    </div>
  );
}

function Textarea({ icon, ...props }) {
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
}

function Select({ icon, children, ...props }) {
  return (
    <div className="flex items-center gap-3 border rounded-xl px-4 py-3">
      <span className="text-gray-500">{icon}</span>
      <select {...props} className="w-full outline-none bg-transparent text-sm">
        {children}
      </select>
    </div>
  );
}
