import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaMapMarkerAlt } from "react-icons/fa";
import Button from "../components/ui/Button";
import { getMyJobs, deleteJob } from "../services/jobApi";

export default function MyJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const fetchMyJobs = async () => {
    const res = await getMyJobs().then((res) => {
      setJobs(res.data.jobs || res.data || []);
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const handleDelete = async () => {
    await deleteJob(deleteId);
    setDeleteId(null);
    fetchMyJobs();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
        <h2 className="text-xl font-bold m-2">My Jobs</h2>

      <div className="flex justify-between items-center mb-6">
        <Button onClick={() => navigate("/post-job")}>
          + Post Job
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : jobs.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          <p className="mb-3">You haven’t posted any jobs yet.</p>
          <Button onClick={() => navigate("/post-job")}>
            Post Your First Job
          </Button>
        </div>
      ) : (
        <div className="bg-white border rounded-xl divide-y">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="flex items-center justify-between px-5 py-4"
            >
              {/* Job Info */}
              <div>
                <h3 className="font-medium">{job.title}</h3>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <FaMapMarkerAlt /> {job.location}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(`/edit-job/${job._id}`)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <FaEdit /> Edit
                </button>

                <button
                  onClick={() => setDeleteId(job._id)}
                  className="flex items-center gap-1 text-sm text-red-600 hover:underline"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-semibold text-lg text-center">
              Delete Job?
            </h3>
            <p className="text-sm text-gray-600 text-center">
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </Button>
              <Button
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
