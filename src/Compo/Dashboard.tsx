import React from "react";
import Header from "./Header";
import Footer from "./Footer";

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
  

  const finalBalance = grandDeposit - totalBazar;
  const mealRate = grandTotalMeals > 0 ? totalBazar / grandTotalMeals : 0;

  const settlements = members.map((member) => {
    const mealMember = mealData.find((m) => m.name === member.name);
    const totalMeals = mealMember ? mealMember.total : 0;
    const mealCost = totalMeals * mealRate;
    const balance = member.total - mealCost;
    return { name: member.name, deposit: member.total, meals: totalMeals, mealCost, balance };
  });

   // 🔥 Helper: Get member balance quickly
  const getMemberBalance = (name: string) => {
    const m = settlements.find((s) => s.name === name);
    return m ? m.balance : 0;
  };

  // ===== LOADER =====
  if (isLoading) {
    return (
      <div className=" flex flex-col justify-center items-center h-screen">

        <div className="backdrop-blur-sm bg-white-700/10 p-6 flex flex-col justify-center items-center">
          {/* Smaller spinning loader */}
          <div className="relative mb-4">
              <span className="sr-only">Loading...</span>
              <span className="block w-8 h-8 rounded-full border-4 border-blue-400 border-t-transparent animate-spin"></span>
              <span className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-500 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v4m0 8v4m8-8h-4M4 12H8" />
                  </svg>
              </span>
          </div>
          <div className="text-lg font-semibold text-blue-700 mb-1 animate-pulse">Loading Data...</div>
          <div className="text-gray-500 text-sm text-center max-w-xs">
              Please wait<br />
              <span className="inline-block mt-1">This may take a few seconds.</span>
          </div>
        </div>
      </div>
    );
  } else if (isError) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Data</h1>
        <p className="text-gray-600 text-center max-w-md">
          An error occurred while loading the data. Please try again later or contact support.
        </p>
      </div>
    );
  }


  return (
    <>
          <Header />

    <div className="transparent-bg">

    
    <div className=" min-h-screen pt-24 md:container mx-auto md:px-4 px-2">
      <div className="mb-12 flex justify-center">
        <div className=" inline-block p-12 rounded-lg bg-gradient-to-r from-blue-100/30 to-purple-100/10 backdrop-blur-sm shadow-lg">
        <h1 className="text-xl font-bold text-center text-orange-800 mb-1">
          Monthly Dashboard
        </h1>
        <p className="text-center text-gray-900 text-sm">
          Overview of deposits, bazar costs, meal counts, and settlements for the
           month &nbsp; 
            {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}.
        </p>
      </div>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid md:grid-cols-4 grid-cols-2 gap-2 md:gap-6 mb-12 justify-center items-center">
        <div className="backdrop-blur-sm bg-blue-700/20 p-6 rounded-xl shadow hover:shadow-lg transition-all text-center">
          <h3 className="font-semibold text-xs text-blue-700">Total Deposit</h3>
          <p className="text-sm font-bold text-blue-700 mt-2">৳ {grandDeposit.toFixed(2)}</p>
        </div>
        <div className="backdrop-blur-sm bg-red-700/20 p-6 rounded-xl shadow hover:shadow-lg transition-all text-center">
          <h3 className="font-semibold text-xs text-orange-700">Total Bazar</h3>
          <p className="text-sm font-bold text-gray-700 mt-2">৳ {totalBazar.toFixed(2)}</p>
        </div>
        <div className={`p-6 rounded-xl shadow hover:shadow-lg transition-all text-center ${finalBalance <= 0 ? 'text-red-600 backdrop-blur-sm bg-red-700/20' : 'text-green-800 backdrop-blur-sm bg-green-700/20'}`}>
          <h3 className="font-semibold text-xs">Remaining Cash</h3>
          <p className={`text-sm font-bold mt-2 ${finalBalance <= 0 ? 'text-red-700' : 'text-green-800'}`}>৳ {finalBalance.toFixed(2)}</p>
        </div>
        <div className="backdrop-blur-sm bg-orange-700/20 from-blue-500 to-blue-700 text-orange-700 p-6 rounded-2xl shadow text-center">
            <h3 className="text-sm font-semibold font-mono">Meal Rate</h3>
            <p className="text-xs font-bold mt-2 text-orange-700">৳ {mealRate.toFixed(4)}</p>
          </div>
      </div>

      {/* ================= DEPOSIT SECTION ================= */}
      <section className="mb-12">
            <h2 className="text-2xl font-bold mb-1 text-blue-900 
            bg-blue-100/30 backdrop-blur-md 
            p-3 rounded-lg block border border-white/30 shadow-md">
              Member Deposits
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {members.map((member, idx) => {

                const balance = getMemberBalance(member.name);
                const isDue = balance < 0;

                return (
                  <div
                    key={idx}
                    className={`bg-white p-5 rounded-xl shadow hover:shadow-lg transition-all border ${isDue ? 'bg-red-300/30' : 'bg-blue-100/10'} backdrop-blur-sm`}
                  >
                    <div className="w-full flex flex-row md:flex-col items-center gap-4">

                      {/* IMAGE + BADGE */}
                      <div className="relative">

                        {member.image ? (
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                            {member.name[0]}
                          </div>
                        )}

                        {/* 🔥 DUE BADGE */}
                        { isDue && (
                          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] px-2 py-[3px] rounded-full shadow">
                            ৳ {Math.ceil(Math.abs(balance))}
                          </span>
                        )}

                        {/* NAME */}
                        <h3
                          className={`font-semibold font-mono text-xs text-nowrap mt-1 text-center ${
                             isDue
                              ? "text-red-700"
                              : "text-gray-800"
                          }`}
                        >
                          {member.name}
                        </h3>
                      </div>

                      {/* DEPOSITS */}
                      <div className="flex flex-wrap gap-2">
                        {member.deposits.map((d, i: number) => (
                          <span
                            key={i}
                            className=" text-green-700 text-xs font-medium"
                          >
                            {d}৳ <span className="font-bold">+</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={`mt-2 pt-3 border-t ${isDue ? 'border-red-600' : 'border-green-700/30'} font-bold text-center text-xs text-gray-900`}>
                      Total: ৳ {member.total.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

      {/* ================= BAZAR SECTION ================= */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold bg-red-500/20 backdrop-blur-sm mb-1 p-3 rounded-lg text-red-600">Bazar Costs</h2>
        <div className=" rounded-xl shadow overflow-auto h-[55vh]">
          <table className="w-full text-sm bg-red-100/10 backdrop-blur-sm">
            <thead className=" bg-orange-400/80 backdrop-blur-xl sticky top-0">
              <tr className="text-nowrap text-xs">
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Purchased By</th>
                <th className="p-3 text-right">Amount (৳)</th>
              </tr>
            </thead>
            <tbody>
              {bazarData.map((item, idx) => (
                <tr key={idx} className="border-t border-white hover:bg-red-50  text-nowrap text-xs">
                  <td className="p-3">{item.date}</td>
                  <td className="p-3">{item.person}</td>
                  <td className="p-3 text-right font-medium">৳ {item.amount}</td>
                </tr>
              ))}
              <tr className="py-3 border-t border-white">
                <td className="p-3 font-bold ">Total Bazar</td>
                <td className="p-3"></td>
                <td className="p-3 text-right font-bold text-red-600">৳ {totalBazar.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ================= MEAL COUNTS ================= */}
      <section className="mb-12">
  <h2 className="text-2xl bg-purple-500/20 backdrop-blur-sm font-bold mb-1 text-purple-800 p-3 rounded-lg block">
    Meal Counts ({new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })})
  </h2>

  <div className=" rounded-xl shadow overflow-x-auto">
    <table className="min-w-max text-xs bg-blue-50/10 backdrop-blur-sm border-collapse w-full">
      <thead className="bg-purple-50">
        <tr className="text-nowrap text-xs">
          
          {/* Fixed Name Column */}
          <th className="p-3 bg-white border border-white sticky left-0 bg-gray-700/90 text-white z-10">
            Name
          </th>

          {/* Fixed Total Column */}
          <th className="p-3 bg-white border border-white font-bold bg-gray-700/90 text-white">
            Total Meals
          </th>

          {mealDates.map((date, idx) => (
            <th key={idx} className="py-2 px-4 border backdrop-blur-lg border-white whitespace-nowrap">
              {date}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {mealData.map((member, idx) => (
          <tr
            key={idx}
            className="border-t hover:bg-purple-50 text-center text-nowrap text-xs"
          >
            
            {/* Fixed Name */}
            <td className="p-3 border border-white text-left font-medium sticky left-0 bg-gray-700/90 text-white z-10">
              {member.name}
            </td>

            {/* Fixed Total */}
            <td className="p-3 border bg-gray-700/90 text-white border-white font-bold">
              {member.total}
            </td>

            {member.meals.map((meal, i) => (
              <td key={i} className="p-2 border border-white">
                {meal > 0 ? meal : "x"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  <div className="bg-purple-600/20 p-6 rounded-lg text-center mt-6 shadow backdrop-blur-sm">
    <h3 className="font-bold text-purple-700 text-sm">Grand Total Meals</h3>
    <p className="text-lg font-bold mt-2 text-purple-800">{grandTotalMeals}</p>
  </div>
</section>

      {/* ================= SETTLEMENT ================= */}
      <section className="pb-12">
        <h2 className="md:text-2xl text-lg backdrop-blur-sm bg-white-700/10 p-4 rounded-lg font-bold mb-2 text-indigo-700 text-center">
          Monthly Summary
        </h2>

        <div className="grid sm:grid-cols-3 grid-cols-2 gap-2 md:gap-6 mb-12">
          <div className="backdrop-blur-sm bg-green-700/10 from-indigo-500 to-indigo-700 text-green-700 p-6 rounded-2xl shadow text-center">
            <h3 className="text-sm font-semibold font-mono">Total Bazar</h3>
            <p className="text-sm font-bold mt-2 text-green-700">৳ {totalBazar.toFixed(2)}</p>
          </div>
          <div className="backdrop-blur-sm bg-purple-700/10 from-purple-500 to-purple-700 text-purple-800 p-6 rounded-2xl shadow text-center">
            <h3 className="text-sm font-semibold font-mono">Total Meals</h3>
            <p className="text-sm font-bold mt-2 text-purple-800">{grandTotalMeals}</p>
          </div>
          <div className="col-span-2 sm:col-span-1 backdrop-blur-sm bg-orange-700/10 from-blue-500 to-blue-700 text-orange-700 p-6 rounded-2xl shadow text-center">
            <h3 className="text-lg font-semibold font-mono">Meal Rate</h3>
            <p className="text-sm font-bold mt-2 text-orange-700">৳ {mealRate.toFixed(4)}</p>
          </div>
        </div>

        <div className="rounded-2xl shadow-xl py-6 backdrop-blur-sm bg-white-700/10">
          <h2 className="text-lg font-bold text-center my-4">Settlement Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-center">
              <thead className=" text-indigo-700">
                <tr className="text-nowrap text-xs">
                  <th className="p-4 font-bold border sticky left-0 bg-gray-700/90 text-white z-10">Member</th>
                  <th className="p-4">Deposit (৳)</th>
                  <th className="p-4">Total Meals</th>
                  <th className="p-4">Meal Cost (৳)</th>
                  <th className="p-4">Final Balance (৳)</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((item, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50 text-nowrap text-xs">
                    <td className="p-4 font-bold text-left border text-left font-medium sticky left-0 bg-gray-700/90 text-white z-10">{item.name}</td>
                    <td className="p-4">৳ {item.deposit.toFixed(2)}</td>
                    <td className="p-4">{item.meals}</td>
                    <td className="p-4">৳ {item.mealCost.toFixed(2)}</td>
                    <td
                      className={`p-4 font-bold ${
                        item.balance >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      ৳ {Math.ceil(item.balance)}
                    </td>
                    <td>
                      {item.balance > 0 ? (
                        <span className=" text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                          Will Receive
                        </span>
                      ) : item.balance < 0 ? (
                        <span className=" text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                          Needs to Pay
                        </span>
                      ) : (
                        <span className=" text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
                          Settled
                        </span>
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