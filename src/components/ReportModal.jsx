import { useState } from "react";
import { createReport } from "../services/reportApi";

export default function ReportModal({ job, onClose }) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

const submit = async () => {
  if (!job?.user?._id) {
    setError("Unable to report this job. Owner not found.");
    return;
  }

  if (!reason) {
    setError("Please select a reason for reporting");
    return;
  }

  setLoading(true);
  setError("");

  try {
    await createReport({
      reportedUser: job.user._id,
      job: job._id,
      reason,
      description: note,
    });

    setSuccess(true);
    setTimeout(onClose, 1200);
  } catch (err) {
    if (err.response?.status === 403) {
      setError("You can report this job only after the work is completed");
    } else {
      setError(
        err.response?.data?.message ||
        "Failed to submit report. Please try again."
      );
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
          Report Job
        </h3>

        {/* Success */}
        {success ? (
          <p className="text-sm text-green-600 font-medium">
            Report submitted successfully ✓
          </p>
        ) : (
          <>
            {/* Reason */}
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-black/10"
            >
              <option value="">Select reason</option>
              <option value="spam">Spam</option>
              <option value="fake">Fake Job</option>
              <option value="inappropriate">
                Inappropriate Content
              </option>
            </select>

            {/* Note */}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Additional details (optional)"
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-black/10"
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
                className="flex-1 border rounded-lg py-2 text-sm
                           text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={submit}
                disabled={loading}
                className="flex-1 rounded-lg py-2 text-sm font-medium
                           bg-red-600 text-white hover:bg-red-700
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
