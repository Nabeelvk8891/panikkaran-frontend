import { useEffect, useMemo, useState, useCallback } from "react";
import {
  getSentAppointments,
  getReceivedAppointments,
  updateAppointmentStatus,
  cancelAppointment,
} from "../services/appointmentApi";
import { FaCheck, FaTimes, FaPhoneAlt, FaClock } from "react-icons/fa";
import { FaComments } from "react-icons/fa";
import ChatBox from "../components/chat/ChatBox";
import { useSearchParams } from "react-router-dom";
import { useChat } from "../context/ChatContext";

/* ================= HELPERS ================= */

/* ================= REASON PRESETS ================= */

const CANCEL_REASONS = [
  "Accidental appointment",
  "Wrong job selected",
  "Personal emergency",
  "Found another worker",
];

const REJECT_REASONS = [
  "Cannot accept requested wage",
  "Not available at this time",
  "Workload is full",
  "Job requirements not clear",
];

const normalizeDate = (date) => new Date(date).toISOString().split("T")[0];

const getProfileImage = (user) =>
  user?.profileImage ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}`;

/* ✅ Completion rule */
const canCompleteAppointment = (a) => {
  const now = new Date();

  if (a.time) {
    let h, m;
    if (a.time.includes("AM") || a.time.includes("PM")) {
      const [t, meridian] = a.time.split(" ");
      let [hh, mm] = t.split(":").map(Number);
      if (meridian === "PM" && hh !== 12) hh += 12;
      if (meridian === "AM" && hh === 12) hh = 0;
      h = hh;
      m = mm;
    } else {
      [h, m] = a.time.split(":").map(Number);
    }

    const dt = new Date(a.date);
    dt.setHours(h, m, 0, 0);
    return (dt - now) / (1000 * 60 * 60) <= 1;
  }

  const acceptedAt = new Date(a.updatedAt);
  return (now - acceptedAt) / (1000 * 60 * 60) >= 5;
};

const isProfessionalUser = (user) =>
  user?.profession &&
  user?.rate &&
  Array.isArray(user?.skills) &&
  user.skills.length > 0;

function Tooltip({ text, children }) {
  return (
    <div className="relative inline-flex group">
      {children}

      <div
        className="
          absolute bottom-full left-1/2 z-50 mb-1
          -translate-x-1/2 scale-95 opacity-0
          group-hover:scale-100 group-hover:opacity-100
          transition-all duration-150
          pointer-events-none
        "
      >
        <div className="rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white shadow-lg whitespace-nowrap">
          {text}
        </div>
      </div>
    </div>
  );
}

/* ================= REASON MODAL ================= */

function ReasonModal({ title, reasons, onClose, onConfirm }) {
  const [selected, setSelected] = useState("");

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-5 w-80 space-y-4">
        <h3 className="font-semibold text-sm">{title}</h3>

        <div className="space-y-2">
          {reasons.map((r) => (
            <label key={r} className="flex gap-2 text-sm">
              <input
                type="radio"
                name="reason"
                value={r}
                onChange={() => setSelected(r)}
              />
              {r}
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="text-sm text-gray-500">
            Cancel
          </button>

          <button
            disabled={!selected}
            onClick={() => onConfirm(selected)}
            className="bg-blue-700 text-white px-3 py-1 rounded text-sm disabled:opacity-40"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= PAGE ================= */

export default function Appointments() {
  const auth = JSON.parse(localStorage.getItem("auth"));
  const isProfessional = isProfessionalUser(auth?.user);

  const [tab, setTab] = useState(isProfessional ? "received" : "sent");
  const [view, setView] = useState("list");
  const [selectedDate, setSelectedDate] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const chatFromNotification = searchParams.get("chat");
  const { chatUnreadMap } = useChat();

  const activeAppointment = appointments.find((a) => a._id === activeChatId);

  const ITEMS_PER_PAGE = 6;
  const [page, setPage] = useState(1);

// Get chatId for active appointment  

const getAppointmentChatId = (appointment) => {
  if (!appointment?.user?._id || !appointment?.worker) return null;

  const workerId =
    typeof appointment.worker === "string"
      ? appointment.worker
      : appointment.worker._id;

  return `${appointment.user._id}_${workerId}`;
};



// Fetch appointments

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res =
        tab === "sent"
          ? await getSentAppointments()
          : await getReceivedAppointments();
      setAppointments(res.data || []);
      setPage(1);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    if (activeChatId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeChatId]);

  const filtered = useMemo(() => {
    return selectedDate
      ? appointments.filter((a) => normalizeDate(a.date) === selectedDate)
      : appointments;
  }, [appointments, selectedDate]);

// Handle chat from notification

  useEffect(() => {
    if (!chatFromNotification) return;
    if (appointments.length === 0) return;

    const found = appointments.find(
      (a) => String(a._id) === String(chatFromNotification),
    );

    if (found) {
      setActiveChatId(found._id);

      setSearchParams({});
    }
  }, [chatFromNotification, appointments, setSearchParams]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const visibleAppointments = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  useEffect(() => {
  if (appointments.length) {
    console.log("APPOINTMENT SAMPLE:", appointments[0]);
  }
}, [appointments]);



  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 space-y-6">
        <h1 className="text-xl font-semibold">Appointments</h1>

        {/* Tabs + View */}
        <div className="flex justify-between flex-wrap gap-3">
          <div className="flex gap-2">
            <Tab active={tab === "sent"} onClick={() => setTab("sent")}>
              Sent
            </Tab>
            <Tab
              active={tab === "received"}
              disabled={!isProfessional}
              onClick={() => isProfessional && setTab("received")}
            >
              Received
            </Tab>
          </div>

          <div className="flex gap-2">
            <ViewBtn active={view === "list"} onClick={() => setView("list")}>
              List
            </ViewBtn>
            <ViewBtn
              active={view === "calendar"}
              onClick={() => setView("calendar")}
            >
              Calendar
            </ViewBtn>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : view === "calendar" ? (
          <AppointmentCalendar
            appointments={appointments}
            selectedDate={selectedDate}
            onSelectDate={(d) => {
              setSelectedDate(d);
              setView("list");
            }}
          />
        ) : visibleAppointments.length === 0 ? (
          <div className="bg-white border rounded-xl p-6 text-sm text-gray-500">
            No appointments found
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {visibleAppointments.map((a) => {
  const chatId = getAppointmentChatId(a);

  return (
    <AppointmentCard
      key={a._id}
      data={a}
      tab={tab}
      onStatusChange={updateAppointmentStatus}
      onCancel={cancelAppointment}
      refresh={fetchAppointments}
      activeChatId={activeChatId}
      setActiveChatId={setActiveChatId}
      unreadCount={chatUnreadMap?.[chatId] || 0}
    />
  );
})}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`h-8 w-8 rounded-full text-sm font-medium
                      ${
                        page === i + 1
                          ? "bg-blue-700 text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ---------- CHAT DRAWER ---------- */}
      <div
        className={`
    fixed inset-0 z-50 bg-black/30 flex justify-end
    transition-opacity duration-300
    ${activeAppointment ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
  `}
        onClick={() => setActiveChatId(null)}
      >
        <div
          className={`
      w-full sm:w-[420px] lg:w-[480px] h-full bg-white shadow-xl flex flex-col
      transform transition-transform duration-300 ease-out
      ${activeAppointment ? "translate-x-0" : "translate-x-full"}
    `}
          onClick={(e) => e.stopPropagation()}
        >
         {activeAppointment && (
  <ChatBox
    appointmentId={activeAppointment._id}
    chatId={getAppointmentChatId(activeAppointment)}
    skipPermission
    isOpen={true}       
    onClose={() => setActiveChatId(null)}
  />
)}

        </div>
      </div>
    </div>
  );
}

/* ================= CARD ================= */

function AppointmentCard({
  data,
  tab,
  onStatusChange,
  onCancel,
  refresh,
  setActiveChatId,
  activeChatId,
  unreadCount,
}) {
  const hasUnread = unreadCount > 0;

  const person = tab === "sent" ? data.worker : data.user;

  const [showRejectReason, setShowRejectReason] = useState(false);
  const [showCancelReason, setShowCancelReason] = useState(false);

  const originalWageRaw = data.job?.wage;
  const requestedWageRaw = data.requestedWage;

  const originalWage =
    typeof originalWageRaw === "number"
      ? originalWageRaw
      : Number(originalWageRaw) || null;

  const requestedWage =
    typeof requestedWageRaw === "number"
      ? requestedWageRaw
      : Number(requestedWageRaw) || null;

  const hasNegotiation =
    requestedWage !== null &&
    originalWage !== null &&
    requestedWage !== originalWage;

  const wageDiff = hasNegotiation ? requestedWage - originalWage : 0;

  /* -------- Actions -------- */
  const handleStatus = async (status, reason) => {
    await onStatusChange(data._id, status, reason);
    refresh();
  };

  const handleCancel = async (reason) => {
    await onCancel(data._id, reason);
    refresh();
  };

  return (
    <div
      className={`bg-white border rounded-xl p-5 space-y-3
        ${activeChatId === data._id ? "ring-2 ring-blue-500" : ""}`}
    >
      {/* ---------- HEADER ---------- */}
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1">
          <h3 className="font-semibold text-sm text-gray-900">
            {data.workTitle}
          </h3>

          <p
            className="text-xs text-gray-500 flex items-center gap-1"
            title={data.time ? "Scheduled time" : "Time will be decided later"}
          >
            <FaClock className="text-[11px]" />
            {new Date(data.date).toDateString()}
            {data.time ? ` • ${data.time}` : " • Time not decided"}
          </p>

          {/* ---------- WAGE INFO ---------- */}
          <div className="text-xs mt-1 space-y-0.5">
            {!hasNegotiation && originalWage !== null && (
              <p className="text-gray-600">
                <span className="font-medium">Wage:</span> ₹{originalWage}
                <span className="ml-2 text-gray-400 italic">
                  (Requested for given wage)
                </span>
              </p>
            )}

            {hasNegotiation && wageDiff > 0 && (
              <p className="text-gray-700">
                <span className="font-medium">Wage:</span>{" "}
                <span className="text-gray-400 line-through">
                  ₹{originalWage}
                </span>
                <span className="mx-1">→</span>
                <span className="text-green-700 font-semibold">
                  ₹{requestedWage}
                </span>
                <span className="ml-2 text-green-600 font-medium">
                  (+₹{wageDiff})
                </span>
              </p>
            )}

            {hasNegotiation && wageDiff < 0 && (
              <p className="text-gray-700">
                <span className="font-medium">Wage:</span>{" "}
                <span className="text-gray-400 line-through">
                  ₹{originalWage}
                </span>
                <span className="mx-1">→</span>
                <span className="text-yellow-700 font-semibold">
                  ₹{requestedWage}
                </span>
                <span className="ml-2 text-yellow-600 font-medium">
                  (−₹{Math.abs(wageDiff)})
                </span>
              </p>
            )}
          </div>
        </div>

        {/* ---------- STATUS ---------- */}
        <Status status={data.status} />
      </div>

      {data.status === "rejected" && data.rejectReason && (
        <div className="bg-red-50 text-red-700 text-xs p-2 rounded-md">
          <strong>Rejected reason:</strong> {data.rejectReason}
        </div>
      )}

      {data.status === "cancelled" && data.cancelReason && (
        <div className="bg-gray-100 text-gray-700 text-xs p-2 rounded-md">
          <strong>Cancelled reason:</strong> {data.cancelReason}
        </div>
      )}

      {/* ---------- PERSON ---------- */}
      <div className="flex items-center gap-3">
        <img
          src={getProfileImage(person)}
          className="h-9 w-9 rounded-full border"
          alt={person?.name}
        />
        <span className="text-sm font-medium text-gray-800">
          {person?.name}
        </span>
      </div>

      {/* ---------- CONTACT ---------- */}
      {data.status === "accepted" && person?.phone && (
        <div className="flex gap-3">
          <ContactBtn href={`tel:${person.phone}`}>
            <FaPhoneAlt /> Call
          </ContactBtn>
        </div>
      )}

      {/* ---------- ACTIONS ---------- */}
      <div className="flex flex-wrap justify-end gap-2 pt-1">
        {/* ✅ CHAT */}
        {data.status === "accepted" && (
          <Tooltip text="Open chat">
            <ActionBtn onClick={() => setActiveChatId(data._id)}>
              <div className="relative flex items-center gap-1">
                <FaComments />
                <span>Chat</span>

                {hasUnread && (
                  <span
                    className="
              absolute -top-2 -right-2
              bg-red-600 text-white
              text-[10px] font-bold
              h-[16px] min-w-[16px]
              px-1
              rounded-full
              flex items-center justify-center
              leading-none
            "
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
            </ActionBtn>
          </Tooltip>
        )}

        {tab === "received" && data.status === "pending" && (
          <>
            <Tooltip text="Accept this appointment request">
              <ActionBtn success onClick={() => handleStatus("accepted")}>
                <FaCheck /> Accept
              </ActionBtn>
            </Tooltip>

            <Tooltip text="Reject this appointment request">
              <ActionBtn danger onClick={() => setShowRejectReason(true)}>
                <FaTimes /> Reject
              </ActionBtn>
            </Tooltip>
          </>
        )}

        {tab === "received" && data.status === "accepted" && (
          <Tooltip
            text={
              canCompleteAppointment(data)
                ? "Mark this appointment as completed"
                : data.time
                  ? "You can complete only within 1 hour of the scheduled time"
                  : "You can complete only after 5 hours from acceptance"
            }
          >
            <ActionBtn
              success
              disabled={!canCompleteAppointment(data)}
              onClick={() => handleStatus("completed")}
            >
              <FaCheck /> Completed
            </ActionBtn>
          </Tooltip>
        )}

        {tab === "sent" && ["pending", "accepted"].includes(data.status) && (
          <Tooltip text="Cancel this appointment">
            <ActionBtn danger onClick={() => setShowCancelReason(true)}>
              <FaTimes /> Cancel
            </ActionBtn>
          </Tooltip>
        )}
      </div>

      {showRejectReason && (
        <ReasonModal
          title="Reason for rejection"
          reasons={REJECT_REASONS}
          onClose={() => setShowRejectReason(false)}
          onConfirm={(reason) => {
            setShowRejectReason(false);
            handleStatus("rejected", reason);
          }}
        />
      )}

      {showCancelReason && (
        <ReasonModal
          title="Reason for cancellation"
          reasons={CANCEL_REASONS}
          onClose={() => setShowCancelReason(false)}
          onConfirm={(reason) => {
            setShowCancelReason(false);
            handleCancel(reason);
          }}
        />
      )}
    </div>
  );
}

/* ================= UI ================= */

function Tab({ active, children, onClick, disabled }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium ${
        active
          ? "bg-blue-700 text-white"
          : disabled
            ? "bg-gray-100 text-gray-400"
            : "bg-gray-100 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

function ViewBtn({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm ${
        active ? "bg-blue-700 text-white" : "bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

function ActionBtn({ children, onClick, danger, success, disabled, title }) {
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1 h-8 px-3 text-xs rounded-lg
        disabled:opacity-40 disabled:cursor-not-allowed transition
        ${
          danger
            ? "bg-red-50 text-red-600"
            : success
              ? "bg-green-50 text-green-700"
              : "bg-gray-100 text-gray-700"
        }`}
    >
      {children}
    </button>
  );
}

function ContactBtn({ children, href, external }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="px-3 h-8 text-xs rounded-full bg-green-50 text-green-700 inline-flex items-center gap-1"
    >
      {children}
    </a>
  );
}

function Status({ status }) {
  const map = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`px-3 py-1 text-[10px] font-semibold rounded-full
      whitespace-nowrap ${map[status]}`}
    >
      {status.toUpperCase()}
    </span>
  );
}

/* ================= CALENDAR ================= */

function AppointmentCalendar({ appointments, selectedDate, onSelectDate }) {
  const [month, setMonth] = useState(new Date());
  const todayStr = normalizeDate(new Date());

  const year = month.getFullYear();
  const m = month.getMonth();
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const firstDay = new Date(year, m, 1).getDay();

  return (
    <div className="bg-white border rounded-xl p-5">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setMonth(new Date(year, m - 1))}>←</button>
        <p className="font-medium">
          {month.toLocaleString("default", { month: "long", year: "numeric" })}
        </p>
        <button onClick={() => setMonth(new Date(year, m + 1))}>→</button>
      </div>

      <div className="grid grid-cols-7 text-xs text-gray-500 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={i} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(m + 1).padStart(2, "0")}-${String(
            day,
          ).padStart(2, "0")}`;

          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`border rounded-lg p-2 text-xs cursor-pointer
                ${
                  isSelected
                    ? "border-black bg-gray-100"
                    : isToday
                      ? "border-blue-600 bg-blue-50"
                      : "hover:bg-gray-50"
                }`}
            >
              <div className="font-medium">{day}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
