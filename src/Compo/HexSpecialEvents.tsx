import  { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";

type EventItem = {
  timestamp: string;
  eventName: string;
  eventDescription: string;
  eventPhoto: string;
};

const truncateWords = (text: string, wordLimit: number): string => {
  const words = text.trim().split(/\s+/);
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(" ") + "…";
};

const getImageSrc = (photo: string): string => {
  const match = photo?.match(/id=([a-zA-Z0-9_-]+)/);
  const fileId = match?.[1];
  return fileId
    ? `https://lh3.googleusercontent.com/d/${fileId}`
    : photo;
};

const HexSpecialEvents = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const {userRole} =useAuth() as {
    userRole: string
  }

  const csvUrl = import.meta.env.VITE_HEX_EVENTS_READER;

  useEffect(() => {
    const fetchCSVData = async () => {
      try {
        const res = await fetch(csvUrl);
        const text = await res.text();
        const rows = text.split("\n").map((row) => row.split(","));
        const parsedData: EventItem[] = rows
          .slice(1)
          .filter((row) => row[1])
          .map((row) => ({
            timestamp: row[0]?.replace(/"/g, "").trim(),
            eventName: row[1]?.replace(/"/g, "").trim(),
            eventDescription: row[2]?.replace(/"/g, "").trim(),
            eventPhoto: row[3]?.replace(/"/g, "").trim(),
          }))
          .reverse()
          .slice(0, 4);
        setEvents(parsedData);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCSVData();
  }, [csvUrl]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedEvent(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = selectedEvent ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedEvent]);

  if (loading) {
    return (
      <div className="text-center py-10 text-lg font-medium">
        Loading events...
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h2 className="text-3xl font-bold">Latest Special Events</h2>

          {(userRole === "manager" || userRole === "member" || userRole === "assist_manager") && (
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSc3xMWlMERnNYL33XUpksGwJbgGvEbhc-Pzisunbds0IFR4lg/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Event
            </a>
          )}
        </div>

        {events.length === 0 ? (
          <div className="text-center text-gray-500">No events found.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map((event, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition duration-300"
              >
                {/* Clickable photo */}
                <div
                  className="cursor-pointer overflow-hidden"
                  onClick={() => setSelectedEvent(event)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedEvent(event)}
                  aria-label={`View details for ${event.eventName}`}
                >
                  <img
                    src={getImageSrc(event.eventPhoto)}
                    alt={event.eventName}
                    className="w-full h-52 object-cover hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="p-5">
                  {/* Clickable title */}
                  <h3
                    className="text-xl font-semibold mb-2 cursor-pointer hover:text-indigo-600 transition-colors duration-200"
                    onClick={() => setSelectedEvent(event)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedEvent(event)}
                  >
                    {event.eventName}
                  </h3>

                  {/* Truncated description — 10 words */}
                  <p className="text-gray-600 text-sm mb-3">
                    {truncateWords(event.eventDescription || "No description available", 10)}
                  </p>

                  <p className="text-xs text-gray-400">
                    {event.timestamp?.split(" ")[0]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
          onClick={() => setSelectedEvent(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selectedEvent.eventName}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative animate-fadeInScale"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: "fadeInScale 0.25s ease-out both",
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full w-9 h-9 flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110"
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Full-width image */}
            <img
              src={getImageSrc(selectedEvent.eventPhoto)}
              alt={selectedEvent.eventName}
              className="w-full object-cover"
              style={{ maxHeight: "340px" }}
              referrerPolicy="no-referrer"
            />

            {/* Content */}
            <div className="p-7">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {selectedEvent.eventName}
              </h2>
              <p className="text-xs text-indigo-500 font-medium mb-4 tracking-wide uppercase">
                {selectedEvent.timestamp?.split(" ")[0]}
              </p>
              <p className="text-gray-700 text-base leading-relaxed">
                {selectedEvent.eventDescription || "No description available."}
              </p>
            </div>
          </div>

          {/* Keyframe animation injected inline */}
          <style>{`
            @keyframes fadeInScale {
              from { opacity: 0; transform: scale(0.94) translateY(12px); }
              to   { opacity: 1; transform: scale(1)    translateY(0); }
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default HexSpecialEvents;