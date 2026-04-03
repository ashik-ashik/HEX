import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const UPDATE_KEY_URL = import.meta.env.VITE_UPDATE_MANAGER_KEY_API; // Replace with your Web App URL

interface ManagerStatus {
  managerStatus: boolean;
}

const UpdateManagerKey: React.FC<ManagerStatus> = ({ managerStatus }) => {
  const [currentKey, setCurrentKey] = useState("");
  const [newKey, setNewKey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!currentKey.trim() || !newKey.trim()) {
      toast.error("Both current and new keys are required.");
      return;
    }

    if (newKey.trim().length < 4) {
      toast.error("New key should be at least 4 characters long.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Updating manager key...");

    try {
      const res = await fetch(UPDATE_KEY_URL, {
        method: "POST",
        headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
        body: JSON.stringify({ currentKey: currentKey.trim(), newKey: newKey.trim() }),
      });

      const result = await res.json();

      if (result.status === "success") {
        toast.success(result.message, { id: toastId });
        setCurrentKey("");
        setNewKey("");
      } else {
        toast.error(result.message, { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update key ❌", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!managerStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 font-semibold">❌ Access Denied. Only manager can update key.</p>
      </div>
    );
  }

  return (
    <div className="lg:min-h-screen min-h-[62vh] flex items-center justify-center p-2">

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
      <Toaster position="top-right" containerStyle={{ top: 100, right: 20, zIndex: 9999 }} />
        <h2 className="text-2xl font-semibold text-center mb-6">Update Manager Key</h2>

        <p className="text-sm text-gray-600 mb-4">
          Enter the current key and the new key. Only authenticated managers can update it.
        </p>

        <input
          type="text"
          placeholder="Current Key"
          value={currentKey}
          onChange={(e) => setCurrentKey(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
        />

        <input
          type="text"
          placeholder="New Key"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
        />

        <button
          onClick={handleUpdate}
          disabled={loading}
          className={`w-full py-2 rounded-lg text-white transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Updating..." : "Update Key"}
        </button>

        <p className="text-xs text-gray-500 mt-3">
          ⚠️ Only update if you know the current key. Share the new key only with authorized personnel.
        </p>
      </div>
    </div>
  );
};

export default UpdateManagerKey;