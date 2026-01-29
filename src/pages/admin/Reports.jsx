import { useEffect, useState } from "react";
import {
  getAllReports,
  updateReportStatus,
} from "../../services/reportApi";

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await getAllReports();
      setReports(res.data || []);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const updateStatus = async (status) => {
    if (!selected || selected.status === "resolved") return;

    await updateReportStatus(selected._id, { status });
    setSelected(null);
    fetchReports();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <h1 className="text-xl font-semibold mb-4">
        User Reports
      </h1>

      {loading ? (
        <p className="text-gray-500 text-sm">
          Loading reports...
        </p>
      ) : reports.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No reports found
        </p>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => {
            const isResolved = r.status === "resolved";

            return (
              <div
                key={r._id}
                className="bg-white border rounded-xl p-4 space-y-3"
              >
                {/* TOP */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">
                      Job:
                      <span className="text-gray-600 ml-1">
                        {r.job?.title || "N/A"}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(
                        r.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <StatusBadge status={r.status} />
                </div>

                {/* USERS */}
                <div className="grid gap-3 text-xs sm:grid-cols-2">
                  <div>
                    <p className="font-medium">
                      Reporter
                    </p>
                    <p>{r.reporter?.name}</p>
                    <p className="text-gray-500">
                      {r.reporter?.email}
                    </p>
                  </div>

                  <div>
                    <p className="font-medium">
                      Reported User
                    </p>
                    <p>{r.reportedUser?.name}</p>
                    <p className="text-gray-500">
                      {r.reportedUser?.email}
                    </p>
                  </div>
                </div>

                {/* REASON */}
                <div>
                  <p className="font-medium text-xs">
                    Reason
                  </p>
                  <p className="text-xs text-gray-700">
                    {r.reason.replaceAll(
                      "_",
                      " "
                    )}
                  </p>
                </div>

                {r.description && (
                  <div>
                    <p className="font-medium text-xs">
                      Description
                    </p>
                    <p className="text-xs text-gray-600">
                      {r.description}
                    </p>
                  </div>
                )}

                {/* ACTION */}
                <button
                  disabled={isResolved}
                  onClick={() => setSelected(r)}
                  className={`w-full sm:w-auto px-4 py-2 rounded-lg text-xs border
                    ${
                      isResolved
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-50"
                    }`}
                >
                  {isResolved
                    ? "Resolved"
                    : "Manage"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <ManageModal
          report={selected}
          onClose={() => setSelected(null)}
          onUnderReview={() =>
            updateStatus("under_review")
          }
          onResolved={() =>
            updateStatus("resolved")
          }
        />
      )}
    </div>
  );
}
function StatusBadge({ status }) {
  const map = {
    open: "bg-red-100 text-red-700",
    under_review:
      "bg-yellow-100 text-yellow-700",
    resolved:
      "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-[10px] font-medium ${
        map[status]
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function ManageModal({
  report,
  onClose,
  onUnderReview,
  onResolved,
}) {
  const locked = report.status === "resolved";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl p-5 w-full max-w-sm space-y-4">
        <h3 className="text-base font-semibold">
          Manage Report
        </h3>

        <p className="text-xs text-gray-600">
          {locked
            ? "This report is already resolved."
            : "Choose an action for this report."}
        </p>

        <div className="flex flex-col gap-2">
          <button
            disabled={locked}
            onClick={onUnderReview}
            className="bg-yellow-500 text-white rounded-lg py-2 text-xs disabled:opacity-50"
          >
            Under Review
          </button>

          <button
            disabled={locked}
            onClick={onResolved}
            className="bg-green-600 text-white rounded-lg py-2 text-xs disabled:opacity-50"
          >
            Resolve
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full border rounded-lg py-2 text-xs"
        >
          Close
        </button>
      </div>
    </div>
  );
}
