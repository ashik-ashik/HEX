/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Header from "./Header";

interface MemberSettlement {
  name: string;
  deposit: number;
  meals: number;
  mealCost: number;
  balance: number;
  status?: string;
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

const History: React.FC = () => {
  const [history, setHistory] = useState<MonthHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const [name, deposit, meals, mealCost, balance, status] = parts;

  return {
    name,
    deposit: Number(deposit),
    meals: Number(meals),
    mealCost: Number(mealCost),
    balance: Number(balance),
    status: status || undefined, // handle empty status
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

  if (loading)
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-gray-100/60 backdrop-blur-sm w-full mx-auto min-h-screen">
        <div className="flex flex-col items-center justify-center py-20">
        {/* Animated loader */}
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium text-gray-700">Fetching settlement history...</p>
        <p className="text-sm text-gray-400">This may take a few seconds.</p>
        </div>
    </div>
  );

if (error)
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-gray-100/60 backdrop-blur-sm w-full mx-auto min-h-screen">
        <div className="flex flex-col items-center justify-center py-20">
        <div className="text-red-500 text-4xl mb-4">❌</div>
        <p className="text-lg font-semibold text-red-600 mb-1">Oops! Something went wrong.</p>
        <p className="text-sm text-red-400">{error}</p>
        </div>
    </div>
  );

if (!history.length)
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-gray-100/60 backdrop-blur-sm w-full mx-auto min-h-screen">
        <div className="flex flex-col items-center justify-center py-20">
        <div className="text-yellow-400 text-4xl mb-4">⚠️</div>
        <p className="text-lg font-semibold text-gray-700 mb-1">No history data available</p>
        <p className="text-sm text-gray-400">It seems there is no settlement history for now.</p>
        </div>
    </div>
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
  const lessMealPaidMembers = lastMonth?.members?.filter(
  (m) =>  m.meals < fixedMeal
);

  return (
    <>
    <Header />
    <div className="p-2 pt-20 w-full bg-gray-100/30 backdrop-blur-sm mx-auto">
        <div className=" max-w-5xl mx-auto">
        {/* ++++++++++++++++++++++++++++++++++++++++ */}
        {/* banner */}
        <div className="relative mb-6 rounded-lg overflow-hidden shadow-lg bg-white/90 p-6">

            {/* Content */}
            <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center">
                {/* Title & Date */}
                <div className="mb-3 md:mb-0">
                  <h2 className="text-lg lg:text-3xl font-bold mb-1">
                     Overview {lastMonth.month.replace(/,+$/g, "").trim()}
                  </h2>
                  <p className="text-xs ">
                      Last updated: {new Date(lastMonth.savedAt.replace(/,+$/g, "").trim()).toLocaleString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      })}
                  </p>
                </div>

                
         </div>

      {/* Analytical summary */}
      <div className="mt-6 bg-white/10 p-4 rounded">
        <p className="text-sm leading-relaxed text-justify">
            Last month, <span className="font-semibold">{totalMembers - absentMembers}</span> members actively participated in meals, {
                absentMembers > 0 ? (
                    <> while <span className="font-semibold">{absentMembers}</span> member(s) were absent. </>
                ) : (
                    " with no absentees."
                )
            }
            Among the participants, 
            <span className="text-green-700 font-semibold"> {positiveBalance} </span> members ended with a positive balance, 
            whereas <span className="text-red-600 font-semibold">{negativeBalance}</span> member(s) had to pay to settle their dues. 
            The average meal rate was <span className="text-yellow-700 font-semibold">{averageMealRate}</span>, calculated from 
            <span className="font-semibold"> {totalMeal} </span> total meals 
            {fixedMeal > 0 && (
                <> with a fixed meal target of <span className="font-semibold">{fixedMeal}</span> per member</>
            )}. 
            {lessMealPaidMembers.length > 0 && (
                <> Additionally, <span className="font-semibold text-orange-600">{lessMealPaidMembers.length}</span> member(s) consumed fewer meals than the fixed requirement, and applicable penalties were considered in their settlements.</>
            )}
            </p>
      </div>
    </div>
  






        {history.map((h, idx) => (
            <div key={idx} className="border rounded-lg p-4 mb-6 shadow-sm bg-white/90">
              <div className="pb-3 border-b border-red-300 mb-4">
                <h3 className="text-xl font-semibold mb-1">
                  Settlement History: {h.month.replace(/,+$/g, "").trim().split("|")[0].trim()}
                </h3>
                {/* Manager Name */}
                <h4 className="text-purple-500 text-sm">
                  Managed by: {h.month.replace(/,+$/g, "").trim().split("|")[1]?.trim() || "Not Assigned"}
                </h4>
                <p className="text-sm text-green-400 mb-2">
                Archived on: {new Date(h.savedAt.replace(/,+$/g, "").trim()).toLocaleString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                })}
                </p>
              </div>

            {/* SUMMARY */}
            <div className="mt-10 relative border rounded-lg border-green-500 p-4 pt-6 shadow-sm">
              
              {/* Title On Border */}
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-700 rounded px-3 text-xs font-semibold text-gray-50 py-1">
                Deposits and Costs Summary
              </span>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="p-2 bg-gray-100/70 rounded">Total Deposit: {h.summary.totalDeposit}</div>
                <div className="p-2 bg-gray-100/70 rounded">Total Bazar: {h.summary.totalBazar}</div>
                <div className="p-2 bg-gray-100/70 rounded">Net Meal Balance: {h.summary.netMealBalance}</div>
                <div className="p-2 bg-gray-100/70 rounded">Utility Deposit: {h.summary.utilityDeposit}</div>
                <div className="p-2 bg-gray-100/70 rounded">Utility Cost: {h.summary.utilityCost}</div>
                <div className="p-2 bg-gray-100/70 rounded">Net Utility Balance: {h.summary.netUtilityBalance}</div>
              </div>

            </div>

            {/* MEAL SUMMARY */}
            <div className="mt-10 relative border rounded-lg border-orange-500 p-4 pt-6 shadow-sm">
              
              {/* Title On Border */}
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-700 rounded px-3 text-xs font-semibold text-gray-50 py-1">
                Meal Summary
              </span>
                <div className="grid grid-cols-3 gap-2 mb-2 text-xs">
                    <div className="p-2 bg-gray-100/70 rounded">Fixed Meal: {h.mealSummary.fixedMeal}</div>
                    <div className="p-2 bg-gray-100/70 rounded">Total Meal: {h.mealSummary.totalMeal}</div>
                    <div className="p-2 bg-gray-100/70 rounded shadow-lg text-red-600">Meal Rate: <span className="font-bold">{h.mealSummary.mealRate.toFixed(2)}</span></div>
                </div>
            </div>

            {/* MEMBER SETTLEMENT */}
            <div className="mt-10">
              <div className="relative border-t border-purple-500 p-4 pt-2 rounded-lg">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-700 rounded px-3 text-xs font-semibold text-gray-50 py-1">Member Settlement</span>
              </div>
                {h.members.length > 0 && (
                    <div className="w-full overflow-x-auto">
                        <table className="w-full border-collapse border mt-2 text-sm min-w-[600px]">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                              <th className="border px-2 py-1">Member</th>
                              <th className="border px-2 py-1">Deposit</th>
                              <th className="border px-2 py-1">Meals</th>
                              <th className="border px-2 py-1">Meal Cost</th>
                              <th className="border px-2 py-1">Balance</th>
                              <th className="border px-2 py-1">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {h.members
                                .filter((m) => m.name && m.name.trim() !== "")
                                .map((m, i) => (
                                    <tr key={i}>
                                    <td className="border px-2 py-1">{m.name}</td>
                                    <td className="border px-2 py-1">{m.deposit}</td>
                                    <td className="border px-2 py-1">{m.meals}</td>
                                    <td className="border px-2 py-1">{m.mealCost.toFixed(2)}</td>
                                    <td className="border px-2 py-1">{m.balance.toFixed(2)}</td>
                                    <td className={`border px-2 py-1 ${m.balance < 0 ? 'text-red-500' : 'text-green-500'}`}>{m.status}</td>
                                    </tr>
                                ))}
                        </tbody>
                        </table>
                    </div>
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