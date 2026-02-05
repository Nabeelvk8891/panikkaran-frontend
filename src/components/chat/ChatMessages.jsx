import { useEffect, useRef, useState } from "react";
import { FaReply, FaCheck } from "react-icons/fa";
import { formatTime } from "../../utils/formatTime";

export default function ChatMessages({
  messages = [],
  typing,
  myId,
  setReplyingTo,
  otherUser,
}) {
  const bottomRef = useRef(null);
  const touchStartX = useRef(null);
  const isNearBottomRef = useRef(true);

  const [swipeX, setSwipeX] = useState({});
  const [showScrollDown, setShowScrollDown] = useState(false);


  /* WhatsApp-like tuning */
  const MAX_SWIPE = 36;
  const TRIGGER = 22;
  const RESISTANCE = 0.4;

  const isMobile =
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: coarse)").matches;


  /* ================= SCROLL TRACK ================= */

  useEffect(() => {
    const container = bottomRef.current?.parentElement;
    if (!container) return;

    const handleScroll = () => {
  const threshold = 80;
  const distanceFromBottom =
    container.scrollHeight -
    container.scrollTop -
    container.clientHeight;

  const nearBottom = distanceFromBottom < threshold;
  isNearBottomRef.current = nearBottom;

  if (nearBottom) {
    setShowScrollDown(false);
  }
};


    container.addEventListener("scroll", handleScroll);
    return () =>
      container.removeEventListener("scroll", handleScroll);
  }, []);

useEffect(() => {
  if (isNearBottomRef.current) {
    bottomRef.current?.scrollIntoView({
  behavior: isMobile ? "auto" : "smooth",
});

  } else {
    setShowScrollDown(true); 
  }
}, [messages]);

useEffect(() => {
  if (!typing) return;

  if (isNearBottomRef.current) {
    bottomRef.current?.scrollIntoView({
      behavior: isMobile ? "auto" : "smooth",
    });
  }
}, [typing]);


  /* ================= SCROLL REQUEST LISTENER (NEW) ================= */

  useEffect(() => {
    const handleScrollRequest = () => {
  isNearBottomRef.current = true; 
  bottomRef.current?.scrollIntoView({
  behavior: isMobile ? "auto" : "smooth",
});

};


    window.addEventListener(
      "chat-scroll-bottom",
      handleScrollRequest
    );

    return () =>
      window.removeEventListener(
        "chat-scroll-bottom",
        handleScrollRequest
      );
  }, []);

  /* ================= TOUCH HANDLERS ================= */

  const onTouchStart = (e, id) => {
    touchStartX.current = e.touches[0].clientX;
    setSwipeX((p) => ({ ...p, [id]: 0 }));
  };

  const onTouchMove = (e, msg, me) => {
    if (!touchStartX.current) return;

    const diff =
      (e.touches[0].clientX - touchStartX.current) * RESISTANCE;

    if (!me && diff > 0) {
      setSwipeX((p) => ({
        ...p,
        [msg._id]: Math.min(diff, MAX_SWIPE),
      }));
    }

    if (me && diff < 0) {
      setSwipeX((p) => ({
        ...p,
        [msg._id]: Math.max(diff, -MAX_SWIPE),
      }));
    }
  };

  const onTouchEnd = (msg, me) => {
    const diff = swipeX[msg._id] || 0;

    if ((!me && diff > TRIGGER) || (me && diff < -TRIGGER)) {
      setReplyingTo(msg);
    }

    setSwipeX((p) => ({ ...p, [msg._id]: 0 }));
    touchStartX.current = null;
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3 text-[14px]">
      {messages.map((m) => {
        const me = String(m.sender) === String(myId);
        const offset = swipeX[m._id] || 0;

        /* ================= REPLY LOGIC ================= */

        const repliedMessage = m.replyTo
          ? messages.find(
              (x) => String(x._id) === String(m.replyTo)
            )
          : null;

        const replySenderId =
          m.replySender ?? repliedMessage?.sender ?? null;

        const isReplyFromMe =
          String(replySenderId) === String(myId);

        return (
          <div
            key={m._id}
            className={`flex ${
              me ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className="relative max-w-[75%] group"
              onTouchStart={(e) => onTouchStart(e, m._id)}
              onTouchMove={(e) => onTouchMove(e, m, me)}
              onTouchEnd={() => onTouchEnd(m, me)}
            >
              {/* Hover reply */}
              <button
                onClick={() => setReplyingTo(m)}
                className={`
                  hidden sm:flex absolute top-1/2 -translate-y-1/2
                  ${me ? "-left-6" : "-right-6"}
                  opacity-0 group-hover:opacity-100
                  text-gray-400 hover:text-blue-600
                `}
              >
                <FaReply size={13} />
              </button>

              {/* Message bubble */}
              <div
  className={`
    relative
    w-fit
    px-3 py-2 pr-12
    rounded-2xl
    break-words
    whitespace-pre-wrap
    select-none
    transition-transform
    ${
      me
        ? "bg-blue-500 text-white rounded-br-none"
        : "bg-gray-200 text-black rounded-bl-none"
    }
  `}
  style={{
    transform: `translate3d(${offset}px,0,0)`,
    overflowWrap: "anywhere",  
  }}
>

                {/* Reply preview */}
                {m.replyText && (
                  <div
                    className={`
                      mb-1 px-2 py-[2px]
                      rounded-md text-[11px]
                      border-l-4
                      ${
                        me
                          ? "bg-blue-400/40 border-white/80"
                          : "bg-gray-300 border-green-600"
                      }
                    `}
                  >
                    <div className="font-medium">
                      {isReplyFromMe
                        ? "You"
                        : otherUser?.name || "Contact"}
                    </div>
                    <div className="truncate opacity-80">
                      {m.replyText}
                    </div>
                  </div>
                )}

                {/* Message text */}
                <span className="block leading-relaxed">
                  {m.text}
                  <span className="inline-block w-14" />
                </span>

                {/* Time + ticks */}
                <div
                  className={`
                    absolute bottom-1 right-2
                    flex items-center gap-1
                    text-[10px]
                    ${!me ? "text-gray-500/70" : ""}
                  `}
                >
                  <span>{formatTime(m.createdAt)}</span>

                  {me && (
                    <span className="flex items-center ml-1">
                      <FaCheck
                        size={11}
                        className={
                          m.seen
                            ? "text-[#00b3ff]"
                            : "text-white"
                        }
                      />

                      {(m.delivered || m.seen) && (
                        <FaCheck
                          size={11}
                          className={`-ml-[6px] ${
                            m.seen
                              ? "text-[#00bfff]"
                              : "text-white"
                          }`}
                        />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {typing && (
  <div className="flex justify-start">
    <div className="
      bg-gray-200
      rounded-2xl rounded-bl-none
      px-3 py-3
      flex items-center gap-1
      w-fit
    ">
      <span className="dot" />
      <span className="dot delay-1" />
      <span className="dot delay-2" />
    </div>
  </div>
)}


      {showScrollDown && (
<button
  onClick={() => {
    isNearBottomRef.current = true;
    setShowScrollDown(false);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }}
  aria-label="Scroll to latest message"
  className="
    fixed bottom-24 right-5 z-50
    h-9 w-9
    flex items-center justify-center
    rounded-full

    bg-black/10 backdrop-blur-sm
    text-gray-700 text-sm

    shadow-[0_4px_12px_rgba(0,0,0,0.12)]
    ring-1 ring-black/10

    active:scale-95
    transition-all duration-150 ease-out

    md:h-8 md:w-8
  "
>
  <span className="leading-none">🡳</span>
</button>


)}


      <div ref={bottomRef} />
    </div>
  );
}
