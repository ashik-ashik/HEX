/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import Header from "./Header";
import Footer from "./Footer";
import DataEntryWarning from "./DataEntryWarning";

interface NoticeData {
  title: string;
  content: string;
  type: string;
}
interface ManagerStatus{managerStatus:boolean}

const NoticePost: React.FC <ManagerStatus>= ({managerStatus}) => {
  const [notice, setNotice] = useState<NoticeData>({ title: "", content: "", type:"Notice" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNotice({ ...notice, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!notice.title.trim() || !notice.content.trim()) {
    toast.error("Both Title and Content are required!");
    return;
  }

  setLoading(true);
  const toastId = toast.loading("Posting notice...");

  try {
    const res = await fetch(
      import.meta.env.VITE_POST_NOTICE_API,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          title: notice.title,
          content: notice.content,
          type: notice.type, // make sure this is included
        }),
      }
    );

    const data = await res.json();

    if (data.status === "success") {
      toast.success(data.message, { id: toastId });
      setNotice({ title: "", content: "", type: "Notice" });
    } else {
      toast.error(data.message || "Something went wrong!", { id: toastId });
    }
  } catch (err: any) {
    toast.error(err.message || "Network error!", { id: toastId });
  } finally {
    setLoading(false);
  }
};

  return (
    <>
    <Header />
    {/* toast */}
        
    <section className="backdrop-blur-sm bg-purple-800/60 py-24 p-2">
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Post a Notice</h2>

        <div className="relative">
            <Toaster  
            containerStyle={{
                position: "sticky",
                top: 100,
                right: 20,
                zIndex: 9999,
            }}
            toastOptions={{
                className: "text-xs px-3 py-2 rounded-lg shadow-md",
                style: {
                background: "#1f2937", // gray-800
                color: "#fff",
                },
                success: {
                className: "bg-green-600 text-white text-xs px-3 py-2 rounded-lg shadow-md",
                iconTheme: {
                    primary: "#fff",
                    secondary: "#16a34a",
                },
                },
                error: {
                className: "bg-red-600 text-white text-xs px-3 py-2 rounded-lg shadow-md",
                iconTheme: {
                    primary: "#fff",
                    secondary: "#dc2626",
                },
                },
                loading: {
                className: "bg-indigo-600 text-white text-xs px-3 py-2 rounded-lg shadow-md",
                },
            }} />
        </div>

        <DataEntryWarning managerStatus={managerStatus} />
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notice Title</label>
            <input
                type="text"
                name="title"
                value={notice.title}
                onChange={handleChange}
                placeholder="Enter notice title..."
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notice Content</label>
            <textarea
                name="content"
                value={notice.content}
                onChange={handleChange}
                placeholder="Enter notice content..."
                className="w-full border border-gray-300 rounded-md p-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            </div>
            <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-semibold ${
                loading ? "bg-purple-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
            >
            {loading ? "Posting..." : "Post Notice"}
            </button>
        </form>

        

        </div>
    </section>
    <Footer />
    </>
  );
};

export default NoticePost;