import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  Droplets,
  ShoppingCart,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Phone,
  Sparkles,
  UtensilsCrossed,
  ClipboardList,
  Search,
  Copy,
  Check,
  Flame,
  Trophy,
  CalendarClock,
  PieChart,
} from "lucide-react";
import Footer from "./Footer";
import Header from "./Header";
import useAuth from "../hooks/useAuth";
import HexaSpecialEvents from "./HexaSpecialEvents";

// Type for each deposit item
export type UtilityDeposit = {
  member: string;
  total: number;
};
interface Person {
  designation: string;
  name: string;
  mobile: string;
  photo: string;
}

interface HomeProps {
  grandDeposit: number;
  totalBazar: number;
  utilityDeposits: UtilityDeposit[];
  utilityCosts: string[][];
  notices: Notice[];
  isLoading: boolean;
  setManagerThisMonth: React.Dispatch<React.SetStateAction<string>>;
}

interface Notice {
  title: string;
  content: string;
}
interface UserItem {
  type: string;
  email: string;
  role: string;
  name: string;
  photoURL: string;
  uid: string;
  emailVerified: string;
  phoneNumber: string;
  provider: string;
  lastLoginAt: string;
}

const DATA_URL = import.meta.env.VITE_PERSONNEL_SHEET_READER;

// ===== Helpers =====
const formatBDT = (amount: number) =>
  `৳${Math.round(amount).toLocaleString("en-BD")}`;

type FundStatus = "critical" | "low" | "guarded" | "healthy";

const getFundStatus = (remaining: number): FundStatus => {
  if (remaining <= 0) return "critical";
  if (remaining < 500) return "low";
  if (remaining < 1000) return "guarded";
  return "healthy";
};

// Light-theme, contextual color tokens. Every status maps to a text color,
// a soft badge treatment, and a solid color for bars/rings.
const statusStyles: Record<
  FundStatus,
  { text: string; badge: string; ring: string; track: string; label: string }
> = {
  critical: {
    text: "text-red-600",
    badge: "text-red-700 border-red-200 bg-red-50",
    ring: "bg-red-500",
    track: "bg-red-100",
    label: "House in Deficit",
  },
  low: {
    text: "text-orange-600",
    badge: "text-orange-700 border-orange-200 bg-orange-50",
    ring: "bg-orange-500",
    track: "bg-orange-100",
    label: "Very Low Balance",
  },
  guarded: {
    text: "text-amber-600",
    badge: "text-amber-700 border-amber-200 bg-amber-50",
    ring: "bg-amber-500",
    track: "bg-amber-100",
    label: "Low Balance",
  },
  healthy: {
    text: "text-emerald-600",
    badge: "text-emerald-700 border-emerald-200 bg-emerald-50",
    ring: "bg-emerald-500",
    track: "bg-emerald-100",
    label: "Healthy Balance",
  },
};

const OverviewHexa: React.FC<HomeProps> = ({
  setManagerThisMonth,
  grandDeposit,
  totalBazar,
  utilityDeposits,
  utilityCosts,
  isLoading,
  notices,
}) => {
  const [members, setMembers] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberQuery, setMemberQuery] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { usersList, userRole } = useAuth() as {
    usersList: UserItem[];
    userRole: string;
  };

  useEffect(() => {
    fetch(DATA_URL)
      .then((res) => res.text())
      .then((text) => {
        const rows = text.split("\n").slice(1);

        const parsed = rows
          .map((row) => row.split(","))
          .filter((row) => row[1])
          .map((row) => ({
            designation: row[0]?.trim(),
            name: row[1]?.trim(),
            mobile: row[2]?.trim(),
            photo: row[3]?.trim(),
          }));

        setMembers(parsed);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const manager = usersList.find((m) => m.role === "manager");

  // Keep state updates out of the render body
  useEffect(() => {
    setManagerThisMonth(manager?.name || "N/A");
  }, [manager?.name, setManagerThisMonth]);

  // ===== Utility Deposit Calculation =====
  const grandUtilityDeposit = utilityDeposits.reduce(
    (sum, person) => sum + person.total,
    0
  );

  // ===== Utility Cost Calculation =====
  const costRows = utilityCosts.slice(1);

  const costSummary = costRows
    .filter((row) => row[0])
    .map((row) => {
      const costs = row.slice(1)?.map((v: string) => Number(v) || 0);
      const total = costs.reduce((a: number, b: number) => a + b, 0);
      return { total };
    });

  const totalCosts = costSummary.reduce((sum, item) => sum + item.total, 0);

  // ===== Total Deposit & Cost Calculations =====
  const totalDeposit = grandDeposit;
  const totalUtilityDeposit = grandUtilityDeposit;
  const totalBazarCosts = totalBazar;
  const totalUtilityCosts = totalCosts;

  const grandTotalDeposit = totalDeposit + totalUtilityDeposit;
  const grandTotalCosts = totalBazarCosts + totalUtilityCosts;
  const finalBalance = grandTotalDeposit - grandTotalCosts;

  const remainingMealCash = totalDeposit - totalBazarCosts;
  const remainingUtilityCash = totalUtilityDeposit - totalUtilityCosts;

  const mealFundStatus = getFundStatus(remainingMealCash);
  const overallStatus = getFundStatus(finalBalance);
  const isFreshHouse =
    finalBalance === 0 && totalBazar === 0 && grandDeposit === 0;

  // Meal fund "health" bar — cap the visual scale at 2000 so it doesn't
  // stretch off-screen on a very healthy month.
  const mealHealthPct = Math.max(
    0,
    Math.min(100, (remainingMealCash / 2000) * 100)
  );

  let systemNotice: { title: string; content: string } | null = null;

  const today = new Date();
  const currentDate = today.getDate();
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();
  const showNotice = currentDate >= 5 && currentDate <= 25;

  if (showNotice) {
    if (remainingMealCash <= 0) {
      systemNotice = {
        title: "🚨 জরুরি সতর্কবার্তা: মিল ফান্ড ঘাটতিতে",
        content:
          "বর্তমানে মিল ফান্ড সম্পূর্ণ শেষ হয়ে গেছে এবং ঘাটতি চলছে। এই অবস্থায় নিয়মিত বাজার ও খাবার পরিচালনা ব্যাহত হতে পারে। সকল সদস্যকে অনুরোধ করা যাচ্ছে যত দ্রুত সম্ভব মিল ডিপোজিট প্রদান করে মিল কার্যক্রম সচল রাখতে সহযোগিতা করার জন্য। অন্যথায় সাময়িকভাবে মিল কার্যক্রম বন্ধ করার প্রয়োজন হতে পারে।",
      };
    } else if (remainingMealCash < 500) {
      systemNotice = {
        title: "⚠️ সতর্কবার্তা: মিল ফান্ড সীমিত",
        content:
          "মিল ফান্ড বর্তমানে সীমিত অবস্থায় রয়েছে। আসন্ন বাজার খরচ মেটাতে সমস্যা হতে পারে। সকল সদস্যকে অনুরোধ করা হচ্ছে দ্রুত মিল ডিপোজিট প্রদান করে ফান্ডের ভারসাম্য বজায় রাখতে সহযোগিতা করার জন্য।",
      };
    }
  }

  const finalNotices = systemNotice ? [systemNotice, ...notices] : notices;

  // ===== NEW: Spending pace (burn rate) — compares how much of the month
  // has elapsed against how much of the meal fund has already been spent. =====
  const monthProgressPct = Math.min(100, (currentDate / daysInMonth) * 100);
  const fundUsedPct =
    totalDeposit > 0
      ? Math.min(100, (totalBazarCosts / totalDeposit) * 100)
      : 0;
  const burnDelta = fundUsedPct - monthProgressPct;
  const burnStatus: "critical" | "warning" | "onTrack" =
    burnDelta > 15 ? "critical" : burnDelta > 5 ? "warning" : "onTrack";
  const burnCopy: Record<typeof burnStatus, { label: string; text: string; chip: string }> = {
    critical: {
      label: "Spending faster than the month is passing",
      text: "text-red-600",
      chip: "text-red-700 border-red-200 bg-red-50",
    },
    warning: {
      label: "Slightly ahead of a steady pace",
      text: "text-amber-600",
      chip: "text-amber-700 border-amber-200 bg-amber-50",
    },
    onTrack: {
      label: "On pace for the month",
      text: "text-emerald-600",
      chip: "text-emerald-700 border-emerald-200 bg-emerald-50",
    },
  } as const;

  // ===== NEW: Cost split between bazar and utility spending =====
  const bazarSharePct =
    grandTotalCosts > 0 ? (totalBazarCosts / grandTotalCosts) * 100 : 0;
  const utilitySharePct =
    grandTotalCosts > 0 ? (totalUtilityCosts / grandTotalCosts) * 100 : 0;

  // ===== NEW: Utility contribution leaderboard =====
  const leaderboard = useMemo(() => {
    const sorted = [...utilityDeposits].sort((a, b) => b.total - a.total);
    const max = sorted.length ? sorted[0].total : 0;
    const avg = sorted.length
      ? sorted.reduce((s, p) => s + p.total, 0) / sorted.length
      : 0;
    return { sorted, max, avg };
  }, [utilityDeposits]);

  // ===== NEW: Team search/filter =====
  const filteredMembers = useMemo(() => {
    const q = memberQuery.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.designation?.toLowerCase().includes(q)
    );
  }, [members, memberQuery]);

  const handleCopy = (key: string, mobile: string) => {
    navigator.clipboard
      ?.writeText(`0${mobile}`)
      .then(() => {
        setCopiedKey(key);
        setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
      })
      .catch(() => {});
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#FAF5EB]/50 backdrop-blur-sm font-poppins px-2 text-slate-700">
        {/* ================= Hero Section ================= */}
        <section className="py-20 sm:px-6 px-0">
          <div className="max-w-6xl mx-auto text-center bg-white/80 border border-slate-200 py-12 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-amber-400 to-teal-500" />

            <img
              src="https://i.postimg.cc/nc68c9bs/hexa-haven.png"
              className="w-40 h-32 md:w-52 md:h-52 mx-auto"
              alt="Hexa Bachelors House logo"
            />
            <h1 className="text-xl md:text-4xl font-bold mb-4 text-slate-900 tracking-tight">
              The Hexa Bachelors House
            </h1>
            <p className="text-xs md:text-lg text-slate-800 max-w-3xl mx-auto mb-8">
              Manage your monthly meal expenses, bazar costs, deposits, and
              utilities with automatic calculations and real-time updates,
              all in one place.
            </p>

            <div className="flex justify-center gap-4 flex-wrap">
              <Link
                to="/dashboard"
                className="bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 px-10 py-2 rounded-lg font-medium transition text-xs md:text-sm"
              >
                Dashboard
              </Link>

              {userRole === "manager" ? (
                <Link
                  to="/manager"
                  className="border border-amber-200 text-amber-700 hover:bg-amber-50 px-10 py-2 rounded-lg font-medium transition text-xs md:text-sm"
                >
                  Manager Dashboard
                </Link>
              ) : (
                <Link
                  to="/utility"
                  className="border border-amber-200 text-amber-700 hover:bg-amber-50 px-10 py-2 rounded-lg font-medium transition text-xs md:text-sm"
                >
                  Utility
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ================= Notice Board ================= */}
        {isLoading ? (
          <div className="max-w-4xl mx-auto py-6 px-4">
            <div className="bg-white/80 border border-slate-200 p-6 rounded-xl text-center animate-pulse">
              <div className="h-3 bg-slate-100 rounded w-2/3 mx-auto mb-3" />
              <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto" />
            </div>
          </div>
        ) : (
          finalNotices.length > 0 && (
            <section className="py-6">
              <div className="max-w-6xl mx-auto">
                <div className="bg-white/80 border border-amber-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-amber-400 md:tracking-[5px] tracking-[2px] text-slate-900 text-center py-2 text-xs font-bold flex items-center justify-center gap-2">
                    <ClipboardList size={14} />
                    NOTICE BOARD
                  </div>

                  <div className="divide-y divide-slate-100 pb-4">
                    {finalNotices.map((notice, index) => {
                      const isCriticalLead =
                        index === 0 && remainingMealCash <= 0;
                      return (
                        <div
                          key={index}
                          className={`px-5 py-3 transition ${
                            isCriticalLead
                              ? "bg-red-50 mt-2 py-4 border-l-2 border-red-400"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <h3
                            className={`text-sm font-semibold mb-1 flex items-center gap-2 ${
                              isCriticalLead
                                ? "text-red-700"
                                : "text-amber-700"
                            }`}
                          >
                            {isCriticalLead && (
                              <AlertTriangle size={14} className="shrink-0" />
                            )}
                            {index + 1}. {notice.title}
                          </h3>
                          <p
                            className={`text-xs pl-4 ${
                              isCriticalLead ? "text-red-600/80" : "text-gray-800"
                            }`}
                          >
                            {notice.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="py-4 flex justify-center">
                    <Link
                      to="/postnotice"
                      className="text-xs py-2 px-6 border border-amber-200 bg-amber-50 hover:bg-amber-100 font-bold text-amber-700 tracking-[1px] rounded-full transition"
                    >
                      Post An Issue
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )
        )}

        {/* ================= Summary Section ================= */}
        <section className="py-10">
          {isLoading ? (
            <div className="max-w-6xl mx-auto grid md:grid-cols-4 grid-cols-2 gap-3 md:gap-6 animate-pulse">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="bg-white/80 border border-slate-200 p-6 rounded-xl text-center"
                >
                  <div className="h-3 bg-slate-100 rounded w-2/3 mx-auto mb-3" />
                  <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto" />
                </div>
              ))}
              <div className="bg-white/80 border border-slate-200 rounded-xl col-span-2 md:col-span-4 p-6">
                {[1, 2, 3].map((row) => (
                  <div
                    key={row}
                    className="flex justify-between items-center mb-4"
                  >
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/4" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-lg md:text-2xl font-bold text-center mb-1 text-slate-900">
                House Financial Overview
              </h2>
              <p className="text-center text-xs text-gray-700 mb-8">
                Updated automatically as meals, bazar and utility entries come in
              </p>

              <div className="max-w-6xl mx-auto grid md:grid-cols-4 grid-cols-2 gap-3 md:gap-6 mb-6">
                <StatCard
                  icon={<UtensilsCrossed size={18} />}
                  label="Meal Deposit"
                  value={formatBDT(totalDeposit)}
                  tone="positive"
                />
                <StatCard
                  icon={<Droplets size={18} />}
                  label="Utility Deposit"
                  value={formatBDT(totalUtilityDeposit)}
                  tone="positive"
                />
                <StatCard
                  icon={<ShoppingCart size={18} />}
                  label="Bazar Costs"
                  value={formatBDT(totalBazarCosts)}
                  tone="negative"
                />
                <StatCard
                  icon={<Zap size={18} />}
                  label="Utility Costs"
                  value={formatBDT(totalUtilityCosts)}
                  tone="negative"
                />
              </div>

              {/* Meal Fund Health + Spending Pace */}
              <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-3 md:gap-6 mb-6">
                <div className="bg-white/80 border border-slate-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-800 flex items-center gap-2">
                      <Wallet size={14} />
                      Meal Fund Health
                    </span>
                    <span
                      className={`text-xs font-bold ${statusStyles[mealFundStatus].text}`}
                    >
                      {formatBDT(remainingMealCash)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${statusStyles[mealFundStatus].ring}`}
                      style={{ width: `${mealHealthPct}%` }}
                    />
                  </div>
                </div>

                {/* NEW: Spending Pace card */}
                <div className="bg-white/80 border border-slate-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-800 flex items-center gap-2">
                      <CalendarClock size={14} />
                      Spending Pace
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${burnCopy[burnStatus].chip}`}
                    >
                      {burnStatus === "critical" && (
                        <Flame size={10} className="inline mr-1 -mt-0.5" />
                      )}
                      {burnCopy[burnStatus].label}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-800 mb-1">
                        <span>Month elapsed</span>
                        <span>
                          Day {currentDate} of {daysInMonth}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-sky-400"
                          style={{ width: `${monthProgressPct}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-800 mb-1">
                        <span>Meal fund used</span>
                        <span className={burnCopy[burnStatus].text}>
                          {fundUsedPct.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            burnStatus === "critical"
                              ? "bg-red-500"
                              : burnStatus === "warning"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${fundUsedPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* NEW: Cost Split */}
              <div className="max-w-6xl mx-auto mb-6">
                <div className="bg-white/80 border border-slate-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-800 flex items-center gap-2">
                      <PieChart size={14} />
                      Where The Money Went
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {formatBDT(grandTotalCosts)}
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${bazarSharePct}%` }}
                      title={`Bazar: ${bazarSharePct.toFixed(0)}%`}
                    />
                    <div
                      className="h-full bg-sky-400"
                      style={{ width: `${utilitySharePct}%` }}
                      title={`Utility: ${utilitySharePct.toFixed(0)}%`}
                    />
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-[11px]">
                    <span className="flex items-center gap-1.5 text-gray-800">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                      Bazar — {formatBDT(totalBazarCosts)} ({bazarSharePct.toFixed(0)}%)
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-800">
                      <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
                      Utility — {formatBDT(totalUtilityCosts)} ({utilitySharePct.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Ledger Summary Table */}
              <div className="max-w-6xl mx-auto mb-6">
                <div className="p-6 bg-white/80 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-500" />
                      Summary Ledger
                    </h3>
                    <span
                      className={`text-[11px] px-3 py-1 rounded-full border font-semibold ${statusStyles[overallStatus].badge}`}
                    >
                      {isFreshHouse ? "Let's Start!" : statusStyles[overallStatus].label}
                    </span>
                  </div>

                  <table className="w-full text-sm border-collapse">
                    <tbody>
                      <LedgerRow
                        label="Total Deposit"
                        value={formatBDT(grandTotalDeposit)}
                        icon={<TrendingUp size={14} />}
                        tone="positive"
                      />
                      <LedgerRow
                        label="Total Costs"
                        value={formatBDT(grandTotalCosts)}
                        icon={<TrendingDown size={14} />}
                        tone="negative"
                      />
                      <LedgerRow
                        label="Remaining Meal Cash"
                        value={formatBDT(remainingMealCash)}
                        tone={remainingMealCash <= 0 ? "negative" : "positive"}
                      />
                      <LedgerRow
                        label="Remaining Utility Cash"
                        value={formatBDT(remainingUtilityCash)}
                        tone={remainingUtilityCash <= 0 ? "negative" : "positive"}
                      />
                      <LedgerRow
                        label="Remaining Cash"
                        value={formatBDT(finalBalance)}
                        tone={finalBalance < 1 ? "negative" : "neutral"}
                        emphasized
                      />
                    </tbody>
                  </table>
                </div>
              </div>

              {/* NEW: Utility Contribution Leaderboard */}
              {leaderboard.sorted.length > 0 && (
                <div className="max-w-6xl mx-auto">
                  <div className="p-6 bg-white/80 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                        <Trophy size={16} className="text-amber-500" />
                        Utility Contribution Leaderboard
                      </h3>
                      <span className="text-[11px] text-gray-800">
                        Avg {formatBDT(leaderboard.avg)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {leaderboard.sorted.map((person, idx) => {
                        const pct = leaderboard.max
                          ? (person.total / leaderboard.max) * 100
                          : 0;
                        const belowAverage =
                          leaderboard.avg > 0 &&
                          person.total < leaderboard.avg * 0.7;
                        return (
                          <div key={person.member}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-800 flex items-center gap-1.5">
                                {idx === 0 && (
                                  <Trophy
                                    size={12}
                                    className="text-amber-500"
                                  />
                                )}
                                {person.member}
                              </span>
                              <span
                                className={`text-xs font-semibold ${
                                  belowAverage
                                    ? "text-amber-600"
                                    : "text-emerald-600"
                                }`}
                              >
                                {formatBDT(person.total)}
                                {belowAverage && (
                                  <span className="ml-2 text-[10px] font-normal text-amber-500">
                                    below average
                                  </span>
                                )}
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  idx === 0
                                    ? "bg-amber-400"
                                    : belowAverage
                                    ? "bg-amber-300"
                                    : "bg-emerald-400"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* ================= House Management Section ================= */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="lg:text-2xl text-xl font-bold text-center mb-10 text-slate-900 flex items-center justify-center gap-2">
              <Users size={20} className="text-teal-500" />
              House Management Team
            </h2>

            {loading ? (
              <div className="text-center text-gray-800 text-sm">
                Loading team...
              </div>
            ) : (
              <>
                {manager && (
                  <div className="mb-12">
                    <div className="max-w-3xl mx-auto relative overflow-hidden rounded-3xl shadow-sm border border-slate-200 bg-gradient-to-br from-teal-50/60 via-white to-white text-slate-900 p-10">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-amber-400 to-teal-500" />

                      <div className="flex flex-col items-center justify-center text-center gap-4">
                        <img
                          src={manager?.photoURL}
                          className="w-20 h-20 sm:w-28 sm:h-28 rounded-full object-cover ring-2 ring-teal-200 mb-2"
                          alt={manager?.name}
                        />
                        <span className="inline-block text-xs font-semibold tracking-widest uppercase bg-teal-50 border border-teal-200 text-teal-700 px-8 py-1 rounded-full mb-1">
                          {manager?.role}
                        </span>

                        <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-1 text-slate-900">
                          {manager.name}
                        </h3>

                        <p className="text-gray-800 text-sm max-w-md text-center">
                          Responsible for managing monthly meals, expenses, and
                          overall coordination of The Hexa Haven operations.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* NEW: search/filter for the team list */}
                <div className="max-w-md mx-auto mb-8 relative">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800"
                  />
                  <input
                    type="text"
                    value={memberQuery}
                    onChange={(e) => setMemberQuery(e.target.value)}
                    placeholder="Search team by name or role..."
                    className="w-full text-xs md:text-sm bg-white/80 border border-slate-200 rounded-full pl-9 pr-4 py-2.5 text-slate-700 placeholder:text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300 transition"
                  />
                </div>

                {filteredMembers.length === 0 ? (
                  <p className="text-center text-gray-800 text-sm">
                    No team members match “{memberQuery}”.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {!memberQuery && (
                      <div className="col-span-full text-center text-teal-600 italic text-sm py-2 bg-teal-50/60 border border-slate-200 rounded-xl">
                        Essential Members
                      </div>
                    )}
                    {filteredMembers.map((person, index) => {
                      const key = `${person.name}-${index}`;
                      return (
                        <React.Fragment key={key}>
                          {!memberQuery && index === 6 && (
                            <div className="col-span-full text-center text-teal-600 italic text-sm py-2 bg-teal-50/60 border border-slate-200 rounded-xl">
                              Essential Service Providers
                            </div>
                          )}

                          <div className="bg-white/80 p-6 rounded-xl hover:shadow-md hover:border-teal-200 transition text-center border border-slate-200">
                            <h4 className="text-xs text-teal-600 font-semibold uppercase mb-2">
                              {person.designation}
                            </h4>
                            <p className="text-sm font-bold text-slate-800 mb-1">
                              {person.name}
                            </p>
                            {person.mobile && (
                              <div className="mt-2 flex items-center justify-center gap-2 text-gray-800 text-xs font-mono tracking-wider">
                                <a
                                  href={`tel:+880${person.mobile}`}
                                  className="flex items-center gap-1 hover:text-teal-600 transition"
                                >
                                  <Phone size={11} />
                                  0{person.mobile}
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(key, person.mobile)}
                                  className="text-gray-800 hover:text-teal-600 transition"
                                  aria-label="Copy phone number"
                                >
                                  {copiedKey === key ? (
                                    <Check size={12} className="text-emerald-500" />
                                  ) : (
                                    <Copy size={12} />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <HexaSpecialEvents eventLimit={4} />

        {/* ================= Features Section ================= */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8 text-slate-900">
              Core Features
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              <FeatureCard
                icon={<UtensilsCrossed size={20} />}
                title="Meal Tracking"
                description="Add daily meal counts for each member and automatically calculate total meals and cost per meal."
              />
              <FeatureCard
                icon={<ShoppingCart size={20} />}
                title="Bazar & Utility Costs"
                description="Track grocery purchases and monthly utility bills with proper calculation and reporting."
              />
              <FeatureCard
                icon={<Wallet size={20} />}
                title="Deposit & Balance"
                description="Manage deposits and automatically calculate due or advance balances for each member."
              />
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default OverviewHexa;

/* ---------------- Components ---------------- */

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "positive" | "negative";
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, tone }) => (
  <div className="bg-white/80 border border-slate-200 p-5 rounded-xl text-center hover:border-slate-300 hover:shadow-sm transition">
    <div
      className={`w-9 h-9 mx-auto mb-3 rounded-lg flex items-center justify-center ${
        tone === "positive"
          ? "bg-emerald-50 text-emerald-600"
          : "bg-amber-50 text-amber-600"
      }`}
    >
      {icon}
    </div>
    <h4 className="text-[11px] font-semibold mb-1 text-gray-800 uppercase tracking-wide">
      {label}
    </h4>
    <p
      className={`text-sm font-bold ${
        tone === "positive" ? "text-emerald-600" : "text-amber-600"
      }`}
    >
      {value}
    </p>
  </div>
);

interface LedgerRowProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tone: "positive" | "negative" | "neutral";
  emphasized?: boolean;
}

const LedgerRow: React.FC<LedgerRowProps> = ({
  label,
  value,
  icon,
  tone,
  emphasized,
}) => {
  const toneClass =
    tone === "positive"
      ? "text-emerald-600"
      : tone === "negative"
      ? "text-red-600"
      : "text-sky-600";

  return (
    <tr className="hover:bg-slate-50 transition-all rounded-lg">
      <td
        className={`p-3 font-semibold ${
          emphasized ? "text-slate-900 text-sm" : "text-gray-800 text-xs"
        } flex items-center gap-2`}
      >
        {icon}
        {label}
      </td>
      <td
        className={`p-3 font-bold text-right ${toneClass} ${
          emphasized ? "text-base" : "text-sm"
        }`}
      >
        {value}
      </td>
    </tr>
  );
};

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureProps> = ({ icon, title, description }) => (
  <div className="bg-white/80 border border-slate-200 p-6 rounded-xl hover:shadow-md hover:border-amber-200 transition">
    <div className="w-9 h-9 mb-3 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
    <p className="text-gray-800 text-sm">{description}</p>
  </div>
);