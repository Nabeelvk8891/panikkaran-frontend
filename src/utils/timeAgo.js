export function timeAgo(date) {
  if (!date) return "offline";

  const now = new Date();
  const past = new Date(date);

  // 🔒 Guard against invalid / future dates
  if (isNaN(past.getTime()) || past > now) {
    return "just now";
  }

  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  // Very recent
  if (diffSec < 45) return "just now";
  if (diffSec < 90) return "1 minute ago";
  if (diffMin < 45) return `${diffMin} minutes ago`;

  // Hours
  if (diffMin < 90) return "about 1 hour ago";
  if (diffHr < 6) return `${diffHr} hours ago`;

  // Today / Yesterday
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const isToday = past >= today;
  const isYesterday = past >= yesterday && past < today;

  const timeStr = past.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) return `today at ${timeStr}`;
  if (isYesterday) return `yesterday at ${timeStr}`;

  // 🔴 Older than yesterday but within a week
  if (diffDay < 7) {
    return past.toLocaleDateString([], {
      weekday: "long",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // 🔥 More than one week
  return "offline";
}
