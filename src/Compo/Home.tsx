import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";

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
  managerStatus: boolean
}

interface Notice {
  title: string;
  content: string;
}

const DATA_URL = import.meta.env.VITE_PERSONNEL_SHEET_READER;

const Home: React.FC<HomeProps>  = ({ managerStatus, grandDeposit, totalBazar, utilityDeposits, utilityCosts, isLoading, notices }) => {
  const [members, setMembers] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

  // Fetch Members
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

  const manager = members.find((m) =>
    m.designation?.toLowerCase().includes("manager")
  );
  const others = members.filter(
    (m) => !m.designation?.toLowerCase().includes("manager")
  );


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
      const costs = row.slice(1)?.map((v:string) => Number(v) || 0);
      const total = costs.reduce((a:number, b:number) => a + b, 0);
      return { total };
    });

  const totalCosts = costSummary.reduce(
    (sum, item) => sum + item.total,
    0
  );


// ===== Total Deposit & Cost Calculations =====
const totalDeposit = grandDeposit; // from props (meal deposit)
const totalUtilityDeposit = grandUtilityDeposit;
const totalBazarCosts = totalBazar; // from props (bazar costs)
const totalUtilityCosts = totalCosts;

// Grand totals
const grandTotalDeposit = totalDeposit + totalUtilityDeposit;
const grandTotalCosts = totalBazarCosts + totalUtilityCosts;

// Final cash/balance
const finalBalance = grandTotalDeposit - grandTotalCosts;

const remainingMealCash = totalDeposit - totalBazarCosts;
let systemNotice: { title: string; content: string } | null = null;

const today = new Date();
const currentDate = today.getDate();

// Show notice only between 5th and 25th
const showNotice = currentDate >= 5 && currentDate <= 25;

if (showNotice) {
  if (remainingMealCash <= 0) {
    systemNotice = {
      title: "🚨 জরুরি সতর্কবার্তা: মিল ফান্ড ঘাটতিতে",
      content:
        "বর্তমানে মিল ফান্ড সম্পূর্ণ শেষ হয়ে গেছে এবং ঘাটতি চলছে। এই অবস্থায় নিয়মিত বাজার ও খাবার পরিচালনা ব্যাহত হতে পারে। সকল সদস্যকে অনুরোধ করা যাচ্ছে যত দ্রুত সম্ভব মিল ডিপোজিট প্রদান করে মিল কার্যক্রম সচল রাখতে সহযোগিতা করার জন্য। অন্যথায় সাময়িকভাবে মিল কার্যক্রম বন্ধ করার প্রয়োজন হতে পারে।",
    };
  } 
  
  else if (remainingMealCash < 500) {
    systemNotice = {
      title: "⚠️ সতর্কবার্তা: মিল ফান্ড সীমিত",
      content:
        "মিল ফান্ড বর্তমানে সীমিত অবস্থায় রয়েছে। আসন্ন বাজার খরচ মেটাতে সমস্যা হতে পারে। সকল সদস্যকে অনুরোধ করা হচ্ছে দ্রুত মিল ডিপোজিট প্রদান করে ফান্ডের ভারসাম্য বজায় রাখতে সহযোগিতা করার জন্য।",
    };
  }
}

const finalNotices = systemNotice
  ? [systemNotice, ...notices]
  : notices;

  return (
    <>
    <Header />
    <div className="min-h-screen transparent-bg px-2 text-gray-800">
      {/* Hero Section */}
      <section className=" py-20 sm:px-6 px-0">
        <div className="max-w-6xl mx-auto text-center backdrop-blur-sm bg-white-700/10 py-12 rounded-xl shadow-lg">
          <img src="https://i.postimg.cc/DwTnRW5X/hex-house.png" className="w-50 h-40 md:w-60 md:h-60 mx-auto" alt="" />
          <h1 className="text-lg md:text-4xl font-bold mb-6 text-gray-900">
            The Hex Bachelors House
          </h1>
          <p className="text-xs md:text-lg text-gray-900 max-w-3xl mx-auto mb-8">
            Manage your monthly meal expenses, bazar costs, deposits, and
            utilities with automatic calculations and real-time updates, all
            in one place.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            
            <Link
              to="/dashboard"
              className="backdrop-blur-sm bg-blue-700/30 hover:bg-blue-700/10 text-blue-700 px-12 py-2 rounded-lg font-medium transition text-xs md:text-sm"
            >
              Dashboard
            </Link>

            {!managerStatus ? <Link
              to="/utility"
              className="backdrop-blur-sm border border-blue-600/30 text-blue-600 hover:bg-blue-50/10 px-12 py-2 rounded-lg font-medium transition text-xs md:text-sm"
            >
              Utility
            </Link> :
            <>
            <Link
              to="/manager"
              className="backdrop-blur-sm border border-blue-600/30 text-blue-600 hover:bg-blue-50/10 px-12 py-2 rounded-lg font-medium transition text-xs md:text-sm"
            >
              Manager Dsahboard
            </Link>
            </>
          }
          </div>
        </div>
      </section>


{/* ================= Notice Board ================= */}
    {
      isLoading ? (
        <div className="max-w-4xl mx-auto py-10 px-4">
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto mb-3"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </div>
        </div>
      ) : (
    finalNotices.length > 0 && (
      <section className="py-10">
        <div className="max-w-6xl mx-auto">

          <div className="backdrop-blur-sm bg-white-700/10 border border-orange-200 rounded-xl shadow-lg overflow-hidden">

            <div className="bg-orange-600 md:tracking-[5px] tracking-[2px] text-white text-center py-2 text-xs font-semibold tracking-wider">
              NOTICE BOARD
            </div>

            <div className="divide-y pb-4">

              {finalNotices.map((notice, index) => (
                <div key={index} className={`px-5 py-3 transition ${index === 0 && remainingMealCash <= 0 ? 'bg-red-700 mt-2 py-4' : 'hover:bg-green-50'}`}>

                  <h3 className={`text-sm font-semibold  mb-1 ${index === 0 && remainingMealCash <= 0 ? 'text-white' : 'text-orange-800'}`}>
                    {index +1}. {notice.title}
                  </h3>

                  <p className={`text-xs pl-4 ${index === 0 && remainingMealCash <= 0 ? 'text-red-50' : 'text-gray-900'}`}>
                    {notice.content}
                  </p>

                </div>
              ))}

            </div>
            <div className="py-4 flex justify-center">
              <Link to='/postnotice' className="text-xs py-2 px-6 border border-orange-700  bg-orange-500/70 font-bold text-white tracking-[1px] rounded-full">Post An Issue</Link>
            </div>
          </div>

        </div>
      </section>
    ))
    }



      {/* ================= Summary Section ================= */}
    <section className="py-12">
      {
        isLoading ? (
          /* ================= Skeleton Layout ================= */
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 grid-cols-2 gap-2 md:gap-6 animate-pulse">

          {/* Card Skeleton */}
          {[1,2,3,4].map((item) => (
            <div key={item} className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto mb-3"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </div>
          ))}

          {/* Summary Table Skeleton */}
          <div className="bg-blue-50 rounded-xl shadow-md col-span-2 md:col-span-2">
            <div className="mx-auto p-6 bg-white rounded-2xl shadow-2xl border border-gray-200">

              <div className="h-5 bg-gray-200 rounded w-1/3 mx-auto mb-6"></div>

              {[1,2,3].map((row) => (
                <div key={row} className="flex justify-between items-center mb-4">
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                </div>
              ))}

              <div className="mt-6">
                <div className="h-6 bg-gray-200 rounded-full w-2/3 mx-auto"></div>
              </div>

            </div>
          </div>

        </div>

        ) : (
          <>
          <h2 className="text-lg md:text-2xl font-bold text-center md:mb-8 mb-3">
            House Financial Overview
          </h2>
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 grid-cols-2 gap-2 md:gap-6">
            <div className="backdrop-blur-sm bg-white-700/10 p-6 rounded-xl shadow-md text-center">
              <h4 className="text-xs font-semibold mb-2">Meal Deposit</h4>
              <p className="text-sm font-bold text-green-600">{totalDeposit} BDT</p>
            </div>
        
            <div className="backdrop-blur-sm bg-white-700/10 p-6 rounded-xl shadow-md text-center">
              <h4 className="text-xs font-semibold mb-2">Utility Deposit</h4>
              <p className="text-sm font-bold text-green-600">{totalUtilityDeposit} BDT</p>
            </div>
        
            <div className="backdrop-blur-sm bg-white-700/10 p-6 rounded-xl shadow-md text-center">
              <h4 className="text-xs font-semibold mb-2">Bazar Costs</h4>
              <p className="text-sm font-bold text-red-600">{totalBazarCosts} BDT</p>
            </div>
        
            <div className="backdrop-blur-sm bg-white-700/10 p-6 rounded-xl shadow-md text-center">
              <h4 className="text-xs font-semibold mb-2">Utility Costs</h4>
              <p className="text-sm font-bold text-red-600">{totalUtilityCosts} BDT</p>
            </div>
        
            <div className=" rounded-xl shadow-md col-span-2 md:col-span-2">
              
              {/* ================= Creative Finance Table ================= */}
        <div className="mx-auto p-6 backdrop-blur-sm bg-white-700/10 rounded-2xl shadow-2xl border border-gray-200">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="backdrop-blur-sm bg-blue-700/10 rounded-lg">
                <th className="p-3 text-center text-gray-700 text-lg font-semibold" colSpan={2}>
                  Summary
                </th>
              </tr>
            </thead>
        
            <tbody>
              <tr className="hover:bg-green-200/30 transition-all rounded-lg">
                <td className="p-3 font-semibold text-green-700">Total Deposit</td>
                <td className="p-3 font-bold text-green-800 text-right">{grandTotalDeposit} BDT</td>
              </tr>
        
              <tr className="hover:bg-orange-200/30 transition-all rounded-lg">
                <td className="p-3 font-semibold text-orange-700">Total Costs</td>
                <td className="p-3 font-bold text-orange-800 text-right">{grandTotalCosts} BDT</td>
              </tr>

              <tr className={` transition-all rounded-lg ${remainingMealCash <= 0 ? 'text-red-600 hover:bg-red-200/30' : 'text-green-800 hover:bg-green-200/30'}`}>
                <td className={`p-3 font-semibold text-green-700 text-xs ${remainingMealCash <= 0 ? 'text-red-600' : 'text-green-800'}`}>Remaining Meal Cash</td>
                <td className={`p-3 font-bold  text-right ${remainingMealCash <= 0 ? 'text-red-600' : 'text-green-800'}`}>{remainingMealCash} BDT</td>
              </tr>
              <tr className={` transition-all rounded-lg ${totalUtilityDeposit - totalUtilityCosts <= 0 ? 'text-red-600 hover:bg-red-200/30' : 'text-green-800 hover:bg-green-200/30'}`}>
                <td className={`p-3 font-semibold text-green-700 text-xs ${totalUtilityDeposit - totalUtilityCosts <= 0 ? 'text-red-600' : 'text-green-800'}`}>Remaining Utility Cash</td>
                <td className={`p-3 font-bold text-green-800 text-right ${totalUtilityDeposit - totalUtilityCosts <= 0 ? 'text-red-600' : 'text-green-800'}`}>{totalUtilityDeposit - totalUtilityCosts} BDT</td>
              </tr>
        
              <tr className={`hover:bg-${finalBalance < 1 ? 'red-200/30':'blue-200/30'} transition-all rounded-lg`}>
                <td className={`p-3 font-semibold text-${finalBalance < 1 ? 'red-600' : 'blue-700'} text-left`}>Remaining Cash</td>
                <td className={`p-3 font-bold text-${finalBalance < 1 ? 'red-600' : 'blue-700'} text-right`}>{finalBalance} BDT</td>
              </tr>
            </tbody>
          </table>
        
          {/* Optional Footer / Badge */}
          <div
          className={`mt-6 text-center px-4 py-2 text-xs font-mono rounded-full font-semibold border ${
            totalDeposit - totalBazarCosts <= 0
              ? "text-red-600 border-red-600"
              : totalDeposit - totalBazarCosts < 500
              ? "text-orange-500 border-orange-500"
              : totalDeposit - totalBazarCosts < 1000
              ? "text-yellow-500 border-yellow-500"
              : totalDeposit - totalBazarCosts > 1500
              ? "text-green-600 border-green-600"
              : "text-blue-500 border-blue-500"
          }`}
        >
          {finalBalance === 0 && totalBazar === 0 && grandDeposit === 0
            ? "Let's Start!"
            : totalDeposit - totalBazarCosts <= 0
            ? "House in Deficit!"
            : totalDeposit - totalBazarCosts < 500
            ? "Very Low Balance"
            : totalDeposit - totalBazarCosts < 1000
            ? "Low Balance"
            : totalDeposit - totalBazarCosts > 1500
            ? "Healthy Balance!"
            : "Good Balance"}
        </div>
        </div>
            </div>
          </div>
          </>
        )
      }
    </section>



      {/* ================= House Management Section ================= */}
      <section className="py-20 to-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="lg:text-3xl text-xl font-bold text-center md:mb-12 mb-4">
            House Management Team
          </h2>

          {loading ? (
            <div className="text-center text-gray-500">Loading team...</div>
          ) : (
            <>
              {/* Manager Card */}
              {manager && (
                <div className="mb-12">
  <div className="relative overflow-hidden rounded-3xl shadow-xl border border-gray-200 backdrop-blur-sm bg-gradient-to-br from-slate-800/20 via-slate-900/50 to-blue-900/60 text-white p-10">

    {/* Top Accent Line */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400"></div>

    <div className="flex flex-col md:flex-row items-center md:justify-between gap-4">

      {/* Left Section */}
      <div className="flex flex-col items-center md:items-start gap-4">
        <img src={manager.photo} className="w-20 h-20 sm:w-32 sm:h-32 rounded-full object-cover mb-2" />
        <span className="inline-block text-xs font-semibold tracking-widest uppercase bg-blue-800/40 text-white-100 px-12 py-1 rounded-full mb-2">
          {manager.designation}
        </span>

        <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">
          {manager.name}
        </h3>

        <p className="text-gray-100 text-sm max-w-md text-center md:text-left">
          Responsible for managing monthly meals, expenses, and overall coordination of The Hex Bachelor House operations.
        </p>
      </div>

      {/* Right Section */}
      {manager.mobile && (
        <div className="flex flex-col items-center md:items-end gap-3">
          <p className="text-sm text-gray-100 uppercase tracking-wide">
            Contact
          </p>

          <a
            href={`tel:+880${manager.mobile}`}
            className="inline-flex items-center tracking-wide gap-2 bg-white text-slate-700 font-semibold px-12 py-2 rounded-xl hover:bg-gray-200 transition shadow-md"
          >
            📞 0{manager.mobile}
          </a>
        </div>
      )}

    </div>
  </div>
</div>
              )}

              {/* Other Members */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                <div className="col-span-full text-center text-green-900 italic text-sm py-2 backdrop-blur-sm bg-white-700/10 rounded-xl shadow-md border border-gray-400/10">
                      Essential Members
                    </div>
                {others.map((person, index) => (
                  <>
                  {
                    index === 5 && <div key={index} className="col-span-full text-center text-green-900 italic text-sm py-2 backdrop-blur-sm bg-white-700/10 rounded-xl shadow-md border border-gray-400/10">
                      Essential Service Providers
                    </div>
                  }
                  
                  <div
                    key={index}
                    className="backdrop-blur-sm bg-white-700/10 p-6 rounded-xl shadow-md hover:shadow-lg transition text-center border border-gray-600/20 "
                  >
                    <h4 className="text-xs text-blue-600 font-semibold uppercase mb-2">
                      {person.designation}
                    </h4>
                    <p className="text-sm font-bold text-gray-800 mb-1">
                      {person.name}
                    </p>
                    {person.mobile && (
                      <p className="text-gray-800 mt-2 text-xs font-mono tracking-wider">
                        📞 <a href={`tel:+880${person.mobile}`}>0{person.mobile}</a>
                      </p>
                    )}
                  </div>
                  </>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
      {/* ============================================================ */}

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Core Features
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <FeatureCard
              title="Meal Tracking"
              description="Add daily meal counts for each member and automatically calculate total meals and cost per meal."
            />

            <FeatureCard
              title="Bazar & Utility Costs"
              description="Track grocery purchases and monthly utility bills with proper calculation and reporting."
            />

            <FeatureCard
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

export default Home;

/* ---------------- Components ---------------- */

interface FeatureProps {
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureProps> = ({ title, description }) => (
  <div className="backdrop-blur-sm bg-white-700/20 p-6 rounded-xl shadow-md hover:shadow-lg transition">
    <h3 className="text-xl font-semibold text-orange-600 mb-3">{title}</h3>
    <p className="text-gray-900">{description}</p>
  </div>
);


