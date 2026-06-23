import React, { useEffect, useState } from "react";
import Header from "./Compo/Header";
import Footer from "./Compo/Footer";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  AlertTriangle, Settings, X, Save, Loader2,
  CheckCircle2, TrendingUp, TrendingDown, Utensils, Wallet, Zap,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import useAuth from "./hooks/useAuth";

export type UtilityDeposit = {
  member: string;
  total: number;
};

interface MemberData {
  name: string;
  total: number;
  image?: string;
}

interface MealRow {
  name: string;
  total: number;
}

interface Props {
  members: MemberData[];
  mealData: MealRow[];
  grandDeposit: number;
  totalBazar: number;
  utilityDeposits: UtilityDeposit[];
  utilityCosts: string[][];
  grandTotalMeals: number;
  isLoading: boolean;
  managerThisMonth: string;
}

type User = {
  name: string;
  email: string;
  role: string;
  photoURL: string;
  uid: string;
  emailVerified: string;
  phoneNumber: string;
  provider: string;
  lastLoginAt: string;
};

type AuthContextType = {
  usersList: User[];
};

const SettlementPage: React.FC<Props> = ({
  members,
  mealData,
  grandDeposit,
  totalBazar,
  utilityDeposits,
  utilityCosts,
  isLoading,
  managerThisMonth,
}) => {
  const [showFixedModal, setShowFixedModal] = useState<boolean>(false);
  const [fixedMealInput, setFixedMealInput] = useState<number>(0);
  const [fixedMeals, setFixedMeals] = useState<number>(0);
  const [isSavingHistory, setIsSavingHistory] = useState(false);
  const [historySaved, setHistorySaved] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const { usersList } = useAuth() as AuthContextType;
  const FindManager = usersList?.find((u) => u?.role?.toLowerCase() === "manager");

  useEffect(() => {
    const savedFixedMeal =
      typeof window !== "undefined" ? Number(localStorage.getItem("fixedMeal")) || 0 : 0;
    setFixedMeals(savedFixedMeal);
    setFixedMealInput(savedFixedMeal);
    if (!savedFixedMeal || savedFixedMeal === 0) setShowFixedModal(true);
  }, [fixedMeals]);

  const handleSetFixedMeal = () => {
    localStorage.setItem("fixedMeal", fixedMealInput.toString());
    toast.success("Fixed meal saved successfully");
    setShowFixedModal(false);
    setTimeout(() => window.location.reload(), 800);
  };

  const adjustedMeals = mealData.map((m) => {
    const actual = Number(m.total || 0);
    return {
      name: m.name,
      total: fixedMeals && actual >= 5 && actual < fixedMeals ? fixedMeals : actual,
    };
  });

  const adjustedGrandTotalMeals = adjustedMeals.reduce((sum, m) => sum + m.total, 0);
  const totalUtilityDeposit = utilityDeposits.reduce((sum, p) => sum + p.total, 0);
  const totalUtilityCost = utilityCosts.reduce((sum, item) => sum + (parseFloat(item[1]) || 0), 0);
  const mealRate = adjustedGrandTotalMeals > 0 ? totalBazar / adjustedGrandTotalMeals : 0;

  const mealMap = Object.fromEntries(adjustedMeals.map((m) => [m.name, m]));
  const settlements = members.map((member) => {
    const meals = mealMap[member.name]?.total || 0;
    const mealCost = meals * mealRate;
    const balance = member.total - mealCost;
    return { name: member.name, image: member.image, deposit: member.total, meals, mealCost, balance };
  });

  const today = new Date();
  const currentDate = today.getDate();
  const saveEnabled = currentDate >= 2 || currentDate <= 2;

  const handleSaveHistory = async () => {
    if (historySaved) { toast("Already saved for this month"); return; }
    try {
      setIsSavingHistory(true);
      toast.loading("Preparing settlement summary...", { id: "saveHistory" });
      const month = new Date().toLocaleDateString("default", { month: "long", year: "numeric" });
      const memberForHistory = settlements?.map((m) => ({
        name: m?.name,
        deposit: m?.deposit || 0,
        meals: m?.meals || 0,
        mealCost: Math.ceil(m?.mealCost || 0),
        balance: Math.ceil(m?.balance || 0),
        status: m?.balance < 0 ? "Needs to Pay" : "Will Receive",
      }));
      const contents = {
        managerThisMonth: FindManager?.name,
        totalDeposit: grandDeposit,
        totalBazar,
        netMealBalance: grandDeposit - totalBazar,
        utilityDeposit: totalUtilityDeposit,
        utilityCost: totalUtilityCost,
        netUtilityBalance: totalUtilityDeposit - totalUtilityCost,
        fixedMeal: fixedMeals,
        totalMeal: adjustedGrandTotalMeals,
        mealRate,
        members: memberForHistory,
      };
      toast.loading("Sending data to Google Sheet...", { id: "saveHistory" });
      const res = await fetch(import.meta.env.VITE_STORE_SUMMARY_API_SHEET, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          type: "saveSummary",
          month: ` ${month} | ${managerThisMonth}`,
          contents: contents ? JSON.stringify(contents) : "",
        }),
      });
      toast.loading("Saving monthly history...", { id: "saveHistory" });
      const result = await res.json();
      if (result.status === "success") {
        toast.success("Monthly settlement saved successfully", { id: "saveHistory" });
        setHistorySaved(true);
      } else throw new Error("Save failed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save settlement ❌", { id: "saveHistory" });
    } finally {
      setIsSavingHistory(false);
    }
  };

  const handlePrintPDF = async () => {
    const input = document.getElementById("settlement-page");
    if (!input) return;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("Settlement.pdf");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm tracking-widest uppercase">Loading</p>
        </div>
      </div>
    );
  }

  const netMealBalance = grandDeposit - totalBazar;
  const netUtilityBalance = totalUtilityDeposit - totalUtilityCost;
  const currentMonth = new Date().toLocaleDateString("default", { month: "long", year: "numeric" });

  /* ── Reusable modal backdrop ── */
  const ModalBackdrop = ({ children }: { children: React.ReactNode }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      {children}
    </div>
  );

  /* ── Save button used in two places ── */
  const SaveBtn = ({ compact = false }: { compact?: boolean }) => (
    <button
      onClick={() => {
        if (historySaved) { toast("Already saved for this month"); return; }
        setShowConfirmModal(true);
      }}
      disabled={!saveEnabled || isSavingHistory || historySaved}
      className={`flex items-center gap-1.5 font-semibold rounded-lg border transition-colors
        ${compact ? "px-3 py-2 text-xs" : "px-5 py-2.5 text-sm"}
        ${saveEnabled && !historySaved
          ? "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700"
          : "bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed"
        }`}
    >
      {isSavingHistory
        ? <><Loader2 size={compact ? 12 : 14} className="animate-spin" />Saving…</>
        : historySaved
          ? <><CheckCircle2 size={compact ? 12 : 14} />Saved</>
          : <><Save size={compact ? 12 : 14} />Save History</>
      }
    </button>
  );

  return (
    <section id="settlement-page" className="min-h-screen bg-slate-950 font-sans">
      <Toaster position="top-center" toastOptions={{ style: { marginTop: "40vh" } }} />

      {/* ════════════════════════════════
          Fixed Meal Modal
      ════════════════════════════════ */}
      {showFixedModal && (
        <ModalBackdrop>
          <div className="relative w-full max-w-sm bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setShowFixedModal(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-red-400 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-amber-500/10">
                <Settings size={24} className="text-amber-400" />
              </div>
            </div>

            <h3 className="text-center text-base font-bold text-slate-100 mb-1">
              Set Fixed Meal —{" "}
              <span className="text-violet-400">{managerThisMonth}</span>
            </h3>
            <p className="text-center text-xs text-slate-400 mb-4">{currentMonth}</p>

            <div className="flex gap-2 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 mb-4">
              <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300">
                Members with meals below this value will be automatically adjusted for fair settlement.
              </p>
            </div>

            <input
              type="number"
              value={fixedMealInput}
              onChange={(e) => setFixedMealInput(Number(e.target.value))}
              placeholder="Enter fixed meal count"
              className="w-full bg-slate-950 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-violet-500 mb-4"
            />

            <div className="flex gap-2.5">
              <button
                onClick={handleSetFixedMeal}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                Save Fixed Meal
              </button>
              <button
                onClick={() => setShowFixedModal(false)}
                className="flex-1 bg-transparent border border-slate-600 text-slate-300 hover:bg-slate-700 text-sm py-2.5 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </ModalBackdrop>
      )}

      {/* ════════════════════════════════
          Confirm Save Modal
      ════════════════════════════════ */}
      {showConfirmModal && (
        <ModalBackdrop>
          <div className="relative w-full max-w-sm bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-red-400 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-emerald-500/10">
                <CheckCircle2 size={24} className="text-emerald-400" />
              </div>
            </div>

            <h3 className="text-center text-base font-bold text-slate-100 mb-1">
              Save Monthly Settlement?
            </h3>
            <p className="text-center text-xs text-slate-400 mb-4">
              {currentMonth}{managerThisMonth && ` · ${managerThisMonth}`}
            </p>

            <div className="flex gap-2 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 mb-4">
              <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300">
                This will permanently save this month's settlement.{" "}
                <span className="text-red-400 font-semibold">Cannot be undone.</span>{" "}
                Verify all values before confirming.
              </p>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => { setShowConfirmModal(false); handleSaveHistory(); }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                <Save size={13} /> Yes, Save History
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-transparent border border-slate-600 text-slate-300 hover:bg-slate-700 text-sm py-2.5 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </ModalBackdrop>
      )}

      <Header />

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-16">

        {/* ════════════════════════════════
            Page Header
        ════════════════════════════════ */}
        <div className="mb-10 pb-7 border-b border-slate-800">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <p className="text-[11px] font-bold tracking-widest text-indigo-400 uppercase mb-1.5">
                Monthly Report
              </p>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 leading-tight">
                Settlement Overview
              </h1>
              <p className="text-sm text-slate-400 mt-1.5">
                {currentMonth}
                {managerThisMonth && (
                  <span className="text-violet-400"> · {managerThisMonth}</span>
                )}
              </p>
            </div>

            <div className="flex gap-2 mt-1 flex-wrap">
              <SaveBtn compact />
              <button
                onClick={handlePrintPDF}
                className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
              >
                🖨 Print PDF
              </button>
            </div>
          </div>

          {!saveEnabled && (
            <p className="text-xs text-slate-500 mt-3">
              History saving is available from the 25th through the 2nd of the next month.
            </p>
          )}
        </div>

        {/* ════════════════════════════════
            Financial Summary
        ════════════════════════════════ */}
        <section className="mb-9">
          <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-4">
            Financial Summary
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            {/* Meal Deposits */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-medium text-slate-400">Meal Deposits</span>
                <Wallet size={15} className="text-indigo-400" />
              </div>
              <p className="text-2xl font-extrabold text-slate-100">৳{grandDeposit.toFixed(0)}</p>
              <div className="mt-3 pt-3 border-t border-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Bazar Spent</span>
                  <span className="text-xs font-semibold text-slate-300">৳{totalBazar.toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Net Balance</span>
                  <span className={`flex items-center gap-1 text-sm font-bold ${netMealBalance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {netMealBalance >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    ৳{netMealBalance.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Utility Deposits */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-medium text-slate-400">Utility Deposits</span>
                <Zap size={15} className="text-violet-400" />
              </div>
              <p className="text-2xl font-extrabold text-slate-100">৳{totalUtilityDeposit.toFixed(0)}</p>
              <div className="mt-3 pt-3 border-t border-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Utility Cost</span>
                  <span className="text-xs font-semibold text-slate-300">৳{totalUtilityCost.toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Net Balance</span>
                  <span className={`flex items-center gap-1 text-sm font-bold ${netUtilityBalance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {netUtilityBalance >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    ৳{netUtilityBalance.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Meal Statistics */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-medium text-slate-400">Meal Statistics</span>
                <Utensils size={15} className="text-emerald-400" />
              </div>
              <p className="text-2xl font-extrabold text-slate-100">৳{mealRate.toFixed(2)}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">per meal</p>
              <div className="mt-3 pt-3 border-t border-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Fixed Meal</span>
                  <span className="text-xs font-semibold text-slate-300">{fixedMeals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Total Meals</span>
                  <span className="text-xs font-semibold text-slate-300">{adjustedGrandTotalMeals}</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ════════════════════════════════
            Member Settlement
        ════════════════════════════════ */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
              Member Settlement
            </p>
            <span className="text-xs text-slate-400">{settlements.length} members</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {settlements.map((m, idx) => {
              const isDue = m.balance < 0;
              return (
                <div
                  key={idx}
                  className={`bg-slate-800 rounded-2xl overflow-hidden border-t-2
                    ${isDue
                      ? "border border-red-900/40 border-t-red-400"
                      : "border border-slate-700 border-t-emerald-400"
                    }`}
                >
                  {/* Card header: avatar + name + balance */}
                  <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-900">

                    {m.image ? (
                      <img
                        src={m.image}
                        alt={m.name}
                        className={`w-11 h-11 rounded-full object-cover shrink-0 border-2
                          ${isDue ? "border-red-400" : "border-emerald-400"}`}
                      />
                    ) : (
                      <div className={`w-11 h-11 rounded-full shrink-0 flex items-center justify-center font-extrabold text-base border-2
                        ${isDue
                          ? "bg-red-950 text-red-300 border-red-400"
                          : "bg-emerald-950 text-emerald-300 border-emerald-400"
                        }`}>
                        {m.name[0]}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-100 truncate">{m.name}</p>
                      <span className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full
                        ${isDue
                          ? "bg-red-950/60 text-red-400"
                          : "bg-emerald-950/60 text-emerald-400"
                        }`}>
                        {isDue
                          ? `Pay ৳${Math.ceil(m.balance * -1)}`
                          : `Receive ৳${Math.ceil(m.balance)}`}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <p className={`text-lg font-extrabold leading-none
                        ${isDue ? "text-red-400" : "text-emerald-400"}`}>
                        {isDue ? "-" : "+"}৳{Math.abs(Math.ceil(m.balance))}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">balance</p>
                    </div>
                  </div>

                  {/* Stats: 2-col on xs → 3-col on sm+ | 3rd pill spans full on xs */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-3">
                    <div className="flex flex-col items-center bg-slate-900 rounded-xl py-2 px-1">
                      <span className="text-[10px] text-slate-400 font-medium mb-1">Deposit</span>
                      <span className="text-xs font-bold text-slate-200">৳{m.deposit.toFixed(0)}</span>
                    </div>
                    <div className="flex flex-col items-center bg-slate-900 rounded-xl py-2 px-1">
                      <span className="text-[10px] text-slate-400 font-medium mb-1">Meals</span>
                      <span className="text-xs font-bold text-slate-200">{m.meals}</span>
                    </div>
                    <div className="flex flex-col items-center bg-slate-900 rounded-xl py-2 px-1 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-400 font-medium mb-1">Meal Cost</span>
                      <span className="text-xs font-bold text-slate-200">৳{Math.ceil(m.mealCost)}</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </section>

        {/* ════════════════════════════════
            Bottom Actions
        ════════════════════════════════ */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex justify-center gap-3 flex-wrap">
          <SaveBtn />
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            🖨 Print Report
          </button>
        </div>

        {!saveEnabled && (
          <p className="text-center text-xs text-slate-500 mt-3">
            History saving available from 25th to next month's 2nd day
          </p>
        )}

      </main>

      <Footer />
    </section>
  );
};

export default SettlementPage;