import { useState, useEffect } from "react";
import {
  createAppointment,
  getWorkerAcceptedSlots,
} from "../services/appointmentApi";

/* ================= TOOLTIP ================= */
function Tooltip({ text, children }) {
  return (
    <div className="relative inline-flex group">
      {children}
      <div className="absolute z-50 bottom-full left-1/2 mb-1 -translate-x-1/2
        opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100
        transition pointer-events-none">
        <div className="bg-gray-900 text-white text-[11px] px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
          {text}
        </div>
      </div>
    </div>
  );
}


export default function AppointmentModal({ job, onClose }) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  

  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [note, setNote] = useState("");
  const [wage, setWage] = useState(job.wage);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  /* 🔒 BLOCKED SLOTS */
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [mySlots, setMySlots] = useState([]);


  /* ================= TIME SLOTS ================= */
  const slots = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 7;
    const ampm = hour >= 12 ? "PM" : "AM";
    const h = hour > 12 ? hour - 12 : hour;
    return `${String(h).padStart(2, "0")}:00 ${ampm}`;
  });

  const isDuplicateSlot = () => {
  const selectedTime = customTime || time;
  if (!selectedTime) return false;

  return mySlots.some(
    (a) => a.date === date && a.time === selectedTime
  );
};


  /* 🔄 FETCH WORKER ACCEPTED SLOTS (DATE AWARE) */
useEffect(() => {
  const fetchMySlots = async () => {
    try {
      const res = await getUserAppointments(job.user._id);
      setMySlots(res.data || []);
    } catch {
      setMySlots([]);
    }
  };

  fetchMySlots();
}, [job.user._id]);


  useEffect(() => {
    const fetchBlocked = async () => {
      try {
        const res = await getWorkerAcceptedSlots(job.user._id);
        setBlockedSlots(res.data || []);
      } catch {
        setBlockedSlots([]);
      }
    };
    fetchBlocked();
  }, [job.user._id]);

  const isPastSlot = (slot) => {
    if (date !== todayStr) return false;

    const hour = parseInt(slot.split(":")[0], 10);
    const isPM = slot.includes("PM");
    const slotHour24 =
      isPM && hour !== 12 ? hour + 12 : hour === 12 && !isPM ? 0 : hour;

    return slotHour24 <= today.getHours();
  };

  const isSlotBlocked = (slot) =>
    blockedSlots.some(
      (a) => a.date === date && a.time === slot
    );

  const isCustomTimeValid = () => {
    if (!customTime) return true;
    const [h] = customTime.split(":").map(Number);
    return h >= 7 && h <= 20;
  };

  /* ================= SUBMIT ================= */
  const submit = async () => {
    setError("");
    setSuccess(false);

    if (!date) {
      setError("Please select a date");
      return;
    }

    if (!wage || wage <= 0) {
      setError("Please enter a valid wage amount");
      return;
    }

    if (isDuplicateSlot()) {
  setError("You already sent an appointment request for this time slot.");
  return;
}


    if (!time && !customTime && !note.trim()) {
      setError("Please select a time or add a note for the worker");
      return;
    }

    if (!isCustomTimeValid()) {
      setError("Custom time must be between 7:00 AM and 8:00 PM");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      await createAppointment({
        workerId: job.user._id,
        jobId: job._id,
        workTitle: job.title,
        date,
        time: customTime || time || null,
        description: note.trim(),
        requestedWage: wage,
      });

      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send appointment request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ================= SUCCESS POPUP ================= */}
{success && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div
      className="
        bg-white rounded-2xl px-6 py-5
        text-center shadow-2xl
        w-[90%] max-w-sm
        animate-scaleIn
      "
    >
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
        <span className="text-green-600 text-xl">✓</span>
      </div>

      <h3 className="text-base font-semibold text-gray-800">
        Request Sent
      </h3>

      <p className="mt-1 text-sm text-gray-600">
        Your appointment request was sent successfully.
      </p>
    </div>
  </div>
)}


      {/* ================= MODAL ================= */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3">
        <div className="bg-white w-full max-w-md rounded-2xl flex flex-col max-h-[90vh] overflow-hidden">

          {/* HEADER */}
          <div className="flex justify-between items-center px-5 py-4 border-b">
            <h3 className="text-base font-semibold text-gray-900">
              Request Appointment
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <input
              value={job.title}
              disabled
              className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-sm"
            />

            {/* Wage */}
            <div>
              <p className="text-sm font-medium mb-1">Wage (Negotiable)</p>
              <p className="text-xs text-gray-500 mb-1">
                Original: ₹{job.wage}
              </p>
             

<input
  type="number"
  value={wage}
  onChange={(e) => {
    const val = e.target.value;
    setWage(val === "" ? "" : Number(val));
  }}
  className="w-full border rounded-lg px-3 py-2 text-sm"
  placeholder="Enter wage"
  min="0"
/>

            </div>

            {/* Date */}
            <div>
              <p className="text-sm font-medium mb-1">Select Date</p>

              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setDate(todayStr)}
                  className={`flex-1 py-1.5 rounded-lg text-sm border ${
                    date === todayStr
                      ? "bg-gray-900 text-white"
                      : "bg-white"
                  }`}
                >
                  Today
                </button>

                <button
                  onClick={() => setDate(tomorrowStr)}
                  className={`flex-1 py-1.5 rounded-lg text-sm border ${
                    date === tomorrowStr
                      ? "bg-gray-900 text-white"
                      : "bg-white"
                  }`}
                >
                  Tomorrow
                </button>
              </div>

              <input
                type="date"
                min={todayStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Time Slots */}
            <div>
              <p className="text-sm font-medium mb-1">Select Time (Optional)</p>

              <div className="grid grid-cols-4 gap-1.5">
                {slots.map((s) => {
                  const past = isPastSlot(s);
                  const blocked = isSlotBlocked(s);
                  const disabled = past || blocked;

                  const tooltipText = past
                    ? "Time already passed"
                    : blocked
                    ? "Worker already has an accepted job at this time"
                    : "Available";

                  return (
                    <Tooltip key={s} text={tooltipText}>
                      <button
                        disabled={disabled}
                        onClick={() => {
                          setTime(s);
                          setCustomTime("");
                        }}
                        className={`py-1.5 w-full rounded-md text-xs border ${
                          disabled
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : time === s
                            ? "bg-gray-900 text-white"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        {s}
                      </button>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            {/* Custom Time */}
            <div>
              <p className="text-sm font-medium mb-1">Custom Time (Optional)</p>
              <input
                type="time"
                value={customTime}
                onChange={(e) => {
                  setCustomTime(e.target.value);
                  setTime("");
                }}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Allowed between 7:00 AM – 8:00 PM
              </p>
            </div>

            {/* Notes */}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Additional notes (optional)"
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
            />

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
                {error}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="border-t px-5 py-3 flex gap-3 bg-white">
            <button
              onClick={onClose}
              className="flex-1 border rounded-lg py-2 text-sm"
            >
              Cancel
            </button>

            <button
              onClick={submit}
              disabled={loading}
              className="flex-1 bg-gray-900 text-white rounded-lg py-2 text-sm
                hover:bg-gray-800 disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Request"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
