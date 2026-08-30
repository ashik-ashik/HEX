/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import Header from "./Header";
import Footer from "./Footer";
import useAuth from "../hooks/useAuth";

interface NoticeData {
  title: string;
  content: string;
  type: string;
}


const NoticePost = () => {
  const [notice, setNotice] = useState<NoticeData>({
    title: "",
    content: "",
    type: "Notice",
  });

  const [loading, setLoading] = useState(false);

  const { user } = useAuth() as {
    user: {
      name: string;
      email: string;
      role: string;
      phoneNumber: string;
    };
  };

  // ==========================================================
  // Handle input changes
  // ==========================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    setNotice((prev) => ({
      ...prev,
      [e.target?.name]: e.target.value,
    }));
  };

  // ==========================================================
  // Submit notice
  // ==========================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    // Validate input
    if (
      !notice.title.trim() ||
      !notice.content.trim()
    ) {
      toast.error(
        "Both Title and Content are required!"
      );
      return;
    }

    // Validate user
    if (!user?.email) {
      toast.error(
        "User information is not available!"
      );
      return;
    }

    setLoading(true);

    const toastId = toast.loading(
      "Posting notice..."
    );

    try {
      // ======================================================
      // POST request
      // ======================================================

      const response = await fetch(
        import.meta.env.VITE_POST_NOTICE_API,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          body: new URLSearchParams({
            type: "Notice",
            title: notice.title.trim(),
            content: notice.content.trim(),
            postedBy: user.email.split("@")[0],
          }).toString(),
        }
      );

      // ======================================================
      // Read response as text first
      // ======================================================

      const responseText =
        await response.json();
        
      if (!responseText) {
        throw new Error(
          "Empty response received from server"
        );
      }

      // ======================================================
      // Parse JSON response
      // ======================================================





      // ======================================================
      // Success
      // ======================================================

     if (responseText === "success") {
        toast.success(responseText,
        {
          id: toastId,
        });
      } else {
        toast.error(responseText || "Something went wrong!",
        {
          id: toastId,
        });
      }

      

    } catch (error) {
      console.error(
        "Notice posting error:",
        error
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Network error!";

      toast.error(errorMessage, {
        id: toastId,
      });

    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      <Header />

      <section className="backdrop-blur-sm bg-purple-800/60 py-24 p-2">
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl border border-gray-200">

          {/* ==================================================
              Title
          ================================================== */}

          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Post a Notice
          </h2>

          {/* ==================================================
              Toast
          ================================================== */}

          <div className="relative">
            <Toaster
              containerStyle={{
                position: "sticky",
                top: 100,
                right: 20,
                zIndex: 9999,
              }}
              toastOptions={{
                className:
                  "text-xs px-3 py-2 rounded-lg shadow-md",

                style: {
                  background: "#1f2937",
                  color: "#fff",
                },

                success: {
                  className:
                    "bg-green-600 text-white text-xs px-3 py-2 rounded-lg shadow-md",

                  iconTheme: {
                    primary: "#fff",
                    secondary: "#16a34a",
                  },
                },

                error: {
                  className:
                    "bg-red-600 text-white text-xs px-3 py-2 rounded-lg shadow-md",

                  iconTheme: {
                    primary: "#fff",
                    secondary: "#dc2626",
                  },
                },

                loading: {
                  className:
                    "bg-indigo-600 text-white text-xs px-3 py-2 rounded-lg shadow-md",
                },
              }}
            />
          </div>

          {/* ==================================================
              Form
          ================================================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* ==================================================
                Notice Title
            ================================================== */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notice Title
              </label>

              <input
                type="text"
                name="title"
                value={notice.title}
                onChange={handleChange}
                placeholder="Enter notice title..."
                disabled={loading}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* ==================================================
                Notice Content
            ================================================== */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notice Content
              </label>

              <textarea
                name="content"
                value={notice.content}
                onChange={handleChange}
                placeholder="Enter notice content..."
                disabled={loading}
                className="w-full border border-gray-300 rounded-md p-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* ==================================================
                Submit Button
            ================================================== */}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md text-white font-semibold transition ${
                loading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading
                ? "Posting..."
                : "Post Notice"}
            </button>

          </form>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default NoticePost;