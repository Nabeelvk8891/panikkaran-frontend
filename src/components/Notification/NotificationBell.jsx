import { useState } from "react";
import { FiBell } from "react-icons/fi";
import { useNotifications } from "../../context/notificationContext";
import NotificationDropdown from "./NotificationDropdown";

const NotificationBell = () => {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
      >
        <FiBell className="text-gray-700" size={22} />

        {unreadCount > 0 && (
         <span
  className="
    absolute -top-1 -right-1
    min-w-[18px] h-[18px]
    bg-red-600 text-white
    text-[11px] font-semibold
    rounded-full
    flex items-center justify-center
    px-1
    leading-none
  "
>
  {unreadCount > 9 ? "9+" : unreadCount}
</span>

        )}
      </button>

      {open && (
        <NotificationDropdown onClose={() => setOpen(false)} />
      )}
    </div>
  );
};

export default NotificationBell;
