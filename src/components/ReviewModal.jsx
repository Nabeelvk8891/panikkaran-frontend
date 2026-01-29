import { useState } from "react";
import { addJobReview } from "../services/jobApi";

export default function ReviewModal({ jobId, onSuccess, onClose }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    if (!rating) {
      setError("Please select a rating");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await addJobReview(jobId, { rating, comment });
      setSuccess(true);
      onSuccess(res.data);

      // auto close after short delay
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      // ⛔ Not serviced / not completed appointment
      if (err.response?.status === 403) {
        setError(
          err.response.data?.message ||
            "You can review only after the service is completed"
        );
      } else {
        setError("Failed to submit review. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-sm rounded-xl p-6 space-y-4">
        {/* Header */}
        <h3 className="text-lg font-semibold text-gray-900">
          Add Review
        </h3>

        {/* Success State */}
        {success ? (
          <div className="text-green-600 text-sm font-medium">
            Review submitted successfully ✓
          </div>
        ) : (
          <>
            {/* Rating */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  className={`text-2xl transition ${
                    rating >= s
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            {/* Comment */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a review (optional)"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            />

            {/* Error */}
            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 border rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={submit}
                disabled={loading}
                className="flex-1 rounded-lg py-2 text-sm font-medium
                           bg-gray-900 text-white hover:bg-gray-800
                           disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
