import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Tag, Wallet, Zap } from "lucide-react";
// import Header from "./Header";
// import DataEntryWarning from "./DataEntryWarning";
import useAuth from "../hooks/useAuth";

interface AuthContextType {
  userRole: string | null;
}

const UtilityCostEntry = () => {
  const [costSection, setCostSection] = useState("");
  const [amount, setAmount] = useState("");
  const [loadingOnSubmit, setLoadingOnSubmit] = useState(false);
  const { userRole } = useAuth() as AuthContextType;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!costSection || !amount) {
      toast.error("Please fill all fields");
      return;
    }

    const loadingToast = toast.loading("Adding Utility Cost...");

    try {
      setLoadingOnSubmit(true);
      const response = await fetch(
        import.meta.env.VITE_INSERT_UTILITY_COSTS_API,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            type: "utilityCosts",
            costSection: costSection,
            amount: amount,
          }),
        }
      );

      const result = await response.json();
      toast.success(result.message, {
      id: loadingToast,
    });

      // Reset form
      setCostSection("");
      setAmount("");
      setLoadingOnSubmit(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add utility cost", {
        id: loadingToast,
      });
      setLoadingOnSubmit(false);
    }
  };

  return (
    <>
      {/* <Header /> */}
      <section className="flex items-center justify-center px-3 py-10 sm:py-12">
        <Toaster
          position="top-right"
          containerStyle={{
            position: "fixed",
            top: 100,
            right: 20,
            zIndex: 9999,
          }}
          toastOptions={{
            className: "text-xs px-3 py-2 rounded-lg shadow-md",
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

        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-100 p-5 sm:p-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3">
              <Zap className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              ইউটিলিটি খরচ এন্ট্রি
            </h2>
            <p className="text-[11px] leading-relaxed text-slate-600 mt-1.5 max-w-md">
              এই ফর্মের মাধ্যমে আপনি বিদ্যুৎ, গ্যাস, পানি, ওয়াইফাই বা অন্যান্য
              সাধারণ খরচের খাত ও পরিমাণ যুক্ত করতে পারবেন। খাতের নাম লিখুন বা
              তালিকা থেকে বেছে নিন।
            </p>
          </div>

          {(userRole === "manager" || userRole === "assist_manager") && (
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              {/* Cost Section */}
              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  খরচের খাত
                </label>
                <input
                  type="text"
                  value={costSection}
                  onChange={(e) => setCostSection(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="বিদ্যুৎ, পানি, ইন্টারনেট..."
                  required
                  list="utility-costs-sector-list"
                />
                <datalist id="utility-costs-sector-list">
                  <option value="Toiletries">Toiletries</option>
                  <option value="ময়লা বিল">ময়লা বিল</option>
                  <option value="Basa vara">Basa vara</option>
                  <option value="Khala Bill">Khala Bill</option>
                  <option value="Gass Bill">Gass Bill</option>
                  <option value="Electricity Bill">Electricity Bill</option>
                  <option value="Wi-Fi Bill">Wi-Fi Bill</option>
                  <option value="Water Bill">Water Bill</option>
                  <option value="Paper Bill">Paper Bill</option>
                  <option value="Tooth Paste">Tooth Paste</option>
                </datalist>
              </div>

              {/* Amount */}
              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5" />
                  পরিমাণ (৳)
                </label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="৫০০"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loadingOnSubmit}
                className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.99] disabled:active:scale-100 ${
                  loadingOnSubmit
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
                }`}
              >
                {loadingOnSubmit ? "সাবমিট হচ্ছে..." : "ইউটিলিটি খরচ যুক্ত করুন"}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
};

export default UtilityCostEntry;