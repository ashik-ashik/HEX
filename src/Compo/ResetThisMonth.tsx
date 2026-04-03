/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { AlertTriangle, RefreshCcw, Loader2, ShieldAlert } from "lucide-react";

const RESET_CURRENT_MONTH_DATA_SCRIPT_URL = import.meta.env.VITE_RESET_CURRENT_MONTH_API;

const ResetMonth: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleReset = async () => {
    if (confirmText !== "RESET") return;

    try {
      setLoading(true);
      setMessage(null);

      const response = await fetch(RESET_CURRENT_MONTH_DATA_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          type: "resetAll",
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setMessage("All data cleared successfully");

        // Reset LocalStorage
        localStorage.removeItem("fixedMeal");
        localStorage.removeItem("mealData");
        localStorage.removeItem("bazarData");
        localStorage.removeItem("depositData");

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage("Failed to reset data");
      }
    } catch (error) {
      setMessage("Server Error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Reset Button */}
      <div className="py-12 min-h-[40vh] mb-4">
        {/* Dangerous Warning */}
        <div className="max-w-md w-full mx-auto mb-4 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl shadow-sm text-sm text-center">
            <h2 className="text-lg font-bold mb-2 text-red-600">একবার রিসেট করলে সব ডেটা মুছে যাবে, আর ফেরানো যাবে না</h2>
          ⚠️ <span className="font-semibold">Danger Zone:</span> Starting a new month will permanently delete 
          <span className="font-semibold"> all meals, deposits, bazar costs, utility costs, and notices.</span>
          This action <span className="font-semibold">cannot be undone.</span>
        </div>
        <div className="flex items-center justify-center mt-10">
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl shadow-md transition-all"
            >
                <RefreshCcw size={18} />
                Reset This Month Data
            </button>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-xl animate-in fade-in zoom-in">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 text-red-600 p-2 rounded-xl">
                <ShieldAlert />
              </div>
              <h2 className="text-lg font-semibold">
                Start New Month
              </h2>
            </div>

            {/* Warning */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <p className="text-sm text-red-700 flex gap-2 items-start">
                <AlertTriangle size={16} />
                This will permanently remove all meal data, deposits,
                bazar costs and utility data.
              </p>
            </div>

            {/* Confirm Input */}
            <div className="mb-4">
              <label className="text-sm font-medium">
                Type <span className="font-bold">RESET</span> to confirm
              </label>

              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full mt-2 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="Type RESET"
              />
            </div>

            {/* Message */}
            {message && (
              <div className="mb-3 text-sm text-center font-medium text-green-600">
                {message}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleReset}
                disabled={confirmText !== "RESET" || loading}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 className="animate-spin" size={16} />}
                Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResetMonth;
