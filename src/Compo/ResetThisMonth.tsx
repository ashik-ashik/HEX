import React, { useState } from "react";
import { AlertTriangle, RefreshCcw, Loader2, ShieldAlert, X } from "lucide-react";

const RESET_CURRENT_MONTH_DATA_SCRIPT_URL = import.meta.env.VITE_RESET_CURRENT_MONTH_API;

const ResetMonth: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">("success");

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
        setMessageType("success");
        setMessage("সব ডেটা সফলভাবে মুছে ফেলা হয়েছে");

        // Reset LocalStorage
        localStorage.removeItem("fixedMeal");
        localStorage.removeItem("mealData");
        localStorage.removeItem("bazarData");
        localStorage.removeItem("depositData");

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessageType("error");
        setMessage("ডেটা রিসেট করা যায়নি");
        setLoading(false);
      }
    } catch (error) {
      setMessageType("error");
      setMessage("সার্ভার ত্রুটি। আবার চেষ্টা করুন।" + (error as Error).message);
      setLoading(false);
    }
  };

  const closeModal = () => {
    if (loading) return;
    setOpen(false);
    setConfirmText("");
    setMessage(null);
  };

  return (
    <>
      {/* Danger Zone */}
      <div className="flex items-center justify-center px-3 py-10 sm:py-12">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-red-100 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-orange-400" />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                <ShieldAlert className="w-7 h-7 text-red-600" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-2">
                ডেঞ্জার জোন
              </h2>
              <p className="text-xs font-semibold text-red-900 mt-1">
                একবার রিসেট করলে সব ডেটা মুছে যাবে, আর ফেরানো যাবে না
              </p>

              <div className="w-full text-left bg-red-50/70 border border-red-200 rounded-2xl p-4 mt-5">
                <p className="text-xs text-red-700 leading-relaxed">
                  <span className="font-semibold">সতর্কবার্তা:</span> নতুন মাস
                  শুরু করলে নিচের সবকিছু স্থায়ীভাবে মুছে যাবে —
                </p>
                <ul className="mt-2 space-y-1 text-xs text-red-700">
                  {["সকল মিল হিসাব", "সকল জমা", "বাজার খরচ", "ইউটিলিটি খরচ", "নোটিশ"].map(
                    (item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                        {item}
                      </li>
                    )
                  )}
                </ul>
                <p className="text-xs text-red-700 mt-2 font-semibold">
                  এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
                </p>
              </div>

              <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-sm font-semibold px-6 py-3.5 rounded-xl shadow-md shadow-red-200 transition-all mt-6"
              >
                <RefreshCcw size={17} />
                এই মাসের ডেটা রিসেট করুন
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-3">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-6 pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 text-red-600 p-2.5 rounded-xl">
                  <ShieldAlert size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-800">
                  নতুন মাস শুরু করুন
                </h2>
              </div>
              <button
                onClick={closeModal}
                disabled={loading}
                className="text-slate-400 hover:text-slate-600 disabled:opacity-40 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 pt-4">
              {/* Warning */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-5">
                <p className="text-xs text-red-700 flex gap-2 items-start leading-relaxed">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  এটি সমস্ত মিল হিসাব, জমা, বাজার খরচ এবং ইউটিলিটি খরচ
                  স্থায়ীভাবে মুছে ফেলবে।
                </p>
              </div>

              {/* Confirm Input */}
              <div className="mb-2">
                <label className="text-xs font-medium text-slate-500">
                  নিশ্চিত করতে <span className="font-bold text-red-600">RESET</span> লিখুন
                </label>

                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  disabled={loading}
                  className="w-full mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all disabled:opacity-60"
                  placeholder="RESET"
                  autoComplete="off"
                />
              </div>

              {/* Message */}
              {message && (
                <div
                  className={`mt-3 text-xs text-center font-medium rounded-lg py-2 ${
                    messageType === "success"
                      ? "text-green-700 bg-green-50 border border-green-200"
                      : "text-red-700 bg-red-50 border border-red-200"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closeModal}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-40 transition-all"
                >
                  বাতিল
                </button>

                <button
                  onClick={handleReset}
                  disabled={confirmText !== "RESET" || loading}
                  className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 transition-all shadow-md shadow-red-200"
                >
                  {loading && <Loader2 className="animate-spin" size={16} />}
                  সব ডেটা রিসেট করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-screen blocking loader while resetting */}
      {loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4 text-center px-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-red-100" />
              <div className="absolute inset-0 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
            </div>
            <div>
              <p className="text-slate-800 font-semibold text-sm">
                ডেটা রিসেট করা হচ্ছে...
              </p>
              <p className="text-slate-400 text-[11px] mt-1">
                অনুগ্রহ করে পেজটি বন্ধ বা রিলোড করবেন না
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResetMonth;