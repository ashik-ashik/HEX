import { useState } from "react";
import Footer from "./Footer";
import Header from "./Header";

// Type for each deposit item
export type UtilityDeposit = {
  member: string;
  total: number;
};

interface UtilitySummaryProps {
  utilityCosts: string[][];
  isLoading: boolean;
  isError: boolean;
  utilityDeposits: UtilityDeposit[];
}

type SortKey = "name" | "amount-desc" | "amount-asc";

const fmt = (n: number) =>
  n.toLocaleString("en-BD", { maximumFractionDigits: 0 });

const UtilitySummary: React.FC<UtilitySummaryProps> = ({
  utilityDeposits,
  utilityCosts,
  isLoading,
  isError,
}) => {
  const [depositQuery, setDepositQuery] = useState("");
  const [costQuery, setCostQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F2]">
        <div className="flex flex-col items-center gap-4 py-24">
          <div className="h-12 w-12 rounded-full border-[3px] border-[#1E2A38]/15 border-t-[#2E7D52] animate-spin" />
          <p className="text-xs uppercase tracking-[0.2em] text-[#8A8275] font-medium">
            Tallying the ledger…
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F2]">
        <div className="text-center px-6 py-16 max-w-sm">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-[#B33A3A]/10 flex items-center justify-center text-[#B33A3A] text-xl font-bold">
            !
          </div>
          <p className="font-semibold text-[#B33A3A]">
            Couldn't load the ledger
          </p>
          <p className="text-sm text-[#8A8275] mt-1">
            Check your connection and try again.
          </p>
        </div>
      </div>
    );
  }

  // ===== Utility Deposit Calculation =====
  const grandDeposit = utilityDeposits.reduce((sum, p) => sum + p.total, 0);

  // ===== Utility Cost Calculation =====
  const costRows = utilityCosts.slice(1);

  const costSummary = costRows
    .filter((row) => row[0])
    .map((row) => {
      const name = row[0];
      const breakdown = row.slice(1).map((v: string) => Number(v) || 0);
      const total = breakdown.reduce((a: number, b: number) => a + b, 0);
      return { name, total, breakdown };
    });

  const totalCosts = costSummary.reduce((sum, item) => sum + item.total, 0);
  const utilityBalance = grandDeposit - totalCosts;
  const usedPct = grandDeposit > 0 ? Math.min(100, (totalCosts / grandDeposit) * 100) : 0;
  const memberCount = utilityDeposits.length || 1;
  const maxDeposit = Math.max(1, ...utilityDeposits.map((p) => p.total));
  const maxCost = Math.max(1, ...costSummary.map((c) => c.total));

  // ===== Filtering & sorting (display-only) =====
  const sortFn = (a: { total: number; label: string }, b: { total: number; label: string }) => {
    if (sortKey === "amount-desc") return b.total - a.total;
    if (sortKey === "amount-asc") return a.total - b.total;
    return a.label.localeCompare(b.label);
  };

  const visibleDeposits = utilityDeposits
    .filter((p) => p.member.toLowerCase().includes(depositQuery.toLowerCase()))
    .map((p) => ({ ...p, label: p.member }))
    .sort(sortFn);

  const visibleCosts = costSummary
    .filter((c) => c.name.toLowerCase().includes(costQuery.toLowerCase()))
    .map((c) => ({ ...c, label: c.name }))
    .sort(sortFn);

  return (
    <>
      <Header />
      <div className="transparent-bg bg-[#FAF8F2]">
        <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
          {/* ===== Ledger header ===== */}
          <div className="text-center mb-10">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#8A8275] font-semibold mb-2">
              Shared Household Ledger
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1E2A38]">
              Utility Calculation &amp; Summary
            </h1>
            <div className="mt-4 flex items-center justify-center gap-3 text-[#D9D2C4]">
              <span className="h-px w-12 bg-[#D9D2C4]" />
              <span className="text-xs text-[#8A8275] font-mono">
                {memberCount} member{memberCount !== 1 ? "s" : ""} · {costSummary.length} cost entr
                {costSummary.length === 1 ? "y" : "ies"}
              </span>
              <span className="h-px w-12 bg-[#D9D2C4]" />
            </div>
          </div>

          {/* ===== Receipt-style summary strip ===== */}
          <div className="relative bg-white rounded-2xl shadow-sm border border-[#E8E2D4] mb-12 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E8E2D4]">
              <div className="p-6 text-center">
                <h3 className="text-[11px] font-semibold text-[#2E7D52] uppercase tracking-wider">
                  Total Deposit
                </h3>
                <p className="font-mono text-2xl font-bold text-[#1E2A38] mt-2">
                  ৳ {fmt(grandDeposit)}
                </p>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-[11px] font-semibold text-[#C1502E] uppercase tracking-wider">
                  Total Costs
                </h3>
                <p className="font-mono text-2xl font-bold text-[#1E2A38] mt-2">
                  ৳ {fmt(totalCosts)}
                </p>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8275]">
                  Remaining Cash
                </h3>
                <p
                  className={`font-mono text-2xl font-bold mt-2 ${
                    utilityBalance >= 0 ? "text-[#2D5F8B]" : "text-[#B33A3A]"
                  }`}
                >
                  ৳ {fmt(utilityBalance)}
                </p>
              </div>
            </div>

            {/* usage meter */}
            <div className="px-6 pb-5 pt-1">
              <div className="flex justify-between text-[11px] text-[#8A8275] mb-1.5 font-medium">
                <span>Spent {usedPct.toFixed(0)}% of deposit</span>
                <span>{memberCount} member{memberCount !== 1 ? "s" : ""}</span>
              </div>
              <div className="h-2 rounded-full bg-[#F0EBDD] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    usedPct > 100 ? "bg-[#B33A3A]" : "bg-gradient-to-r from-[#2E7D52] to-[#C1502E]"
                  }`}
                  style={{ width: `${Math.min(100, usedPct)}%` }}
                />
              </div>
            </div>

            {/* perforated tear edge */}
            <div
              className="h-3 w-full"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 6px 0px, transparent 5px, #FAF8F2 5.5px)",
                backgroundSize: "12px 12px",
                backgroundRepeat: "repeat-x",
              }}
            />
          </div>

          {/* ===== Utility Deposit Section ===== */}
          <section className="bg-white shadow-sm border border-[#E8E2D4] rounded-2xl mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 border-b border-[#E8E2D4]">
              <h2 className="font-serif text-xl font-bold text-[#1E2A38]">
                Utility Deposit
              </h2>
              <div className="flex gap-2">
                <input
                  value={depositQuery}
                  onChange={(e) => setDepositQuery(e.target.value)}
                  placeholder="Find a member…"
                  className="text-sm px-3 py-1.5 rounded-lg border border-[#E8E2D4] bg-[#FAF8F2] focus:outline-none focus:ring-2 focus:ring-[#2E7D52]/30 w-40 sm:w-48"
                />
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="text-sm px-2 py-1.5 rounded-lg border border-[#E8E2D4] bg-[#FAF8F2] focus:outline-none focus:ring-2 focus:ring-[#2E7D52]/30"
                >
                  <option value="name">Name</option>
                  <option value="amount-desc">Highest first</option>
                  <option value="amount-asc">Lowest first</option>
                </select>
              </div>
            </div>

            {visibleDeposits.length === 0 ? (
              <p className="text-center text-sm text-[#8A8275] py-10">
                No members match "{depositQuery}".
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-5">
                {visibleDeposits.map((person, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-[#E8E2D4] p-4 hover:border-[#2E7D52]/40 hover:shadow-sm transition bg-[#FAF8F2]/60"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-[#1E2A38] font-medium truncate">
                        {person.member}
                      </span>
                      <span className="text-[10px] text-[#8A8275] font-mono">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <p className="font-mono text-lg font-bold text-[#2E7D52] mb-2">
                      ৳ {fmt(person.total)}
                    </p>
                    <div className="h-1.5 rounded-full bg-[#F0EBDD] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#2E7D52]/70"
                        style={{ width: `${(person.total / maxDeposit) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center px-5 py-4 border-t border-[#E8E2D4] bg-[#FAF8F2] rounded-b-2xl">
              <span className="text-sm font-semibold text-[#1E2A38]">
                Total Deposit
              </span>
              <span className="font-mono font-bold text-[#2E7D52]">
                ৳ {fmt(grandDeposit)}
              </span>
            </div>
          </section>

          {/* ===== Utility Costs Section ===== */}
          <section className="bg-white shadow-sm border border-[#E8E2D4] rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 border-b border-[#E8E2D4]">
              <h2 className="font-serif text-xl font-bold text-[#1E2A38]">
                Utility Costs
              </h2>
              <div className="flex gap-2">
                <input
                  value={costQuery}
                  onChange={(e) => setCostQuery(e.target.value)}
                  placeholder="Find an entry…"
                  className="text-sm px-3 py-1.5 rounded-lg border border-[#E8E2D4] bg-[#FAF8F2] focus:outline-none focus:ring-2 focus:ring-[#C1502E]/30 w-40 sm:w-48"
                />
              </div>
            </div>

            {visibleCosts.length === 0 ? (
              <p className="text-center text-sm text-[#8A8275] py-10">
                No entries match "{costQuery}".
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wide text-[#8A8275] border-b border-[#E8E2D4]">
                      <th className="text-left font-semibold px-5 py-2 w-10">#</th>
                      <th className="text-left font-semibold px-2 py-2">Entry</th>
                      <th className="text-left font-semibold px-2 py-2 w-1/2 hidden sm:table-cell">
                        Share of total costs
                      </th>
                      <th className="text-right font-semibold px-5 py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBDD]">
                    {visibleCosts.map((item, i) => {
                      const share = totalCosts > 0 ? (item.total / totalCosts) * 100 : 0;
                      return (
                        <tr key={i} className="hover:bg-[#FAF8F2] transition">
                          <td className="px-5 py-3 text-[#8A8275] font-mono text-xs">
                            {String(i + 1).padStart(2, "0")}
                          </td>
                          <td className="px-2 py-3 text-[#1E2A38] font-medium">
                            {item.name}
                          </td>
                          <td className="px-2 py-3 hidden sm:table-cell">
                            <div className="flex items-center gap-2">
                              <div className="h-2 rounded-full bg-[#F0EBDD] overflow-hidden flex-1">
                                <div
                                  className="h-full rounded-full bg-[#C1502E]/70"
                                  style={{ width: `${(item.total / maxCost) * 100}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-mono text-[#8A8275] w-10 text-right">
                                {share.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right font-mono font-bold text-[#C1502E]">
                            ৳ {fmt(item.total)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-between items-center px-5 py-4 border-t border-[#E8E2D4] bg-[#FAF8F2] rounded-b-2xl">
              <span className="text-sm font-semibold text-[#1E2A38]">
                Total Costs
              </span>
              <span className="font-mono font-bold text-[#C1502E]">
                ৳ {fmt(totalCosts)}
              </span>
            </div>
          </section>

          <p className="text-center text-[11px] text-[#8A8275] mt-8 font-mono">
            Remaining cash = total deposit − total costs
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UtilitySummary;