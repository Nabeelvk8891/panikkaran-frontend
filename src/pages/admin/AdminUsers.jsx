import { useEffect, useState } from "react";
import {
  getAdminUsers,
  blockUser,
  unblockUser,
  deleteUser,
} from "../../services/adminApi";
import UserDetailsModal from "./UserDetailsModal";

/* ================= MAIN PAGE ================= */

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | blocked | active
  const [sort, setSort] = useState("latest"); // latest | oldest

  const [selectedUser, setSelectedUser] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  /* ✅ ADDED */
  const [expandedUserId, setExpandedUserId] = useState(null);

  /* ================= FETCH ================= */

  const fetchUsers = async (p = page) => {
    try {
      const res = await getAdminUsers(p, search);
      let data = res.data.users;

      /* FILTER */
      if (statusFilter === "blocked") {
        data = data.filter((u) => u.isBlocked);
      } else if (statusFilter === "active") {
        data = data.filter((u) => !u.isBlocked);
      }

      /* SORT */
      data =
        sort === "latest"
          ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setUsers(data);
      setPage(res.data.currentPage);
      setPages(res.data.totalPages);
    } catch {
      showToast("Failed to load users", "error");
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [statusFilter, sort]);

  /* ================= TOAST ================= */

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  /* ================= ACTIONS ================= */

  const handleBlockToggle = async (u) => {
    setLoadingId(u._id);
    try {
      if (u.isBlocked) {
        await unblockUser(u._id);
        showToast("User unblocked");
      } else {
        await blockUser(u._id);
        showToast("User blocked");
      }
      fetchUsers(page);
    } catch {
      showToast("Action failed", "error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (u) => {
    setLoadingId(u._id);
    try {
      await deleteUser(u._id);
      showToast("User deleted");
      fetchUsers(page);
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setLoadingId(null);
    }
  };

  /* ✅ ADDED */
  const toggleExpand = (id) => {
    setExpandedUserId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <h1 className="text-xl md:text-2xl font-semibold mb-5">
        Manage Users
      </h1>

      {/* ================= SEARCH + FILTER BAR ================= */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users"
          className="border rounded-xl px-4 py-2 w-full md:max-w-sm"
        />

        <button
          onClick={() => fetchUsers(1)}
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

      {/* ACTIVE FILTER LABEL */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700">
          {statusFilter === "all"
            ? "All users "
            : statusFilter === "active"
            ? "Active"
            : "Blocked"}
          • {sort === "latest" ? "Newest to old ↓" : "Oldest to new ↑"}
        </span>
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block bg-white border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-center">Joined</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <>
                <tr key={u._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
  <div className="flex items-center gap-3">
    <img
      src={
        u.profileImage ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          u.name
        )}&background=0D8ABC&color=fff`
      }
      alt={u.name}
      className="h-9 w-9 rounded-full object-cover border"
    />
    <span className="font-medium">{u.name}</span>
  </div>
</td>

                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 text-center">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-center">
                    <StatusBadge blocked={u.isBlocked} />
                  </td>
                  <td className="p-3 flex justify-center gap-4">
                    <ActionBtn
                      label="View posts"
                      color="blue"
                      onClick={() => setSelectedUser(u)}
                    />

                    {/* ✅ ADDED */}
                    <ActionBtn
                      label={expandedUserId === u._id ? "Hide" : "Expand"}
                      color="blue"
                      onClick={() => toggleExpand(u._id)}
                    />

                    <ActionBtn
                      label={u.isBlocked ? "Unblock" : "Block"}
                      color={u.isBlocked ? "green" : "yellow"}
                      loading={loadingId === u._id}
                      onClick={() =>
                        setConfirm({
                          title: u.isBlocked
                            ? "Unblock user?"
                            : "Block user?",
                          action: () => handleBlockToggle(u),
                        })
                      }
                    />

                    <ActionBtn
                      label="Delete"
                      color="red"
                      loading={loadingId === u._id}
                      onClick={() =>
                        setConfirm({
                          title: "Delete user permanently?",
                          action: () => handleDelete(u),
                        })
                      }
                    />
                  </td>
                </tr>

                {/* ✅ ADDED */}
                {expandedUserId === u._id && (
                  <tr className="border-t bg-gray-50">
                    <td colSpan={5} className="p-0">
                      <ExpandedUserDetails user={u} />
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="md:hidden space-y-3">
        {users.map((u) => (
          <div key={u._id} className="bg-white border rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
  <div className="flex items-start gap-3">
    <img
      src={
        u.profileImage ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          u.name
        )}&background=0D8ABC&color=fff`
      }
      alt={u.name}
      className="h-10 w-10 rounded-full object-cover border"
    />

    <div>
      <p className="font-medium">{u.name}</p>
      <p className="text-xs text-gray-500">{u.email}</p>
      <p className="text-xs text-gray-400 mt-1">
        Joined: {new Date(u.createdAt).toLocaleDateString()}
      </p>
    </div>
  </div>

  <StatusBadge blocked={u.isBlocked} />
</div>


            {/* ✅ UPDATED TO PILL BUTTONS */}
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700"
                onClick={() => setSelectedUser(u)}
              >
                View Posts
              </button>

              <button
                className={`px-3 py-1 rounded-full text-xs ${
                  u.isBlocked
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
                onClick={() =>
                  setConfirm({
                    title: u.isBlocked
                      ? "Unblock user?"
                      : "Block user?",
                    action: () => handleBlockToggle(u),
                  })
                }
              >
                {u.isBlocked ? "Unblock" : "Block"}
              </button>

              <button
                className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-700"
                onClick={() =>
                  setConfirm({
                    title: "Delete user permanently?",
                    action: () => handleDelete(u),
                  })
                }
              >
                Delete
              </button>

              {/* ✅ ADDED */}
              <button
                className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700"
                onClick={() => toggleExpand(u._id)}
              >
                {expandedUserId === u._id ? "Hide" : "Details"}
              </button>
            </div>

            {expandedUserId === u._id && (
              <div className="mt-4 border-t pt-4">
                <ExpandedUserDetails user={u} />
              </div>
            )}
          </div>
        ))}
      </div>

      <Pagination page={page} pages={pages} onChange={fetchUsers} />

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

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
    </div>
  );
}

/* ================= HELPERS ================= */

function StatusBadge({ blocked }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        blocked
          ? "bg-red-100 text-red-700"
          : "bg-green-100 text-green-700"
      }`}
    >
      {blocked ? "Blocked" : "Active"}
    </span>
  );
}

function ActionBtn({ label, color, onClick, loading }) {
  const map = {
    blue: "text-blue-600",
    red: "text-red-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
  };

  return (
    <button
      disabled={loading}
      onClick={onClick}
      className={`${map[color]} hover:underline disabled:opacity-50`}
    >
      {loading ? "..." : label}
    </button>
  );
}

function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className="flex gap-2 mt-6 flex-wrap">
      {[...Array(pages)].map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          className={`px-3 py-1 rounded border text-sm ${
            page === i + 1
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-100"
          }`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}

/* ================= EXPANDED DETAILS ================= */

function ExpandedUserDetails({ user }) {
  return (
    <div className="bg-gray-50">

      {/* INNER WRAPPER — THIS FIXES ALIGNMENT */}
      <div className="px-6 py-5 text-sm text-gray-700 space-y-6">

        {/* BASIC INFO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <Info label="Name" value={user.name} />
          <Info label="Email" value={user.email} breakAll />

          <Info
            label="Phone"
            value={user.phone && user.phone.trim() ? user.phone : "—"}
          />
          <Info label="Role" value={user.role} capitalize />

          <Info label="Provider" value={user.provider} capitalize />
          <Info label="Verified" value={user.isVerified ? "Yes" : "No"} />
        </div>

        {/* PROFILE INFO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <Info
            label="Profession"
            value={
              user.profession && user.profession.trim()
                ? user.profession
                : "—"
            }
          />
          <Info
            label="Experience"
            value={
              user.experience && user.experience.trim()
                ? user.experience
                : "—"
            }
          />

          <Info
            label="Rate"
            value={user.rate && user.rate.trim() ? user.rate : "—"}
          />
          <Info
            label="Location"
            value={
              user.location && user.location.trim()
                ? user.location
                : "—"
            }
          />
        </div>

        {/* BIO */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
            Bio
          </p>
          <p className="leading-relaxed max-w-4xl">
            {user.bio && user.bio.trim() ? user.bio : "—"}
          </p>
        </div>

        {/* SKILLS */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
            Skills
          </p>
          <p className="font-medium">
            {user.skills?.filter(Boolean).length
              ? user.skills.filter(Boolean).join(", ")
              : "—"}
          </p>
        </div>

        {/* META */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t">
          <Info
            label="Joined On"
            value={
              user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "—"
            }
          />

          <Info
            label="User ID"
            value={user._id}
            breakAll
          />
        </div>

      </div>
    </div>
  );
}

function Info({ label, value, capitalize, breakAll }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase">
        {label}
      </p>
      <p
        className={`font-medium text-gray-800 ${
          capitalize ? "capitalize" : ""
        } ${breakAll ? "break-all" : ""}`}
      >
        {value || "—"}
      </p>
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
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border"
          >
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

function FilterDropdown({ status, sort, setStatus, setSort }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="border rounded-xl px-4 py-2 bg-white text-sm font-medium"
      >
        Filters ▾
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-64 bg-white border rounded-xl shadow-lg z-50 p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">
                STATUS
              </p>

              {[
                ["all", "All users"],
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
