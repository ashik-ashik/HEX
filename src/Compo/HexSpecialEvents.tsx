import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import useAuth from "../hooks/useAuth";
import { Link } from "react-router-dom";

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
  return fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : photo;
};

const HexSpecialEvents = ({eventLimit}: {eventLimit: number}) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { userRole } = useAuth() as { userRole: string };

  const csvUrl = import.meta.env.VITE_HEX_EVENTS_READER;


  // fixing modal issue
  useEffect(() => {
  if (selectedEvent) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return () => {
    document.body.style.overflow = "auto";
  };
}, [selectedEvent]);




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
          .slice(0, eventLimit);
        setEvents(parsedData);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCSVData();
  }, [csvUrl, eventLimit]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedEvent(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedEvent ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedEvent]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid #e0e7ff",
              borderTop: "3px solid #6366f1",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ color: "#6b7280", fontSize: 14, fontFamily: "Georgia, serif" }}>
            Loading events…
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95) translateY(16px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .event-card {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
        }
        .event-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(99,102,241,0.15), 0 8px 16px rgba(0,0,0,0.08);
        }
        .event-card img {
          transition: transform 0.5s ease;
        }
        .event-card:hover img {
          transform: scale(1.06);
        }
        .badge-shimmer {
          background: linear-gradient(90deg, #6366f1, #818cf8, #6366f1);
          background-size: 200% auto;
          animation: shimmer 2.5s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .modal-overlay {
          animation: fadeInScale 0.0s ease; /* overlay instant */
        }
        .modal-content {
          animation: fadeInScale 0.28s cubic-bezier(0.34, 1.4, 0.64, 1) both;
        }
      `}</style>

      <section className="backdrop-blur-sm"
        style={{
          padding: "5rem 1rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative blobs */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Section header */}
          <div style={{ marginBottom: "3rem" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#6366f1",
                    marginBottom: 10,
                    fontFamily: "Georgia, serif",
                  }}
                >
                  ✦ Community Life
                </p>
                <h2
                  style={{
                    fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                    fontWeight: 800,
                    color: "#f14b19",
                    margin: 0,
                    lineHeight: 1.15,
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Latest Special Events
                </h2>
                <div
                  style={{
                    width: 48,
                    height: 3,
                    background: "linear-gradient(90deg, #6366f1, #a5b4fc)",
                    borderRadius: 4,
                    marginTop: 12,
                  }}
                />
              </div>

              {(userRole === "manager" || userRole === "member" || userRole === "assist_manager") && (
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSc3xMWlMERnNYL33XUpksGwJbgGvEbhc-Pzisunbds0IFR4lg/viewform"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    padding: "10px 20px",
                    borderRadius: 12,
                    textDecoration: "none",
                    boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
                    letterSpacing: "0.02em",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 20px rgba(99,102,241,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 12px rgba(99,102,241,0.35)";
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Event
                </a>
              )}
            </div>
          </div>

          {/* Cards grid */}
          {events.length === 0 ? (
            <div style={{ textAlign: "center", color: "#9ca3af", padding: "3rem 0", fontFamily: "Georgia, serif" }}>
              No events found.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {events.map((event, index) => (
                <div
                  key={index}
                  className="event-card"
                  style={{
                    background: "#fff",
                    borderRadius: 20,
                    overflow: "hidden",
                    border: "1px solid rgba(99,102,241,0.1)",
                    cursor: "pointer",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  }}
                  onClick={() => setSelectedEvent(event)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedEvent(event)}
                  aria-label={`View details for ${event.eventName}`}
                >
                  {/* Image */}
                  <div style={{ overflow: "hidden", position: "relative" }}>
                    <img
                      src={getImageSrc(event.eventPhoto)}
                      alt={event.eventName}
                      style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
                      referrerPolicy="no-referrer"
                    />
                    {/* Gradient overlay on hover */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to top, rgba(30,27,75,0.5) 0%, transparent 60%)",
                        opacity: hoveredIndex === index ? 1 : 0,
                        transition: "opacity 0.3s ease",
                      }}
                    />
                    {/* Date chip */}
                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        background: "rgba(255,255,255,0.92)",
                        backdropFilter: "blur(8px)",
                        borderRadius: 8,
                        padding: "3px 10px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#6366f1",
                        letterSpacing: "0.04em",
                        fontFamily: "Georgia, serif",
                      }}
                    >
                      {event.timestamp?.split(" ")[0]}
                    </div>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: "1.25rem" }}>
                    <h3
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        marginBottom: 8,
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        lineHeight: 1.3,
                        transition: "color 0.2s",
                        color: hoveredIndex === index ? "#6366f1" : "#1e1b4b",
                      }}
                    >
                      {event.eventName}
                    </h3>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#6b7280",
                        lineHeight: 1.55,
                        margin: 0,
                      }}
                    >
                      {truncateWords(event.eventDescription || "No description available", 10)}
                    </p>

                    {/* Read more hint */}
                    <div
                      style={{
                        marginTop: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#6366f1",
                        opacity: hoveredIndex === index ? 1 : 0,
                        transform: hoveredIndex === index ? "translateX(0)" : "translateX(-6px)",
                        transition: "opacity 0.25s, transform 0.25s",
                      }}
                    >
                      Read more
                      <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {
          eventLimit < 5 &&
          <div className="pt-8 flex items-center justify-center">
            <Link
              to="/events"
              className="relative inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-full 
              bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 
              shadow-lg shadow-blue-500/30 
              hover:shadow-xl hover:shadow-purple-500/40 
              transition-all duration-300 
              hover:scale-105 active:scale-95"
            >
              {/* Glow Effect */}
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 opacity-0 blur-md hover:opacity-70 transition duration-300"></span>

              {/* Text */}
              <span className="relative z-10">Explore All Events</span>

              {/* Icon */}
              <svg
                className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        }
      </section>

      {/* ── Modal — rendered in a portal-like pattern using fixed positioning ── */}
      {/* KEY FIX: The modal is outside any `position: relative` parent.          */}
      {/* In HomeInitial, remove the <div className="relative"> wrapper around    */}
      {/* <HexSpecialEvents /> so this fixed overlay covers the full viewport.     */}
     {/* ── Full Screen Modal ── */}


          {selectedEvent &&
  createPortal(
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        backgroundColor: "rgba(15,10,50,0.75)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        overflowY: "auto",
      }}
      onClick={() => setSelectedEvent(null)}
      role="dialog"
      aria-modal="true"
      aria-label={selectedEvent.eventName}
    >
      <div
        className="modal-content w-full"
        onClick={(e) => e.stopPropagation()}
        style={{
          
          minHeight: "100vh",
          background: "#ffffff",
          position: "relative",
          margin: 0,
          borderRadius: 0,
          overflow: "hidden",
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedEvent(null)}
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 2147483647,
            background: "#ffffff",
            border: "none",
            borderRadius: "9999px",
            width: 48,
            height: 48,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          }}
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={22}
            height={22}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Hero Image */}
        <img
          src={getImageSrc(selectedEvent.eventPhoto)}
          alt={selectedEvent.eventName}
          style={{
            width: "100%",
            height: "55vh",
            objectFit: "cover",
            display: "block",
          }}
          referrerPolicy="no-referrer"
        />

        {/* Gradient Bar */}
        <div
          style={{
            height: 5,
            background: "linear-gradient(90deg,#6366f1,#7c3aed,#a855f7)",
          }}
        />

        {/* Content */}
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "3rem 1.5rem 5rem",
          }}
        >
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#6366f1",
              marginBottom: 12,
            }}
          >
            ✦ {selectedEvent.timestamp?.split(" ")[0]}
          </p>

          <h2
            style={{
              fontSize: "clamp(2rem,5vw,4rem)",
              fontWeight: 800,
              color: "#1e1b4b",
              marginBottom: "1.5rem",
              lineHeight: 1.15,
            }}
          >
            {selectedEvent.eventName}
          </h2>

          <p
            style={{
              color: "#4b5563",
              fontSize: 18,
              lineHeight: 1.9,
              whiteSpace: "pre-wrap",
            }}
          >
            {selectedEvent.eventDescription || "No description available."}
          </p>
        </div>
      </div>
    </div>,
    document.body
  )}
    </>
  );
};

export default HexSpecialEvents;