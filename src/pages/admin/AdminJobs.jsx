import { useEffect, useState } from "react";
import {
  getAdminJobs,
  blockJob,
  unblockJob,
  deleteJobAdmin,
} from "../../services/adminApi";

/* ================= MAIN PAGE ================= */

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("latest");

  const [owner, setOwner] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const [expandedJob, setExpandedJob] = useState(null);

  const fetchJobs = async (p = page, s = search) => {
    try {
      setLoading(true);
      const res = await getAdminJobs(p, s);
      let data = res.data.jobs || [];

      if (statusFilter === "blocked") {
        data = data.filter((j) => j.isBlocked);
      } else if (statusFilter === "active") {
        data = data.filter((j) => !j.isBlocked);
      }

      data =
        sort === "latest"
          ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setJobs(data);
      setPage(res.data.currentPage);
      setPages(res.data.totalPages);
    } catch {
      showToast("Failed to load jobs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1);
  }, [statusFilter, sort]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleBlockToggle = async (job) => {
    setLoadingId(job._id);
    try {
      if (job.isBlocked) {
        await unblockJob(job._id);
        showToast("Job unblocked");
      } else {
        await blockJob(job._id, "Blocked by admin");
        showToast("Job blocked");
      }
      fetchJobs(page);
    } catch {
      showToast("Action failed", "error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (job) => {
    setLoadingId(job._id);
    try {
      await deleteJobAdmin(job._id);
      showToast("Job deleted");
      fetchJobs(page);
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <h1 className="text-xl md:text-2xl font-semibold mb-5">Manage Jobs</h1>

        {/* SEARCH + FILTER */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search job title"
            className="border rounded-xl px-4 py-2 w-full md:max-w-sm"
          />

          <button
            onClick={() => fetchJobs(1)}
            className="bg-blue-600 text-white px-5 py-2 rounded-xl"
          >
            Search
          </button>

          <FilterDropdown
            status={statusFilter}
            sort={sort}
            setStatus={setStatusFilter}
            setSort={setSort}
          />
        </div>

        {loading ? (
          <p className="text-gray-500">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="text-gray-500">No jobs found</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white border rounded-2xl p-5">
                {/* HEADER */}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-lg">{job.title}</h3>
                    <p className="text-sm text-gray-500">
                      Posted by {job.user?.name || "User"}
                    </p>
                    <StatusBadge blocked={job.isBlocked} />
                  </div>
                  <div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-4 items-center text-sm">
                    <button
                      onClick={() => setOwner(job.user)}
                      className="px-3 py-1.5 md:px-0 md:py-0 rounded-lg md:rounded-none
               bg-blue-50 md:bg-transparent text-blue-600
               hover:bg-blue-100 md:hover:bg-transparent
               hover:underline whitespace-nowrap"
                    >
                      View Owner
                    </button>

                    <button
                      disabled={loadingId === job._id}
                      onClick={() =>
                        setConfirm({
                          title: job.isBlocked
                            ? "Unblock this job?"
                            : "Block this job?",
                          action: () => handleBlockToggle(job),
                        })
                      }
                      className={`px-3 py-1.5 md:px-0 md:py-0 rounded-lg md:rounded-none
                whitespace-nowrap disabled:opacity-50
                ${
                  job.isBlocked
                    ? "bg-green-50 md:bg-transparent text-green-600 hover:bg-green-100 md:hover:bg-transparent"
                    : "bg-yellow-50 md:bg-transparent text-yellow-600 hover:bg-yellow-100 md:hover:bg-transparent"
                }
                hover:underline`}
                    >
                      {job.isBlocked ? "Unblock" : "Block"}
                    </button>

                    <button
                      disabled={loadingId === job._id}
                      onClick={() =>
                        setConfirm({
                          title: "Delete this job permanently?",
                          action: () => handleDelete(job),
                        })
                      }
                      className="px-3 py-1.5 md:px-0 md:py-0 rounded-lg md:rounded-none
               bg-red-50 md:bg-transparent text-red-600
               hover:bg-red-100 md:hover:bg-transparent
               hover:underline whitespace-nowrap disabled:opacity-50"
                    >
                      Delete
                    </button>

                    <button
                      onClick={() =>
                        setExpandedJob(expandedJob === job._id ? null : job._id)
                      }
                      className="px-3 py-1.5 md:px-0 md:py-0 rounded-lg md:rounded-none
               bg-gray-100 md:bg-transparent text-gray-700
               hover:bg-gray-200 md:hover:bg-transparent
               hover:underline whitespace-nowrap"
                    >
                      {expandedJob === job._id ? "Hide" : "Expand"}
                    </button>
                  </div>
                </div>

                {/* EXPANDED SECTION */}
                {expandedJob === job._id && (
                  <div className="mt-4 border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        Description
                      </p>
                      <p className="leading-relaxed">
                        {job.description || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">
                        Category
                      </p>
                      <p className="font-medium">{job.category || "—"}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">
                        Wage
                      </p>
                      <p className="font-medium">
                        {job.wage && job.wage.trim()
                          ? `₹${job.wage}`
                          : "Negotiable"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">
                        Location
                      </p>
                      <p className="font-medium">
                        {job.location?.city || job.location || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">
                        Skills
                      </p>
                      <p className="font-medium">
                        {job.skills?.length ? job.skills.join(", ") : "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">
                        Posted On
                      </p>
                      <p className="font-medium">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {job.isBlocked && (
                      <div className="sm:col-span-2 mt-2 bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-red-600 uppercase mb-1">
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

        {pages > 1 && (
          <Pagination page={page} pages={pages} onChange={fetchJobs} />
        )}
      </div>

      {owner && <OwnerModal owner={owner} onClose={() => setOwner(null)} />}

      {confirm && (
        <ConfirmModal
          title={confirm.title}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            confirm.action();
            setConfirm(null);
          }}
        />
      )}

      {toast && <Toast {...toast} />}
    </>
  );
}

/* ================= HELPERS (UNCHANGED) ================= */

function StatusBadge({ blocked }) {
  return (
    <span
      className={`inline-block mt-1 text-xs font-medium px-3 py-1 rounded-full ${
        blocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
      }`}
    >
      {blocked ? "Blocked" : "Active"}
    </span>
  );
}

function Pagination({ page, pages, onChange }) {
  return (
    <div className="flex justify-center gap-2 mt-8">
      {[...Array(pages)].map((_, i) => {
        const p = i + 1;
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`px-4 py-2 rounded-lg border text-sm ${
              page === p ? "bg-blue-600 text-white" : "hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        );
      })}
    </div>
  );
}

/* ================= MODALS ================= */

function ConfirmModal({ title, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full">
        <h3 className="font-semibold mb-4">{title}</h3>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function OwnerModal({ owner, onClose }) {
  if (!owner) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-6">
        {/* HEADER */}
        <div className="flex items-center gap-4">
          <img
            src={
              owner.profileImage ||
              `https://ui-avatars.com/api/?name=${owner.name}`
            }
            className="h-16 w-16 rounded-full border object-cover"
          />

          <div className="flex-1">
            <h3 className="text-lg font-semibold">{owner.name}</h3>
            <p className="text-sm text-gray-500">{owner.email}</p>

            <div className="flex gap-2 mt-2 flex-wrap">
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  owner.isBlocked
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {owner.isBlocked ? "Blocked" : "Active"}
              </span>

              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  owner.isVerified
                    ? "bg-blue-100 text-blue-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {owner.isVerified ? "Verified" : "Not Verified"}
              </span>

              <span className="text-xs px-3 py-1 rounded-full font-medium bg-gray-100 text-gray-700 capitalize">
                {owner.provider}
              </span>
            </div>
          </div>
        </div>

        {/* BASIC INFO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500 uppercase">Phone</p>
            <p className="font-medium">{owner.phone || "—"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase">Role</p>
            <p className="font-medium capitalize">{owner.role}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase">Profession</p>
            <p className="font-medium">{owner.profession || "—"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase">Experience</p>
            <p className="font-medium">{owner.experience || "—"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase">Rate</p>
            <p className="font-medium">{owner.rate || "—"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase">Location</p>
            <p className="font-medium">{owner.location || "—"}</p>
          </div>
        </div>

        {/* BIO */}
        {owner.bio && (
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Bio</p>
            <p className="text-sm leading-relaxed text-gray-700">{owner.bio}</p>
          </div>
        )}

        {/* SKILLS */}
        <div>
          <p className="text-xs text-gray-500 uppercase mb-2">Skills</p>

          {owner.skills?.length ? (
            <div className="flex flex-wrap gap-2">
              {owner.skills.map((skill, i) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">—</p>
          )}
        </div>

        {/* META */}
        <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500 ">
              {owner?.createdAt ? "Joined On" : `Joined date not found! Last Updated :`}
            </p>

            <p className="font-medium">
              {owner?.createdAt
                ? new Date(owner.createdAt).toLocaleDateString("en-IN")
                : owner?.updatedAt
                ? new Date(owner.updatedAt).toLocaleDateString("en-IN")
                : "—"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase">User ID</p>
            <p className="font-medium break-all">{owner._id}</p>
          </div>
        </div>

        {/* ACTION */}
        <button
          onClick={onClose}
          className="w-full bg-gray-100 hover:bg-gray-200 py-2 rounded-lg text-sm font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function FilterDropdown({ status, sort, setStatus, setSort }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="border rounded-xl px-4 py-2 bg-white hover:bg-gray-50 text-sm font-medium"
      >
        Filters ▾
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 mt-2 w-64 bg-white border rounded-xl shadow-lg z-50 p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">STATUS</p>
              {[
                ["all", "All jobs"],
                ["active", "Active"],
                ["blocked", "Blocked"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setStatus(key);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    status === key
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">
                SORT BY
              </p>
              {[
                ["latest", "New → Old"],
                ["oldest", "Old → New"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSort(key);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    sort === key
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Toast({ msg, type }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-white text-sm ${
        type === "error" ? "bg-red-600" : "bg-green-600"
      }`}
    >
      {msg}
    </div>
  );
}
