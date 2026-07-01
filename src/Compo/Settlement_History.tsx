/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { ChevronDown, FileText, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface MemberSettlement {
  name: string;
  deposit: number;
  meals: number;
  mealCost: number;
  balance: number;
  status?: string;
  utility: number;
}

interface MonthHistory {
  month: string;
  savedAt: string;
  summary: {
    totalDeposit: number;
    totalBazar: number;
    netMealBalance: number;
    utilityDeposit: number;
    utilityCost: number;
    netUtilityBalance: number;
  };
  mealSummary: {
    fixedMeal: number;
    totalMeal: number;
    mealRate: number;
  };
  members: MemberSettlement[];
}

/* ---------- Ledger helpers ---------- */

// Animates a number counting up from 0 to target on mount
const useCountUp = (target: number, duration = 850) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let frame: number;

    const step = (ts: number) => {
      if (startTime === null) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
};

const Figure: React.FC<{
  value: number;
  prefix?: string;
  decimals?: number;
}> = ({ value, prefix = "৳  ", decimals = 0 }) => {
  const animated = useCountUp(value);
  return (
    <span className="ledger-figure">
      {prefix}
      {decimals > 0 ? animated.toFixed(decimals) : Math.round(animated).toLocaleString()}
    </span>
  );
};

const TrendBadge = ({ change }: { change: number | null }) => {
  if (change === null) return null;
  const isUp = change > 0;
  const isFlat = Math.abs(change) < 0.5;
  return (
    <span className={`ledger-trend ${isFlat ? "trend-flat" : isUp ? "trend-up" : "trend-down"}`}>
      {isFlat ? "steady" : `${isUp ? "▲" : "▼"} ${Math.abs(change).toFixed(1)}%`}
    </span>
  );
};

const StampBadge: React.FC<{ balance: number; status?: string }> = ({ balance, status }) => {
  const settled = balance >= 0;
  const label = status || (settled ? "Settled" : "Due");
  return (
    <span className={`ledger-stamp ${settled ? "stamp-settled" : "stamp-due"}`}>
      {label}
    </span>
  );
};

// Small label/value pair used in the mobile member cards
const MemberStat: React.FC<{ label: string; value: string; tone?: "default" | "due" | "surplus" }> = ({
  label,
  value,
  tone = "default",
}) => (
  <div>
    <p className="ledger-stat-label">{label}</p>
    <p
      className="ledger-figure text-sm"
      style={{ color: tone === "due" ? "var(--due)" : tone === "surplus" ? "var(--surplus)" : "var(--ink)" }}
    >
      {value}
    </p>
  </div>
);

/* ---------- Custom header for the History page ---------- */
// Home link + a month dropdown that reads straight off the `history` state,
// so it automatically picks up any new month the moment it's fetched — no
// separate list to keep in sync.
const HistoryHeader: React.FC<{
  history: MonthHistory[];
  onSelectMonth: (idx: number) => void;
}> = ({ history, onSelectMonth }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const monthLabel = (h: MonthHistory) => h?.month.replace(/,+$/g, "")?.trim().split("|")[0]?.trim();

  return (
    <header
      className="fixed top-0 left-0 w-full h-16 z-[50] flex items-center justify-between px-4 lg:px-8"
      style={{ background: "var(--paper, #FBF7EE)", borderBottom: "1px solid var(--rule, #D8CDB4)" }}
    >
      <Link
        to="/"
        className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
        style={{ color: "var(--ink, #2A2118)" }}
      >
        <Home className="w-4 h-4" style={{ color: "var(--amber, #C2772E)" }} />
        Home
      </Link>

      <p
        className="ledger-display hidden sm:block text-sm tracking-wide"
        style={{ color: "var(--ink-soft, #6B5D4F)" }}
      >
        Settlement Ledger
      </p>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full transition-colors hover:opacity-80"
          style={{ background: "var(--paper-line, #F2EAD8)", color: "var(--ink, #2A2118)" }}
        >
          {history.length > 0 ? monthLabel(history[0]) : "Months"}
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div
            className="absolute right-0 mt-2 w-56 max-h-72 overflow-y-auto rounded-lg shadow-lg py-1 z-[60]"
            style={{ background: "var(--paper, #FBF7EE)", border: "1px solid var(--rule, #D8CDB4)" }}
          >
            {history.length === 0 && (
              <p className="px-4 py-2 text-xs" style={{ color: "var(--ink-soft, #6B5D4F)" }}>
                No months yet
              </p>
            )}
            {history.map((h, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectMonth(idx);
                  setOpen(false);
                }}
                className="w-full text-left text-sm px-4 py-2 transition-colors hover:opacity-80"
                style={{ color: "var(--ink, #2A2118)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--paper-line, #F2EAD8)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {monthLabel(h)}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

const History: React.FC = () => {
  const [history, setHistory] = useState<MonthHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const history_sheet_reader = import.meta.env.VITE_HISTORY_SHEET_READER;

  // Parse one block of data
  const parseSettlementBlock = (block: string): MonthHistory => {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const monthLine = lines[0].replace("Settlement History —", "").trim();
    const savedAtLine = lines.find((l) => l.startsWith("Saved At:"));
    const savedAt = savedAtLine?.replace("Saved At:", "").trim() || "";

    // SUMMARY
    const summaryIndex = lines.findIndex((l) => l === "SUMMARY");
    const summaryDataLine = lines[summaryIndex + 6];
    const [totalDeposit, totalBazar, netMealBalance, utilityDeposit, utilityCost, netUtilityBalance] =
      summaryDataLine.split(",").map((v) => Number(v.trim()));

    // MEAL SUMMARY
    const mealIndex = lines.findIndex((l) => l === "MEAL SUMMARY");
    const mealDataLine = lines[mealIndex + 10];
    const [fixedMeal, totalMeal, mealRate] = mealDataLine.split(",").map((v) => Number(v.trim()));

    // MEMBER SETTLEMENT
    const memberIndex = lines.findIndex((l) => l === "MEMBER SETTLEMENT");
    const memberLines = lines.slice(memberIndex + 14); // skip header line

    const members: MemberSettlement[] = memberLines.map((line) => {
      const parts = line.split(",").map((v) => v.trim()); // split CSV
      const [name, deposit, meals, mealCost, balance, status, utility] = parts;

      return {
        name,
        deposit: Number(deposit),
        meals: Number(meals),
        mealCost: Number(mealCost),
        balance: Number(balance),
        status: status || undefined, // handle empty status
        utility: Number(utility) || 0, // handle empty utility
      };
    });

    return {
      month: monthLine,
      savedAt,
      summary: {
        totalDeposit,
        totalBazar,
        netMealBalance,
        utilityDeposit,
        utilityCost,
        netUtilityBalance,
      },
      mealSummary: {
        fixedMeal,
        totalMeal,
        mealRate,
      },
      members,
    };
  };

  // Parse multiple blocks from the sheet
  const parseSettlementData = (text: string): MonthHistory[] => {
    const blocks = text.split(/Settlement History —/).slice(1);
    const history = blocks.map((b) => parseSettlementBlock("Settlement History —" + b));
    return history.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await fetch(history_sheet_reader);
        if (!res.ok) throw new Error("Failed to fetch history");
        const text = await res.text();
        const parsedHistory = parseSettlementData(text);
        setHistory(parsedHistory);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong");
        toast.error(err.message || "Failed to load history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  /* ---------- Shared ledger styles ---------- */
  const LedgerStyles = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

      .hex-ledger {
        --paper: #FBF7EE;
        --paper-line: #F2EAD8;
        --page-bg: #EFE8D6;
        --ink: #2A2118;
        --ink-soft: #6B5D4F;
        --amber: #C2772E;
        --amber-deep: #9C5A1E;
        --teal: #0F6B64;
        --teal-tint: #E3F0EE;
        --due: #A3342B;
        --due-tint: #F6E7E5;
        --surplus: #3F7D4A;
        --surplus-tint: #E7F0E5;
        --rule: #D8CDB4;
        font-family: 'Poppins', sans-serif;
        color: var(--ink);
        background-color: var(--page-bg);
        background-image: repeating-linear-gradient(
          to bottom,
          transparent,
          transparent 27px,
          rgba(42,33,24,0.035) 28px
        );
        min-height: 100vh;
      }

      .ledger-display {
        font-family: 'Poppins', sans-serif;
        font-weight: 700;
      }

      .ledger-figure {
        font-family: 'Poppins', sans-serif;
        font-variant-numeric: tabular-nums;
        font-weight: 600;
      }

      .ledger-stat-label {
        font-family: 'Poppins', sans-serif;
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--ink-soft);
        margin-bottom: 2px;
      }

      .ledger-card {
        position: relative;
        background: var(--paper);
        border: 1px solid var(--rule);
        box-shadow: 0 1px 0 var(--rule), 0 8px 20px -12px rgba(42,33,24,0.25);
      }

      .ledger-perforation {
        position: relative;
        height: 14px;
        background-image: radial-gradient(circle at 8px 7px, var(--page-bg) 6px, transparent 6.5px);
        background-size: 16px 16px;
        background-repeat: repeat-x;
        background-position: top;
        margin-top: -1px;
      }

      .ledger-stamp {
        display: inline-flex;
        align-items: center;
        font-family: 'Poppins', sans-serif;
        font-weight: 600;
        font-size: 11px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        padding: 2px 10px;
        border-radius: 999px;
        border: 1.5px solid currentColor;
        transform: rotate(-2deg);
        animation: stampLand 420ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      .stamp-settled { color: var(--teal); background: var(--teal-tint); }
      .stamp-due { color: var(--due); background: var(--due-tint); transform: rotate(2deg); }

      .ledger-trend {
        margin-left: 8px;
        font-family: 'Poppins', sans-serif;
        font-size: 10.5px;
        font-weight: 500;
        padding: 1px 6px;
        border-radius: 4px;
      }
      .trend-up { color: var(--due); background: var(--due-tint); }
      .trend-down { color: var(--surplus); background: var(--surplus-tint); }
      .trend-flat { color: var(--ink-soft); background: var(--paper-line); }

      .ledger-entry {
        animation: entryRise 480ms ease-out both;
      }

      .leader-row {
        display: flex;
        align-items: baseline;
        gap: 6px;
      }
      .leader-dots {
        flex: 1;
        border-bottom: 1.5px dotted var(--rule);
        height: 0;
        margin-bottom: 4px;
      }

      .ledger-row-stripe:nth-child(even) {
        background: var(--paper-line);
      }

      .ledger-member-card {
        background: var(--paper);
        border: 1px solid var(--rule);
        border-radius: 10px;
      }

      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

      .nav-pill-active {
        background: var(--amber) !important;
        color: #fff !important;
      }

      @keyframes stampLand {
        0% { opacity: 0; transform: scale(1.6) rotate(-10deg); }
        60% { opacity: 1; }
        100% { opacity: 1; transform: scale(1) rotate(-2deg); }
      }

      @keyframes entryRise {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @media (prefers-reduced-motion: reduce) {
        .ledger-stamp, .ledger-entry { animation: none; }
      }
    `}</style>
  );

  if (loading)
    return (
      <>
        <HistoryHeader history={[]} onSelectMonth={() => {}} />
        <div className="hex-ledger flex flex-col items-center justify-center py-20 pt-32 w-full mx-auto min-h-screen">
          <LedgerStyles />
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-[3px] border-[#C2772E] border-dashed rounded-full animate-spin mb-4"></div>
            <p className="ledger-display text-lg" style={{ color: "var(--ink)" }}>Opening the ledger…</p>
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>Tallying past settlements.</p>
          </div>
        </div>
      </>
    );

  if (error)
    return (
      <>
        <HistoryHeader history={[]} onSelectMonth={() => {}} />
        <div className="hex-ledger flex flex-col items-center justify-center py-20 pt-32 w-full mx-auto min-h-screen">
          <LedgerStyles />
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="ledger-stamp stamp-due mb-4" style={{ fontSize: 13, transform: "rotate(-4deg)" }}>
              Entry failed
            </div>
            <p className="ledger-display text-lg mb-1" style={{ color: "var(--due)" }}>The ledger wouldn't open.</p>
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>{error}</p>
          </div>
        </div>
      </>
    );

  if (!history.length)
    return (
      <>
        <HistoryHeader history={[]} onSelectMonth={() => {}} />
        <div className="hex-ledger flex flex-col items-center justify-center py-20 pt-32 w-full mx-auto min-h-screen">
          <LedgerStyles />
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="ledger-stamp stamp-due mb-4" style={{ borderColor: "var(--amber)", color: "var(--amber-deep)", background: "var(--paper-line)" }}>
              Blank page
            </div>
            <p className="ledger-display text-lg mb-1">No entries yet</p>
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>The ledger has no settlement history on record.</p>
          </div>
        </div>
      </>
    );

  const lastMonth = history[0];

  // Analytical calculations
  const totalMembers = lastMonth?.members?.length;
  const positiveBalance = lastMonth?.members?.filter((m) => m.balance > 0)?.length;
  const negativeBalance = lastMonth?.members?.filter((m) => m.balance < 0)?.length;
  const absentMembers = lastMonth?.members?.filter((m) => m.balance === 0)?.length;
  const averageMealRate = lastMonth?.mealSummary?.mealRate?.toFixed(2);
  const totalMeal = lastMonth?.mealSummary?.totalMeal;
  const fixedMeal = lastMonth?.mealSummary?.fixedMeal;
  const lessMealPaidMembers = lastMonth?.members?.filter((m) => m.meals < fixedMeal);

  // Previous month for trend comparison
  const prevMonth = history[1];

  const pctChange = (current: number, prev?: number) => {
    if (prev === undefined || prev === 0) return null;
    return ((current - prev) / Math.abs(prev)) * 100;
  };

  const depositChange = pctChange(lastMonth.summary.totalDeposit, prevMonth?.summary.totalDeposit);
  const bazarChange = pctChange(lastMonth.summary.totalBazar, prevMonth?.summary.totalBazar);
  const mealRateChange = pctChange(lastMonth.mealSummary.mealRate, prevMonth?.mealSummary.mealRate);

  // Top performers
  const sortedByBalance = [...(lastMonth?.members ?? [])].sort((a, b) => b.balance - a.balance);
  const topReceiver = sortedByBalance[0];
  const topPayer = sortedByBalance[sortedByBalance.length - 1];

  const sortedByMeals = [...(lastMonth?.members ?? [])].sort((a, b) => b.meals - a.meals);
  const topMealConsumer = sortedByMeals[0];

  const scrollToEntry = (idx: number) => {
    document.getElementById(`history-${idx}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <HistoryHeader history={history} onSelectMonth={scrollToEntry} />
      <div className="hex-ledger p-2 pt-20 w-full mx-auto">
        <LedgerStyles />
        <div className="max-w-5xl mx-auto">
          {/* ===== DOCKET / HERO ===== */}
          <div className="ledger-card rounded-lg overflow-hidden mb-8">
            <div className="ledger-perforation" />
            <div className="p-2 lg:p-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 gap-2">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] mb-1" style={{ color: "var(--amber-deep)" }}>
                    Hex Bachelor House · Settlement Docket
                  </p>
                  <h2 className="ledger-display text-2xl lg:text-3xl mt-4">
                    Report: {lastMonth.month.replace(/,+$/g, "").trim().split("|")[0]?.trim()}
                  </h2>
                  <p className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>
                    Stamped{" "}
                    {new Date(lastMonth.savedAt.replace(/,+$/g, "").trim()).toLocaleString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {prevMonth && (
                  <span
                    className="text-[11px] px-2 py-1 rounded self-start"
                    style={{ background: "var(--paper-line)", color: "var(--ink-soft)" }}
                  >
                    Measured against {prevMonth.month.replace(/,+$/g, "").trim().split("|")[0]?.trim()}
                  </span>
                )}
              </div>

              {/* Ledger columns */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px mb-6 rounded-md overflow-hidden" style={{ background: "var(--rule)" }}>
                <div className="p-3" style={{ background: "var(--paper)" }}>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--ink-soft)" }}>Total Deposit</p>
                  <p className="text-lg" style={{ color: "var(--ink)" }}>
                    <Figure value={lastMonth.summary.totalDeposit} />
                    <TrendBadge change={depositChange} />
                  </p>
                </div>

                <div className="p-3" style={{ background: "var(--paper)" }}>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--ink-soft)" }}>Total Bazar</p>
                  <p className="text-lg" style={{ color: "var(--amber-deep)" }}>
                    <Figure value={lastMonth.summary.totalBazar} />
                    <TrendBadge change={bazarChange} />
                  </p>
                </div>

                <div className="p-3" style={{ background: "var(--paper)" }}>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--ink-soft)" }}>Meal Rate</p>
                  <p className="text-lg" style={{ color: "var(--teal)" }}>
                    <Figure value={lastMonth.mealSummary.mealRate} decimals={2} />
                    <TrendBadge change={mealRateChange} />
                  </p>
                </div>

                <div className="p-3" style={{ background: "var(--paper)" }}>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: lastMonth.summary.netMealBalance < 0 ? "var(--due)" : "var(--surplus)" }}>
                    Net Meal Balance
                  </p>
                  <p className="text-lg" style={{ color: lastMonth.summary.netMealBalance < 0 ? "var(--due)" : "var(--surplus)" }}>
                    <Figure value={lastMonth.summary.netMealBalance} />
                  </p>
                </div>
              </div>

              {/* Highlight stamps */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {topMealConsumer && (
                  <div className="leader-row p-3 rounded border" style={{ borderColor: "var(--rule)" }}>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: "var(--ink-soft)" }}>Most Meals</p>
                      <p className="text-sm font-medium">{topMealConsumer.name}</p>
                    </div>
                    <div className="leader-dots" />
                    <span className="ledger-figure text-sm" style={{ color: "var(--teal)" }}>{topMealConsumer.meals}</span>
                  </div>
                )}
                {topReceiver && topReceiver.balance > 0 && (
                  <div className="leader-row p-3 rounded border" style={{ borderColor: "var(--rule)" }}>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: "var(--ink-soft)" }}>Highest Surplus</p>
                      <p className="text-sm font-medium">{topReceiver.name}</p>
                    </div>
                    <div className="leader-dots" />
                    <span className="ledger-figure text-sm" style={{ color: "var(--surplus)" }}>+৳ {topReceiver.balance.toFixed(2)}</span>
                  </div>
                )}
                {topPayer && topPayer.balance < 0 && (
                  <div className="leader-row p-3 rounded border" style={{ borderColor: "var(--rule)" }}>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: "var(--ink-soft)" }}>Largest Due</p>
                      <p className="text-sm font-medium">{topPayer.name}</p>
                    </div>
                    <div className="leader-dots" />
                    <span className="ledger-figure text-sm" style={{ color: "var(--due)" }}>৳ {topPayer.balance.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Narrative report accordion */}
              <div className="rounded overflow-hidden" style={{ border: "1px solid var(--paper-line)" }}>
                <button
                  onClick={() => setShowReport((prev) => !prev)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-semibold transition-colors hover:opacity-80"
                  style={{ background: "var(--paper-line)", color: "var(--ink)" }}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" style={{ color: "var(--amber)" }} />
                    See Report
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${showReport ? "rotate-180" : ""}`}
                  />
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    showReport ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-4" style={{ background: "var(--paper-line)", borderLeft: "3px solid var(--amber)" }}>
                    <p className="text-sm leading-relaxed text-justify" style={{ color: "var(--ink)" }}>
                      This past month,{" "}
                      <span className="font-semibold">{totalMembers - absentMembers}</span> members
                      stayed active on the meal roster,{" "}
                      {absentMembers > 0 ? (
                        <>while <span className="font-semibold">{absentMembers}</span> member(s) sat this one out.</>
                      ) : (
                        "and nobody sat this one out."
                      )}{" "}
                      Of those who took part,{" "}
                      <span className="font-semibold" style={{ color: "var(--surplus)" }}>{positiveBalance}</span> closed
                      the month in the green, while{" "}
                      <span className="font-semibold" style={{ color: "var(--due)" }}>{negativeBalance}</span> still have
                      dues left to clear. Meals averaged out to{" "}
                      <span className="font-semibold" style={{ color: "var(--amber-deep)" }}>{averageMealRate}</span> each,
                      drawn from <span className="font-semibold">{totalMeal}</span> meals served
                      {fixedMeal > 0 && (
                        <> against a target of <span className="font-semibold">{fixedMeal}</span> per member</>
                      )}
                      {mealRateChange !== null && Math.abs(mealRateChange) >= 0.5 && (
                        <>
                          {" "}— {mealRateChange > 0 ? "up" : "down"}{" "}
                          <span className="font-semibold">{Math.abs(mealRateChange).toFixed(1)}%</span> from last month
                        </>
                      )}
                      .{" "}
                      {lessMealPaidMembers.length > 0 && (
                        <>
                          A few members —{" "}
                          <span className="font-semibold" style={{ color: "var(--amber-deep)" }}>
                            {lessMealPaidMembers.length}
                          </span>{" "}
                          in total — ate fewer meals than their fixed share, so the usual penalty was worked into
                          their settlements.{" "}
                        </>
                      )}
                      {topReceiver && topPayer && (
                        <>
                          <span className="font-semibold">{topReceiver.name}</span> came out on top with the
                          biggest surplus this month, while{" "}
                          <span className="font-semibold">{topPayer.name}</span> is left carrying the largest due.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== PAST ENTRIES ===== */}
          <h2 className="ledger-display text-xl lg:text-3xl mb-4 p-4 bg-black text-white rounded">
            Monthly Settlement History
          </h2>

          {history.map((h, idx) => (
            <div
              key={idx}
              id={`history-${idx}`}
              className="ledger-entry ledger-card rounded-lg p-2 lg:p-4 mb-6 scroll-mt-20"
              style={{ animationDelay: `${Math.min(idx, 6) * 70}ms` }}
            >
              {/* Sticky per-entry header — direct child of the full card, so it has
                  the whole card's height available to stay pinned while this
                  section scrolls through view */}
              <div
                className="sticky top-16 z-[30] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2 px-2 -mx-2 lg:-mx-4 mb-4"
                style={{ background: "var(--paper)", borderBottom: "1px solid var(--rule)" }}
              >
                <div>
                  <h3 className="ledger-display text-lg">
                    {h?.month.replace(/,+$/g, "")?.trim().split("|")[0]?.trim()}
                  </h3>
                  <p className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
                    Archived{" "}
                    {new Date(h.savedAt.replace(/,+$/g, "").trim()).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <h4 className="text-sm font-medium" style={{ color: "var(--teal)" }}>
                  Managed by: {h?.month?.replace(/,+$/g, "")?.split("|")[2] || "Not Assigned"}
                </h4>
              </div>

              {/* SUMMARY */}
              <div className="mt-8 relative rounded-lg p-4 pt-6" style={{ border: "1px solid var(--rule)" }}>
                <span
                  className="absolute -top-3 left-4 rounded px-2.5 py-0.5 text-[10px] uppercase tracking-wide ledger-display"
                  style={{ background: "var(--teal)", color: "#fff" }}
                >
                  Deposits &amp; Costs
                </span>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-px text-xs rounded overflow-hidden" style={{ background: "var(--rule)" }}>
                  <div className="p-2" style={{ background: "var(--paper)" }}>Total Deposit <span className="ledger-figure block">৳ {h.summary.totalDeposit}</span></div>
                  <div className="p-2" style={{ background: "var(--paper)" }}>Total Bazar <span className="ledger-figure block">৳ {h.summary.totalBazar}</span></div>
                  <div className="p-2" style={{ background: "var(--paper)" }}>Net Meal Balance <span className="ledger-figure block">৳ {h.summary.netMealBalance}</span></div>
                  <div className="p-2" style={{ background: "var(--paper)" }}>Utility Deposit <span className="ledger-figure block">৳ {h.summary.utilityDeposit}</span></div>
                  <div className="p-2" style={{ background: "var(--paper)" }}>Utility Cost <span className="ledger-figure block">৳ {h.summary.utilityCost}</span></div>
                  <div className="p-2" style={{ background: "var(--paper)" }}>Net Utility Balance <span className="ledger-figure block">৳ {h.summary.netUtilityBalance}</span></div>
                </div>
              </div>

              {/* MEAL SUMMARY */}
              <div className="mt-8 relative rounded-lg p-4 pt-6" style={{ border: "1px solid var(--rule)" }}>
                <span
                  className="absolute -top-3 left-4 rounded px-2.5 py-0.5 text-[10px] uppercase tracking-wide ledger-display"
                  style={{ background: "var(--amber)", color: "#fff" }}
                >
                  Meal Summary
                </span>
                <div className="grid grid-cols-3 gap-px text-xs rounded overflow-hidden" style={{ background: "var(--rule)" }}>
                  <div className="p-2" style={{ background: "var(--paper)" }}>Fixed Meal <span className="ledger-figure block">{h.mealSummary.fixedMeal}</span></div>
                  <div className="p-2" style={{ background: "var(--paper)" }}>Total Meal <span className="ledger-figure block">{h.mealSummary.totalMeal}</span></div>
                  <div className="p-2" style={{ background: "var(--paper)" }}>
                    Meal Rate <span className="ledger-figure block" style={{ color: "var(--amber-deep)" }}>{h.mealSummary.mealRate.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* MEMBER SETTLEMENT */}
              <div className="mt-8">
                <div className="relative p-4 pt-2 rounded-lg" style={{ borderTop: "1px solid var(--rule)" }}>
                  <span
                    className="absolute -top-3 left-4 rounded px-2.5 py-0.5 text-[10px] uppercase tracking-wide ledger-display"
                    style={{ background: "var(--ink)", color: "#fff" }}
                  >
                    Member Settlement
                  </span>
                </div>

                {h.members.length > 0 && (
                  <>
                    {/* Desktop table */}
                    <div className="hidden md:block w-full overflow-x-auto">
                      <table className="w-full text-sm min-w-[600px]" style={{ borderCollapse: "collapse" }}>
                        <thead>
                          <tr className="text-left" style={{ borderBottom: "2px solid var(--rule)" }}>
                            <th className="px-2 py-2 text-xs uppercase tracking-wide" style={{ color: "var(--ink-soft)" }}>Member</th>
                            <th className="px-2 py-2 text-xs uppercase tracking-wide" style={{ color: "var(--ink-soft)" }}>Utility</th>
                            <th className="px-2 py-2 text-xs uppercase tracking-wide" style={{ color: "var(--ink-soft)" }}>Deposit</th>
                            <th className="px-2 py-2 text-xs uppercase tracking-wide" style={{ color: "var(--ink-soft)" }}>Meals</th>
                            <th className="px-2 py-2 text-xs uppercase tracking-wide" style={{ color: "var(--ink-soft)" }}>Meal Cost</th>
                            <th className="px-2 py-2 text-xs uppercase tracking-wide" style={{ color: "var(--ink-soft)" }}>Balance</th>
                            <th className="px-2 py-2 text-xs uppercase tracking-wide" style={{ color: "var(--ink-soft)" }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {h.members
                            .filter((m) => m.name && m.name.trim() !== "")
                            .map((m, i) => (
                              <tr key={i} className="ledger-row-stripe" style={{ borderBottom: "1px dotted var(--rule)" }}>
                                <td className="px-2 py-2 font-medium">{m.name}</td>
                                <td className="px-2 py-2 ledger-figure" style={{ color: m.utility < 0 ? "var(--due)" : "var(--surplus)" }}>৳ {m.utility}</td>
                                <td className="px-2 py-2 ledger-figure">৳ {m.deposit}</td>
                                <td className="px-2 py-2 ledger-figure">{m.meals}</td>
                                <td className="px-2 py-2 ledger-figure">৳ {m.mealCost.toFixed(2)}</td>
                                <td className="px-2 py-2 ledger-figure" style={{ color: m.balance < 0 ? "var(--due)" : "var(--surplus)" }}>৳ {m.balance.toFixed(2)}</td>
                                <td className="px-2 py-2"><StampBadge balance={m.balance} status={m.status} /></td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile member cards — each value gets its own labeled cell */}
                    <div className="md:hidden space-y-3">
                      {h.members
                        .filter((m) => m.name && m.name.trim() !== "")
                        .map((m, i) => (
                          <div key={i} className="ledger-member-card p-3">
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-semibold text-sm">{m.name}</span>
                              <StampBadge balance={m.balance} status={m.status} />
                            </div>

                            <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-3">
                              <MemberStat label="Deposit" value={`৳ ${m.deposit}`} />
                              <MemberStat label="Meals" value={`${m.meals}`} />
                              <MemberStat label="Meal Cost" value={`৳ ${m.mealCost.toFixed(2)}`} />
                              <MemberStat
                                label="Utility"
                                value={`৳ ${m.utility}`}
                                tone={m.utility < 0 ? "due" : "surplus"}
                              />
                            </div>

                            <div
                              className="flex items-center justify-between pt-2"
                              style={{ borderTop: "1px dashed var(--rule)" }}
                            >
                              <span className="ledger-stat-label" style={{ marginBottom: 0 }}>Balance</span>
                              <span
                                className="ledger-figure text-base"
                                style={{ color: m.balance < 0 ? "var(--due)" : "var(--surplus)" }}
                              >
                                ৳ {m.balance.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default History;