import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaTools,
  FaMoneyBill,
  FaPhone,
  FaAlignLeft,
  FaImage,
} from "react-icons/fa";
import { getJobById, updateJob } from "../services/jobApi";
import { uploadJobImages } from "../services/uploadApi";
import Button from "../components/ui/Button";

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    skills: "",
    wage: "",
    phone: "",
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  /* Load job */
  useEffect(() => {
    getJobById(id)
      .then((res) => {
        const job = res.data;
        setForm({
          title: job.title || "",
          description: job.description || "",
          location: job.location || "",
          skills: (job.skills || []).join(", "),
          wage: job.wage || "",
          phone: job.phone || "",
        });
        setExistingImages(job.images || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-6">Loading…</p>;

  /* Add new images */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalCount =
      existingImages.length + newImages.length + files.length;

    if (totalCount > 5) {
      return setError("Maximum 5 images allowed");
    }

    setNewImages((prev) => [...prev, ...files]);
    setNewPreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };

  /* Remove images */
  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index));
    setNewPreviews(newPreviews.filter((_, i) => i !== index));
  };

  /* Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      let uploadedUrls = [];

      if (newImages.length > 0) {
        uploadedUrls = await uploadJobImages(newImages);
      }

      await updateJob(id, {
        ...form,
        skills: form.skills
          ? form.skills.split(",").map((s) => s.trim())
          : [],
        images: [...existingImages, ...uploadedUrls],
      });

      setSuccess(true);
    } catch (err) {
      setError("Failed to update job");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Job</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-2xl p-6 space-y-5"
      >
        <Input
          icon={<FaBriefcase />}
          placeholder="Profession"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
        />

        <Textarea
          icon={<FaAlignLeft />}
          placeholder="Job description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <Input
          icon={<FaMapMarkerAlt />}
          placeholder="Location"
          value={form.location}
          onChange={(e) =>
            setForm({ ...form, location: e.target.value })
          }
        />

        <Input
          icon={<FaTools />}
          placeholder="Skills (comma separated)"
          value={form.skills}
          onChange={(e) =>
            setForm({ ...form, skills: e.target.value })
          }
        />

        <Input
          icon={<FaMoneyBill />}
          placeholder="Expected wage"
          value={form.wage}
          onChange={(e) =>
            setForm({ ...form, wage: e.target.value })
          }
        />

        <Input
          icon={<FaPhone />}
          placeholder="Phone number"
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
        />

        {/* 🖼️ Image Editor */}
        <div>
          <label className="flex items-center gap-2 font-medium text-sm mb-2">
            <FaImage /> Job Images (max 5)
          </label>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />

          {/* Existing Images */}
          <div className="grid grid-cols-3 gap-3 mt-3">
            {existingImages.map((img, i) => (
              <ImageCard
                key={i}
                src={img}
                onRemove={() => removeExistingImage(i)}
              />
            ))}

            {newPreviews.map((img, i) => (
              <ImageCard
                key={`new-${i}`}
                src={img}
                onRemove={() => removeNewImage(i)}
              />
            ))}
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <Button
          type="submit"
          loading={saving}
          disabled={saving}
          className="w-full"
        >
          {saving ? "Updating..." : "Update Job"}
        </Button>
      </form>

      {/* Success Popup */}
      {success && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
            <h2 className="text-lg font-semibold mb-2">
              Job Updated Successfully ✅
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Your changes have been saved.
            </p>

            <Button
              onClick={() => navigate("/dashboard", { replace: true })}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* 🔹 UI Components */
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

function ImageCard({ src, onRemove }) {
  return (
    <div className="relative">
      <img
        src={src}
        alt="Job"
        className="h-24 w-full object-cover rounded-lg"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 bg-black/70 text-white rounded-full px-2 text-xs"
      >
        ✕
      </button>
    </div>
  );
}
