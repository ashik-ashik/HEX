/* eslint-disable react-hooks/preserve-manual-memoization */
import React, { useMemo, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import useAuth from "../hooks/useAuth";
import { TbCircleFilled } from "react-icons/tb";

interface MemberData {
  name: string;
  deposits: number[];
  total: number;
  image?: string;
}

interface BazarItem {
  date: string;
  person: string;
  amount: number;
}

interface MealRow {
  name: string;
  meals: number[];
  total: number;
}

interface DashboardProps {
  members: MemberData[];
  grandDeposit: number;
  bazarData: BazarItem[];
  mealData: MealRow[];
  mealDates: string[];
  grandTotalMeals: number;
  totalBazar: number;
  isLoading: boolean;
  isError: boolean;
}

/* ---------- design tokens (ledger / mess-khata theme) ----------
  paper:      #FAF5EB
  ink:        #2B2117
  ink-soft:   #6B5E50
  terracotta: #C0573B   (brand / header accent)
  sage:       #4F7A5A   (credit / receive)
  rust:       #B23A2E   (debit / due)
  gold:       #C28A2E   (meal rate / highlight)
  rule:       #E4D9C5   (hairline ledger rules)
------------------------------------------------------------------ */

type SortKey = "name" | "balance" | "meals" | "deposit";

const Dashboard: React.FC<DashboardProps> = ({
  members,
  grandDeposit,
  bazarData,
  mealData,
  mealDates,
  grandTotalMeals,
  totalBazar,
  isLoading,
  isError,
}) => {
  const [bazarFilter, setBazarFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  const { houseMenbers } = useAuth() as { houseMenbers: { name: string; role: string; photoURL?: string }[] };

  const finalBalance = grandDeposit - totalBazar;
  const mealRate = grandTotalMeals > 0 ? totalBazar / grandTotalMeals : 0;
  const monthLabel = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const settlements = members.map((member) => {
    const mealMember = mealData.find((m) => m.name === member.name);
    const totalMeals = mealMember ? mealMember.total : 0;
    const mealCost = totalMeals * mealRate;
    const balance = member.total - mealCost;
    return { name: member.name, deposit: member.total, meals: totalMeals, mealCost, balance, image: member.image };
  });

  const getMemberBalance = (name: string) => {
    const m = settlements.find((s) => s.name === name);
    return m ? m.balance : 0;
  };

  // ----- new: quick insights -----
  const insights = useMemo(() => {
    if (settlements.length === 0) return null;
    const mostDue = [...settlements].sort((a, b) => a.balance - b.balance)[0];
    const mostCredit = [...settlements].sort((a, b) => b.balance - a.balance)[0];
    const topBazar = bazarData.reduce<Record<string, number>>((acc, b) => {
      acc[b.person] = (acc[b.person] || 0) + b.amount;
      return acc;
    }, {});
    const topBazarPerson = Object.entries(topBazar).sort((a, b) => b[1] - a[1])[0];
    return { mostDue, mostCredit, topBazarPerson };
  }, [settlements, bazarData]);

  // ----- new: filtered + sorted bazar list -----
  const filteredBazar = useMemo(() => {
    if (!bazarFilter.trim()) return bazarData;
    const q = bazarFilter.trim().toLowerCase();
    return bazarData.filter(
      (b) => b.person.toLowerCase().includes(q) || b.date.toLowerCase().includes(q)
    );
  }, [bazarData, bazarFilter]);

  // ----- new: sortable settlement table -----
  const sortedSettlements = useMemo(() => {
    const arr = [...settlements];
    arr.sort((a, b) => {
      let av: number | string, bv: number | string;
      switch (sortKey) {
        case "balance": av = a.balance; bv = b.balance; break;
        case "meals": av = a.meals; bv = b.meals; break;
        case "deposit": av = a.deposit; bv = b.deposit; break;
        default: av = a.name; bv = b.name;
      }
      if (typeof av === "string") return sortDir * av.localeCompare(bv as string);
      return sortDir * ((av as number) - (bv as number));
    });
    return arr;
  }, [settlements, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 1 ? -1 : 1));
    else {
      setSortKey(key);
      setSortDir(1);
    }
  };

  // ================= LOADER =================
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#FAF5EB]">
        
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <span className="absolute inset-0 rounded-full border-[3px] border-[#C0573B]/20" />
            <span className="absolute inset-0 rounded-full border-[3px] border-[#C0573B] border-t-transparent animate-spin" />
          </div>
          <div className="text-center">
            <p className="font-['Fraunces'] text-lg text-[#2B2117]">Opening the khata…</p>
            <p className="text-xs text-[#6B5E50] mt-1 font-['Inter']">Tallying deposits and bazar entries</p>
          </div>
        </div>
      </div>
    );
  }

  // ================= ERROR =================
  if (isError) {
    return (
      <div className="p-6 bg-[#FAF5EB] min-h-screen flex flex-col justify-center items-center">
        
        <div className="text-center max-w-md border border-[#E4D9C5] bg-white rounded-xl px-8 py-10 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#B23A2E]/10 text-[#B23A2E] flex items-center justify-center mx-auto mb-4 text-xl font-['Fraunces']">!</div>
          <h1 className="font-['Fraunces'] text-xl font-semibold text-[#2B2117] mb-2">The ledger didn't open</h1>
          <p className="text-[#6B5E50] text-sm font-['Inter']">
            Something went wrong while loading this month's data. Refresh the page, or check back in a moment.
          </p>
        </div>
      </div>
    );
  }
  return (
    <>
      <Header />
      

      <div className="bg-[#FAF5EB] min-h-screen">
        <div className="min-h-screen pt-20 md:container mx-auto md:px-6 px-3 font-['Inter']">

          {/* ================= MASTHEAD ================= */}
          <div className="mb-10 pt-6">
            <div className="flex items-baseline justify-between flex-wrap gap-2 border-b-2 border-[#2B2117]/80 pb-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#C0573B] font-semibold mb-1">Mess Khata · Monthly Statement</p>
                <h1 className="font-['Fraunces'] text-3xl md:text-4xl font-semibold text-[#2B2117] leading-tight">
                  {monthLabel}
                </h1>
              </div>
              <p className="text-xs text-[#6B5E50] font-['JetBrains_Mono'] text-right">
                {members.length} members · {bazarData.length} bazar entries
              </p>
            </div>
          </div>

          {/* ================= SUMMARY STRIP (ledger columns) ================= */}
          <div className="grid grid-cols-2 md:grid-cols-4 border border-[#E4D9C5] rounded-lg overflow-hidden bg-white mb-10 shadow-sm">
            {[
              { label: "Total Deposit", value: grandDeposit, color: "#2B2117", fmt: 2 },
              { label: "Total Bazar", value: totalBazar, color: "#C0573B", fmt: 2 },
              { label: "Remaining Cash", value: finalBalance, color: finalBalance <= 0 ? "#B23A2E" : "#4F7A5A", fmt: 2 },
              { label: "Meal Rate", value: mealRate, color: "#C28A2E", fmt: 4 },
            ].map((card, idx) => (
              <div
                key={card.label}
                className={`p-5 text-center ${idx !== 0 ? "border-l border-[#E4D9C5]" : ""} ${idx === 2 ? "max-[640px]:border-l" : ""}`}
              >
                <p className="text-[10px] uppercase tracking-wider text-[#6B5E50] font-medium mb-2">{card.label}</p>
                <p className="font-['JetBrains_Mono'] text-lg font-semibold" style={{ color: card.color }}>
                  ৳ {card.value.toFixed(card.fmt)}
                </p>
              </div>
            ))}
          </div>

          {/* ================= INSIGHTS ================= */}
          {insights && (
            <div className="grid sm:grid-cols-3 gap-3 mb-12">
              <div className="bg-[#B23A2E]/[0.06] border border-[#B23A2E]/20 rounded-lg p-4">
                <p className="text-[10px] uppercase tracking-wider text-[#B23A2E] font-semibold mb-1">Owes the most</p>
                <p className="font-['Fraunces'] text-base text-[#2B2117] capitalize">{insights.mostDue.name}</p>
                <p className="font-['JetBrains_Mono'] text-sm text-[#B23A2E] font-bold">৳ {Math.abs(insights.mostDue.balance).toFixed(0)} due</p>
              </div>
              <div className="bg-[#4F7A5A]/[0.06] border border-[#4F7A5A]/20 rounded-lg p-4">
                <p className="text-[10px] uppercase tracking-wider text-[#4F7A5A] font-semibold mb-1">Most in credit</p>
                <p className="font-['Fraunces'] text-base text-[#2B2117] capitalize">{insights.mostCredit.name}</p>
                <p className="font-['JetBrains_Mono'] text-sm text-[#4F7A5A] font-bold">৳ {insights.mostCredit.balance.toFixed(0)} to receive</p>
              </div>
              {insights.topBazarPerson && (
                <div className="bg-[#C28A2E]/[0.07] border border-[#C28A2E]/25 rounded-lg p-4">
                  <p className="text-[10px] uppercase tracking-wider text-[#C28A2E] font-semibold mb-1">Top bazar contributor</p>
                  <p className="font-['Fraunces'] text-base text-[#2B2117] capitalize">{insights.topBazarPerson[0]}</p>
                  <p className="font-['JetBrains_Mono'] text-sm text-[#C28A2E] font-bold">৳ {insights.topBazarPerson[1].toFixed(0)} spent</p>
                </div>
              )}
            </div>
          )}

          {/* ================= DEPOSITS ================= */}
          <section className="mb-12">
            <h2 className="font-['Fraunces'] text-xl font-semibold text-[#2B2117] mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C0573B]" />
              Member Deposits
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {members.slice(1).map((member, idx) => {
                const balance = getMemberBalance(member.name);
                const isDue = balance < 0;

                return (
                  <div
                    key={idx}
                    className={`bg-white rounded-lg border p-4 transition-shadow hover:shadow-md ${
                      isDue ? "border-[#B23A2E]/30" : "border-[#E4D9C5]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        {
                          (() => {
                            const houseMember = houseMenbers?.find(
                              (hm) => hm.name === member.name
                            );

                            return houseMember?.photoURL ? (
                              <img
                                src={houseMember.photoURL}
                                alt={member.name}
                                className="w-12 h-12 rounded-full object-cover border border-[#E4D9C5]"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-[#2B2117]/5 flex items-center justify-center text-[#2B2117] font-semibold font-['Fraunces'] capitalize">
                                {member.name?.[0]}
                              </div>
                            );
                          })()
                        }
                        {isDue && (
                          <span className="absolute -top-1 -right-1 bg-[#B23A2E] text-white text-[9px] px-1.5 py-[2px] rounded-full font-['JetBrains_Mono']">
                            ৳ {Math.ceil(Math.abs(balance))}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm text-[#2B2117] truncate capitalize">{member.name}</h3>
                        <p className="text-xs text-[#6B5E50] font-['JetBrains_Mono']">৳ {member.total.toFixed(2)} deposited</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-dashed border-[#E4D9C5] flex flex-wrap gap-1.5">
                      {member.deposits.map((d, i) => (
                        <span key={i} className="text-[11px] font-['JetBrains_Mono'] bg-[#4F7A5A]/10 text-[#4F7A5A] px-1.5 py-0.5 rounded">
                          +{d}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ================= BAZAR ================= */}
          <section className="mb-12">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <h2 className="font-['Fraunces'] text-xl font-semibold text-[#2B2117] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C0573B]" />
                Bazar Costs
              </h2>
              <input
                type="text"
                value={bazarFilter}
                onChange={(e) => setBazarFilter(e.target.value)}
                placeholder="Search by name or date…"
                className="text-xs bg-white border border-[#E4D9C5] rounded-md px-3 py-1.5 outline-none focus:border-[#C0573B] w-full sm:w-56"
              />
            </div>

            <div className="rounded-lg border border-[#E4D9C5] overflow-auto max-h-[50vh] bg-white">
              <table className="w-full text-sm">
                <thead className="bg-[#2B2117] sticky top-0 z-10">
                  <tr className="text-nowrap text-[11px] uppercase tracking-wide text-white">
                    <th className="p-3 text-left font-medium text-white">Date</th>
                    <th className="p-3 text-left font-medium text-white">Purchased By</th>
                    <th className="p-3 text-right font-medium text-white">Amount (৳ )</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBazar.slice(1).map((item, idx) => (
                    <tr key={idx} className="border-t border-[#E4D9C5] hover:bg-[#FAF5EB] text-nowrap text-xs">
                      <td className="p-3 text-[#6B5E50] font-['JetBrains_Mono']">{item.date}</td>
                      <td className="p-3 text-[#2B2117] capitalize">{item.person}</td>
                      <td className="p-3 text-right font-['JetBrains_Mono'] font-medium text-[#2B2117]">৳ {item.amount}</td>
                    </tr>
                  ))}
                  {filteredBazar.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-xs text-[#6B5E50]">No bazar entries match "{bazarFilter}".</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#2B2117]/80 bg-[#FAF5EB] sticky bottom-0">
                    <td className="p-3 font-semibold text-[#2B2117]">Total Bazar</td>
                    <td className="p-3"></td>
                    <td className="p-3 text-right font-['JetBrains_Mono'] font-semibold text-[#C0573B]">৳ {totalBazar.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* ================= MEAL COUNTS ================= */}
          <section className="mb-12">
            <h2 className="font-['Fraunces'] text-xl font-semibold text-[#2B2117] mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C0573B]" />
              Meal Counts <span className="text-sm text-[#6B5E50] font-['Inter'] font-normal">— {monthLabel}</span>
            </h2>

            <div className="rounded-lg border border-[#E4D9C5] overflow-x-auto bg-white">
              <table className="min-w-max text-xs border-collapse w-full">
                <thead>
                  <tr className="text-nowrap text-[11px] uppercase tracking-wide">
                    <th className="p-3 sticky left-0 bg-[#2B2117] text-white z-10 text-left font-medium">Name</th>
                    <th className="p-3 bg-[#2B2117] text-white font-medium">Total</th>
                    {mealDates.map((date, idx) => (
                      <th key={idx} className="py-2 px-3 border-l border-[#E4D9C5] bg-[#FAF5EB] text-[#6B5E50] font-medium whitespace-nowrap">
                        {date}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mealData.map((member, idx) => (
                    <tr key={idx} className="border-t border-[#E4D9C5] hover:bg-[#FAF5EB] text-center text-nowrap text-xs">
                      <td className="p-3 sticky left-0 bg-[#2B2117] text-white z-10 text-left font-medium">{member.name}</td>
                      <td className="p-3 bg-[#2B2117]/95 text-white font-['JetBrains_Mono'] font-semibold">{member.total}</td>
                      {member.meals.map((meal, i) => (
                        <td key={i} className="p-2 border-l border-[#E4D9C5] text-[#2B2117] font-['JetBrains_Mono'] text-center">
                          {meal > 0 ? meal : <span className="text-[#E4D9C5] block text-center flex items-center justify-center"><TbCircleFilled size={10} color="#ce3a00" /></span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 inline-flex items-center gap-3 bg-white border border-[#E4D9C5] rounded-lg px-5 py-3">
              <p className="text-xs uppercase tracking-wide text-[#6B5E50] font-medium">Grand Total Meals</p>
              <p className="font-['Fraunces'] text-lg font-semibold text-[#2B2117]">{grandTotalMeals}</p>
            </div>
          </section>

          {/* ================= SETTLEMENT ================= */}
          <section className="pb-16">
            <h2 className="font-['Fraunces'] text-xl font-semibold text-[#2B2117] mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C0573B]" />
              Settlement Summary
            </h2>

            <div className="grid sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-white border border-[#E4D9C5] rounded-lg p-4 text-center">
                <p className="text-[10px] uppercase tracking-wider text-[#6B5E50] mb-1">Total Bazar</p>
                <p className="font-['JetBrains_Mono'] text-base font-semibold text-[#C0573B]">৳ {totalBazar.toFixed(2)}</p>
              </div>
              <div className="bg-white border border-[#E4D9C5] rounded-lg p-4 text-center">
                <p className="text-[10px] uppercase tracking-wider text-[#6B5E50] mb-1">Total Meals</p>
                <p className="font-['JetBrains_Mono'] text-base font-semibold text-[#2B2117]">{grandTotalMeals}</p>
              </div>
              <div className="bg-white border border-[#E4D9C5] rounded-lg p-4 text-center">
                <p className="text-[10px] uppercase tracking-wider text-[#6B5E50] mb-1">Meal Rate</p>
                <p className="font-['JetBrains_Mono'] text-base font-semibold text-[#C28A2E]">৳ {mealRate.toFixed(4)}</p>
              </div>
            </div>

            <div className="rounded-lg border border-[#E4D9C5] bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-nowrap text-[11px] uppercase tracking-wide text-[#6B5E50] border-b border-[#E4D9C5]">
                      {[
                        { key: "name" as SortKey, label: "Member", align: "text-left" },
                        { key: "deposit" as SortKey, label: "Deposit (৳ )", align: "text-right" },
                        { key: "meals" as SortKey, label: "Meals", align: "text-right" },
                        { key: null, label: "Meal Cost (৳ )", align: "text-right" },
                        { key: "balance" as SortKey, label: "Balance (৳ )", align: "text-right" },
                        { key: null, label: "Status", align: "text-center" },
                      ].map((col, i) => (
                        <th
                          key={i}
                          onClick={() => col.key && toggleSort(col.key)}
                          className={`p-4 font-medium ${col.align} ${col.key ? "cursor-pointer select-none hover:text-[#2B2117]" : ""} ${i === 0 ? "sticky left-0 bg-white z-10" : ""}`}
                        >
                          {col.label}
                          {col.key === sortKey && (sortDir === 1 ? " ↑" : " ↓")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSettlements.map((item, idx) => (
                      <tr key={idx} className="border-t border-[#E4D9C5] hover:bg-[#FAF5EB] text-nowrap text-xs">
                        <td className="p-4 font-medium text-left sticky left-0 bg-white text-[#2B2117]">{item.name}</td>
                        <td className="p-4 text-right font-['JetBrains_Mono'] text-[#2B2117]">৳ {item.deposit.toFixed(2)}</td>
                        <td className="p-4 text-right font-['JetBrains_Mono'] text-[#2B2117]">{item.meals}</td>
                        <td className="p-4 text-right font-['JetBrains_Mono'] text-[#2B2117]">৳ {item.mealCost.toFixed(2)}</td>
                        <td className={`p-4 text-right font-['JetBrains_Mono'] font-semibold ${item.balance >= 0 ? "text-[#4F7A5A]" : "text-[#B23A2E]"}`}>
                          ৳ {Math.ceil(item.balance)}
                        </td>
                        <td className="p-4 text-center">
                          {item.balance > 0 ? (
                            <span className="text-[11px] bg-[#4F7A5A]/10 text-[#4F7A5A] px-2.5 py-1 rounded-full font-medium">Will Receive</span>
                          ) : item.balance < 0 ? (
                            <span className="text-[11px] bg-[#B23A2E]/10 text-[#B23A2E] px-2.5 py-1 rounded-full font-medium">Needs to Pay</span>
                          ) : (
                            <span className="text-[11px] bg-[#2B2117]/5 text-[#6B5E50] px-2.5 py-1 rounded-full font-medium">Settled</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Dashboard;