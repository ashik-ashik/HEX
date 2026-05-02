import React, { useEffect, useState } from "react";

type EventItem = {
  timestamp: string;
  eventName: string;
  eventDescription: string;
  eventPhoto: string;
};

const HexSpecialEvents: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Google Sheet CSV Export Link
  const csvUrl = import.meta.env.VITE_HEX_EVENTS_READER;

  

  useEffect(() => {
    const fetchCSVData = async () => {
      try {
        const res = await fetch(csvUrl);
        const text = await res.text();

        const rows = text.split("\n").map((row) => row.split(","));

        // Skip header row
        const parsedData: EventItem[] = rows
          .slice(1)
          .filter((row) => row[1]) // must have event name
          .map((row) => ({
            timestamp: row[0]?.replace(/"/g, "").trim(),
            eventName: row[1]?.replace(/"/g, "").trim(),
            eventDescription: row[2]?.replace(/"/g, "").trim(),
            eventPhoto: row[3]?.replace(/"/g, "").trim()
            ,
          }))
          .reverse() // latest first
          .slice(0, 4); // latest 4 items

        setEvents(parsedData);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCSVData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10 text-lg font-medium">
        Loading events...
      </div>
    );
  }

  // format photo https://drive.google.com/open?id=1woq4d7F7hVhILf2euLqWfQKb85g0zgoe

console.log(events)

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-center mb-8">
        Latest Special Events
      </h2>

      {events.length === 0 ? (
        <div className="text-center text-gray-500">
          No events found.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((event, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition duration-300"
            >
             <img
                src={(() => {
                  const match = event?.eventPhoto?.match(/id=([a-zA-Z0-9_-]+)/);
                  const fileId = match?.[1];

                  return fileId
                    ? `https://lh3.googleusercontent.com/d/${fileId}`
                    : event?.eventPhoto;
                })()}
                alt={event?.eventName}
                className="w-full h-52 object-cover"
                referrerPolicy="no-referrer"
              />

              <div className="p-5">
                <h3 className="text-xl font-semibold mb-2">
                  {event.eventName}
                </h3>

                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {event.eventDescription || "No description available"}
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
  );
};

export default HexSpecialEvents;