
import { useEffect, useState } from "react";
import { getJobsByUser } from "../../services/adminApi";

export default function UserDetailsModal({ user, onClose }) {
  const [jobs, setJobs] = useState([]);
  const [expandedJob, setExpandedJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;

    const fetchJobs = async () => {
      try {
        const res = await getJobsByUser(user._id);
        setJobs(res.data);
      } catch (err) {
        console.error("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto space-y-6">

        {/* HEADER */}
        

        {/* JOBS */}
        <div>
          <h4 className="font-semibold mb-3">
            Jobs Posted ({jobs.length})
          </h4>

          {loading ? (
            <p className="text-sm text-gray-500">Loading jobs...</p>
          ) : jobs.length === 0 ? (
            <p className="text-sm text-gray-500">No jobs posted</p>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="border rounded-xl p-4"
                >
                  {/* JOB HEADER */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(job.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setExpandedJob(
                          expandedJob === job._id ? null : job._id
                        )
                      }
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {expandedJob === job._id ? "Hide" : "Expand"}
                    </button>
                  </div>

                  {/* EXPANDED JOB INFO */}
                  {expandedJob === job._id && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">

                      <div className="sm:col-span-2">
                        <p className="text-xs uppercase text-gray-500">
                          Description
                        </p>
                        <p>{job.description || "—"}</p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-500">
                          Category
                        </p>
                        <p className="font-medium">
                          {job.category || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-500">
                          Wage
                        </p>
                        <p className="font-medium">
                          {job.wage?.trim()
                            ? `₹${job.wage}`
                            : "Negotiable"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-500">
                          Location
                        </p>
                        <p className="font-medium">
                          {job.location || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-500">
                          Skills
                        </p>
                        <p className="font-medium">
                          {job.skills?.length
                            ? job.skills.join(", ")
                            : "—"}
                        </p>
                      </div>

                      {job.isBlocked && (
                        <div className="sm:col-span-2 bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-xs uppercase text-red-600">
                            Block Reason
                          </p>
                          <p className="text-sm text-red-700">
                            {job.blockedReason || "—"}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
        </div>
        <div className="flex justify-between items-center">

          <button
            onClick={onClose}
            className="text-sm px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
      
    </div>
  );
}

