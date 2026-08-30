import React, { useState } from "react";
import {
  AlertTriangle,
  RefreshCcw,
  Loader2,
  ShieldAlert,
  X,
} from "lucide-react";

const RESET_CURRENT_MONTH_DATA_SCRIPT_URL =
  import.meta.env.VITE_RESET_CURRENT_MONTH_API;

const ResetMonth: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const handleReset = async () => {
    if (confirmText !== "RESET" || loading) return;

    try {
      setLoading(true);
      setMessage(null);

      const response = await fetch(RESET_CURRENT_MONTH_DATA_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          type: "resetAll",
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        setMessageType("success");
        setMessage(
          "The current month's data has been reset successfully."
        );

        // Clear locally cached current-month data.
        localStorage.removeItem("fixedMeal");
        localStorage.removeItem("mealData");
        localStorage.removeItem("bazarData");
        localStorage.removeItem("depositData");

        // Give the user a moment to see the success message.
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessageType("error");
        setMessage(
          data.message || "The data could not be reset. No changes were made."
        );
        setLoading(false);
      }
    } catch (error) {
      console.error("Reset month error:", error);

      setMessageType("error");
      setMessage(
        error instanceof Error
          ? `Server error: ${error.message}`
          : "A server error occurred. Please try again."
      );
      setLoading(false);
    }
  };

  const closeModal = () => {
    if (loading) return;

    setOpen(false);
    setConfirmText("");
    setMessage(null);
    setMessageType("success");
  };

  const openModal = () => {
    setMessage(null);
    setConfirmText("");
    setOpen(true);
  };

  return (
    <>
      {/* =========================================================
          DANGER ZONE
      ========================================================= */}
      <section
        className="flex items-center justify-center px-3 py-10 sm:py-12"
        aria-labelledby="danger-zone-title"
      >
        <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-red-100 bg-white shadow-xl">
          {/* Top danger accent */}
          <div className="h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-orange-400" />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                <ShieldAlert className="h-7 w-7 text-red-600" />
              </div>

              {/* Title */}
              <h2
                id="danger-zone-title"
                className="mb-2 text-xl font-bold text-red-600 sm:text-2xl"
              >
                Danger Zone
              </h2>

              <p className="mt-1 text-xs font-semibold text-red-900">
                Resetting the current month permanently deletes its data.
              </p>

              {/* Detailed Warning */}
              <div className="mt-5 w-full rounded-2xl border border-red-200 bg-red-50/70 p-4 text-left">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

                  <div>
                    <p className="text-xs font-semibold text-red-800">
                      Important: Read before continuing
                    </p>

                    <p className="mt-1.5 text-xs leading-relaxed text-red-700">
                      This action is intended to start a new monthly accounting
                      cycle. It will permanently remove the current month's
                      operational data from the system.
                    </p>
                  </div>
                </div>

                {/* Data that will be deleted */}
                <div className="mt-4">
                  <p className="text-xs font-semibold text-red-800">
                    The following data will be permanently deleted:
                  </p>

                  <ul className="mt-2 space-y-1.5 text-xs text-red-700">
                    {[
                      "All meal records and meal calculations",
                      "All meal deposits",
                      "All bazar / grocery cost records",
                      "All utility cost records",
                      "All utility deposits",
                      "Current-month notices",
                      "Other current-month operational data handled by the reset API",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 leading-relaxed"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Permanent warning */}
                <div className="mt-4 rounded-lg border border-red-300 bg-red-100 px-3 py-2.5">
                  <p className="text-xs font-semibold leading-relaxed text-red-800">
                    ⚠️ This action cannot be undone from this application.
                    Make sure the monthly settlement/history has been saved
                    before proceeding.
                  </p>
                </div>
              </div>

              {/* Reset Button */}
              <button
                type="button"
                onClick={openModal}
                className="mt-6 flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-red-200 transition-all hover:bg-red-700 active:scale-[0.98]"
              >
                <RefreshCcw size={17} />
                Reset Current Month
              </button>

              <p className="mt-3 max-w-md text-center text-[10px] leading-relaxed text-slate-400">
                Only use this option when you are completely sure that the
                current month's records are no longer needed in the active
                accounting cycle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CONFIRMATION MODAL
      ========================================================= */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-modal-title"
        >
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-3 px-6 pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-100 p-2.5 text-red-600">
                  <ShieldAlert size={20} />
                </div>

                <div>
                  <h2
                    id="reset-modal-title"
                    className="text-lg font-bold text-slate-800"
                  >
                    Reset Current Month?
                  </h2>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    This is a permanent destructive action.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                aria-label="Close"
                className="text-slate-400 transition-colors hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 pt-5">
              {/* Critical Warning */}
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle
                    size={17}
                    className="mt-0.5 shrink-0 text-red-600"
                  />

                  <div>
                    <p className="text-xs font-bold text-red-800">
                      Permanent Data Deletion
                    </p>

                    <p className="mt-1.5 text-xs leading-relaxed text-red-700">
                      Resetting the current month will permanently delete the
                      current operational records. This cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <p className="text-xs font-semibold text-slate-700">
                  Before you continue, make sure:
                </p>

                <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-slate-500">
                  <li>• The month's settlement has been reviewed.</li>
                  <li>• Any required historical record has been saved.</li>
                  <li>• No additional meal or expense entry is pending.</li>
                  <li>• You intentionally want to start a new month.</li>
                </ul>
              </div>

              {/* Confirmation Input */}
              <div className="mt-5">
                <label
                  htmlFor="reset-confirmation"
                  className="text-xs font-medium text-slate-600"
                >
                  To confirm, type{" "}
                  <span className="font-bold text-red-600">RESET</span>{" "}
                  exactly as shown below.
                </label>

                <input
                  id="reset-confirmation"
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  disabled={loading}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium tracking-wider text-slate-700 outline-none transition-all focus:border-red-400 focus:ring-2 focus:ring-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="Type RESET"
                  autoComplete="off"
                  autoFocus
                  spellCheck={false}
                />

                {confirmText.length > 0 &&
                  confirmText !== "RESET" && (
                    <p className="mt-1.5 text-[10px] text-red-500">
                      The confirmation text must exactly match RESET.
                    </p>
                  )}
              </div>

              {/* Server Message */}
              {message && (
                <div
                  className={`mt-4 rounded-lg border px-3 py-2.5 text-center text-xs font-medium ${
                    messageType === "success"
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Modal Actions */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={confirmText !== "RESET" || loading}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-200 transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading && (
                    <Loader2 className="animate-spin" size={16} />
                  )}

                  {loading ? "Resetting..." : "Permanently Reset Data"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          FULL-SCREEN BLOCKING LOADER
      ========================================================= */}
      {loading && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 px-6 backdrop-blur-md"
          role="status"
          aria-live="assertive"
        >
          <div className="flex flex-col items-center text-center">
            {/* Spinner */}
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-red-100" />

              <div className="absolute inset-0 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
            </div>

            {/* Loading text */}
            <div className="mt-5">
              <p className="text-sm font-semibold text-slate-800">
                Resetting Current Month...
              </p>

              <p className="mt-1.5 max-w-xs text-[11px] leading-relaxed text-slate-400">
                The system is processing the reset. Please do not close,
                refresh, or navigate away from this page.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResetMonth;