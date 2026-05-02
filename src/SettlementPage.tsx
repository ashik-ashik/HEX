import React, { useEffect, useState } from "react";
import Header from "./Compo/Header";
import Footer from "./Compo/Footer";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { AlertTriangle, Settings, X, Save, Loader2, CheckCircle2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import useAuth from "./hooks/useAuth";



// Type for each deposit item
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
  managerThisMonth
  // grandTotalMeals,
}) => {
  /**************************************
   * 🔥 Load Fixed Meal From LocalStorage
   **************************************/
const [showFixedModal, setShowFixedModal] = useState<boolean>(false);
const [fixedMealInput, setFixedMealInput] = useState<number>(0);
const [fixedMeals, setFixedMeals] = useState<number>(0);

/**************************************
 * 📊 Save History
 **************************************/
const [isSavingHistory, setIsSavingHistory] = useState(false);
const [historySaved, setHistorySaved] = useState(false);

/**************************************
 * ✅ NEW: Confirmation Modal State
 **************************************/
const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

const { usersList } = useAuth() as AuthContextType;

const FindManager = usersList?.find(
  (u) => u?.role?.toLowerCase() === "manager"
);


// ++++++++++++++++++++++++++++++++++++++++++++++++++?

useEffect(() => {
  const savedFixedMeal =
    typeof window !== "undefined"
      ? Number(localStorage.getItem("fixedMeal")) || 0
      : 0;

  setFixedMeals(savedFixedMeal);
  setFixedMealInput(savedFixedMeal);

  if (!savedFixedMeal || savedFixedMeal === 0) {
    setShowFixedModal(true);
  }
}, [fixedMeals]);

const handleSetFixedMeal = () => {
  localStorage.setItem("fixedMeal", fixedMealInput.toString());

  toast.success("Fixed meal saved successfully");

  setShowFixedModal(false);

  setTimeout(() => {
    window.location.reload();
  }, 800);
};



  /**************************************
   * 🔥 Adjust Meal With Fixed Meal
   **************************************/
  const adjustedMeals = mealData.map((m) => {
    const actual = Number(m.total || 0);
    return {
      name: m.name,
      total: fixedMeals && actual >= 5 && actual < fixedMeals
        ? fixedMeals
        : actual,
    };
  });

  const adjustedGrandTotalMeals = adjustedMeals.reduce(
    (sum, m) => sum + m.total,
    0
  );


  // total utility deposit
  const totalUtilityDeposit = utilityDeposits.reduce(
    (sum, person) => sum + person.total,
    0
  );

  // total utility cost
  const totalUtilityCost = utilityCosts.reduce((sum, item) => {
    const amount = parseFloat(item[1]) || 0;
    return sum + amount;
  }, 0);



  /**************************************
   * 🔥 Meal Rate
   **************************************/
  const mealRate =
    adjustedGrandTotalMeals > 0
      ? totalBazar / adjustedGrandTotalMeals
      : 0;



  /**************************************
   * 🔥 Settlement Calculation
   **************************************/
    const mealMap = Object.fromEntries(
      adjustedMeals.map(m => [m.name, m])
    );

  const settlements = members.map((member) => {
    
    const meals = mealMap[member.name]?.total || 0;
    const mealCost = meals * mealRate;

    const balance = member.total - mealCost;

    return {
      name: member.name,
      image: member.image,
      deposit: member.total,
      meals,
      mealCost,
      balance,
    };
  });

// ++++++++++++++++++++++++++++++++++++++++++++++++++?


/**************************************
 * 📅 Enable Save Button Logic
 **************************************/
const today = new Date();
const currentDate = today.getDate();

const saveEnabled =
  currentDate >= 25 || currentDate <= 2;

  /**************************************
 * 📊 Save Monthly History
 **************************************/
const handleSaveHistory = async () => {

  if (historySaved) {
    toast("Already saved for this month");
    return;
  }

  try {
    setIsSavingHistory(true);

    toast.loading("Preparing settlement summary...", {
      id: "saveHistory",
    });

    
    const month= new Date().toLocaleDateString("default", {
        month: "long",
        year: "numeric",
      });
      const memberForHistory = settlements?.map((m) => ({
          name: m?.name,
          deposit: m?.deposit || 0,
          meals: m?.meals || 0,
          mealCost: Math.ceil(m?.mealCost || 0),
          balance: Math.ceil(m?.balance || 0),
          status:
            m?.balance < 0
              ? "Needs to Pay"
              : "Will Receive",
        }));
    const contents= {
        managerThisMonth: FindManager?.name,
        totalDeposit: grandDeposit,
        totalBazar: totalBazar,
        netMealBalance: grandDeposit - totalBazar,
        utilityDeposit: totalUtilityDeposit,
        utilityCost: totalUtilityCost,
        netUtilityBalance: totalUtilityDeposit - totalUtilityCost,
        fixedMeal: fixedMeals,
        totalMeal: adjustedGrandTotalMeals,
        mealRate: mealRate,
        members: memberForHistory
    }


    toast.loading("Sending data to Google Sheet...", {
      id: "saveHistory",
    });

    const res = await fetch(
      import.meta.env.VITE_STORE_SUMMARY_API_SHEET,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
              type: "saveSummary",
              month: ` ${month} | ${managerThisMonth}`,
              contents: contents ? JSON.stringify(contents) : "",
              
            }),
      }
    );

    toast.loading("Saving monthly history...", {
      id: "saveHistory",
    });

    const result = await res.json();

    if (result.status === "success") {
      toast.success("Monthly settlement saved successfully", {
        id: "saveHistory",
      });

      setHistorySaved(true);
    } else {

      throw new Error("Save failed");
    }

  } catch (error) {
    console.error(error);

    toast.error("Failed to save settlement ❌", {
      id: "saveHistory",
    });

  } finally {
    setIsSavingHistory(false);
  }
};


  /**************************************
   * 🖨 Print PDF
   **************************************/
  const handlePrintPDF = async () => {
    const input = document.getElementById("settlement-page");
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight =
      (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("Settlement.pdf");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen backdrop-blur-sm bg-white/50">
        <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
        </div>
    );
  }


  return (
    <section id="settlement-page">
      {/* ================= Fixed Meal Modal ================= */}
      <Toaster
  position="top-center"
  toastOptions={{
    style: {
      marginTop: "40vh",
    },
  }}
/>

{showFixedModal && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

<div className="bg-white rounded-2xl shadow-2xl p-6 w-[95%] max-w-md relative animate-fadeIn">

{/* Close Button */}
<button
onClick={() => setShowFixedModal(false)}
className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
>
<X size={20}/>
</button>

{/* Icon */}
<div className="flex justify-center mb-3">
<div className="bg-orange-100 p-3 rounded-full">
<Settings className="text-orange-500" size={26}/>
</div>
</div>

{/* Title */}
<h3 className="text-lg font-bold text-center text-gray-800 mb-2">
Set Fixed Meal For This Month <span className="text-sm">{managerThisMonth}</span>
</h3>

{/* Month */}
<p className="text-xs text-center text-gray-500 mb-3">
{new Date().toLocaleDateString("default", {
month: "long",
year: "numeric",
})}
</p>

{/* Warning */}
<div className="flex gap-2 bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
<AlertTriangle className="text-yellow-600" size={18}/>
<p className="text-xs text-gray-600">
Setting a fixed meal helps ensure fair settlement calculation.  
If a member's meal is below this value, it will automatically be adjusted.
</p>
</div>

{/* Input */}
<div className="mb-4">
<input
type="number"
value={fixedMealInput}
onChange={(e) =>
setFixedMealInput(Number(e.target.value))
}
placeholder="Enter fixed meal"
className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-400 outline-none"
/>
</div>

{/* Buttons */}
<div className="flex gap-2">

<button
onClick={handleSetFixedMeal}
className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-sm hover:bg-purple-700 transition"
>
Save Fixed Meal
</button>

<button
onClick={() => setShowFixedModal(false)}
className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-100 transition"
>
Close
</button>

</div>

</div>

</div>
)}

{/* ================= NEW: Save History Confirmation Modal ================= */}
{showConfirmModal && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

<div className="bg-white mt-10 rounded-2xl shadow-2xl p-6 w-[95%] max-w-md relative animate-fadeIn">

{/* Close Button */}
<button
onClick={() => setShowConfirmModal(false)}
className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
>
<X size={20}/>
</button>

{/* Icon */}
<div className="flex justify-center mb-3">
<div className="bg-green-100 p-3 rounded-full">
<CheckCircle2 className="text-green-600" size={26}/>
</div>
</div>

{/* Title */}
<h3 className="text-lg font-bold text-center text-gray-800 mb-2">
Save Monthly Settlement?
</h3>

{/* Month */}
<p className="text-xs text-center text-gray-500 mb-3">
{new Date().toLocaleDateString("default", {
month: "long",
year: "numeric",
})}{" "}
{managerThisMonth && `| ${managerThisMonth}`}
</p>

{/* Warning */}
<div className="flex gap-2 bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
<AlertTriangle className="text-yellow-600" size={18}/>
<p className="text-xs text-gray-600">
This will permanently save the settlement history for this month. 
This action <span className="font-semibold text-red-600">cannot be undone</span>. Please confirm all values are correct before saving.
</p>
</div>



{/* Buttons */}
<div className="flex gap-2">

<button
onClick={() => {
setShowConfirmModal(false);
handleSaveHistory();
}}
className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700 transition flex items-center justify-center gap-2"
>
<Save size={14}/>
Yes, Save History
</button>

<button
onClick={() => setShowConfirmModal(false)}
className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-100 transition"
>
Cancel
</button>

</div>

</div>

</div>
)}
{/* ================= END: Save History Confirmation Modal ================= */}

      <Header />

      <section className="backdrop-blur-sm bg-white/70 py-10">
        <div className="min-h-screen pt-24 md:container mx-auto px-2 md:px-4">

          {/* ================= TOP SUMMARY ================= */}
<section className="mb-10">
    <div className="mb-10 backdrop-blur-sm p-4 text-center">
    {/* Main Title */}
    <h2 className="text-2xl md:text-3xl font-bold mb-2 text-purple-700 text-shadow py-4">
      Settlement Overview
    </h2>

    {/* Subtitle with Current Month & Year */}
    <p className="text-sm md:text-base text-gray-600">
      Detailed settlement summary for{" "}
      <span className="font-semibold text-indigo-700">
        {new Date().toLocaleDateString("default", {
          month: "long",
          year: "numeric",
        })}
      </span>
    </p>

    {/* Optional short description */}
    <p className="text-xs md:text-sm text-gray-500 mt-1">
      Includes meal deposits, total bazar, utility costs, and member balances.
    </p>
  </div>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 auto-rows-fr">

    <div className="order-1 md:order-1 p-4 rounded-xl bg-green-500/20 text-green-800 text-center shadow">
      <p className="text-xs">Total Deposit</p>
      <p className="font-bold">৳ {grandDeposit.toFixed(2)}</p>
    </div>

<div className={`p-4 order-2 md:order-2 rounded-xl bg-${grandDeposit - totalBazar < 0 ? 'red' : 'green'}-500/20 text-indigo-800 text-center shadow row-span-2 flex flex-col justify-center`}>
      <p className="text-xs">Net Meal Balance</p>
      <p className="font-bold text-lg">
        ৳ {(grandDeposit - totalBazar).toFixed(2)}
      </p>
    </div>

    <div className="p-4 order-5 md:order-3 rounded-xl bg-purple-500/20 text-blue-800 text-center shadow">
      <p className="text-xs">Utility Deposit</p>
      <p className="font-bold">
        ৳ {totalUtilityDeposit.toFixed(2)}
      </p>
    </div>

<div className={`p-4 order-4 md:order-4 rounded-xl bg-${totalUtilityDeposit - totalUtilityCost < 0 ? 'red' : 'green'}-500/20 text-teal-800 row-span-2 text-center shadow flex flex-col justify-center`}>
      <p className="text-xs">Net Utility Balance</p>
      <p className="font-bold text-lg">
        ৳ {(totalUtilityDeposit - totalUtilityCost).toFixed(2)}
      </p>
    </div>

    <div className="p-4 order-3 md:order-5 rounded-xl bg-green-500/20 text-red-700 text-center shadow">
      <p className="text-xs">Total Bazar</p>
      <p className="font-bold">
        ৳ {totalBazar.toFixed(2)}
      </p>
    </div>

    <div className="p-4 order-6 md:order-6 rounded-xl bg-purple-500/20 text-orange-700 text-center shadow">
      <p className="text-xs">Utility Cost</p>
      <p className="font-bold">
        ৳ {totalUtilityCost.toFixed(2)}
      </p>
    </div>

  </div>
</section>



{/* ================= MEAL SUMMARY ================= */}
<section className="mb-10 border border-indigo-400 rounded-md p-4 shadow bg-white/20">
    <h2 className="text-lg font-bold mb-4 text-center text-indigo-700">
    Meal Summary
  </h2>
  <div className="grid grid-cols-3 gap-2">

    <div className="p-4 rounded-xl bg-indigo-500/30 text-purple-800 text-center shadow">
      <p className="text-xs">Fixed</p>
      <p className="font-bold">
        {fixedMeals}
      </p>
    </div>
    <div className="p-4 rounded-xl bg-orange-500/30 text-purple-800 text-center shadow">
      <p className="text-xs">Total</p>
      <p className="font-bold">
        {adjustedGrandTotalMeals}
      </p>
    </div>

    <div className="p-4 rounded-xl bg-orange-500/30 text-yellow-800 text-center shadow">
      <p className="text-xs">Rate</p>
      <p className="font-bold">
        ৳ {mealRate.toFixed(4)}
      </p>
    </div>

  </div>
</section>



{/* ================= MEMBER SETTLEMENT ================= */}
<section>
  <h2 className="text-lg font-bold mb-4 text-center text-indigo-700">
    Member Settlement
  </h2>

<div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 md:gap-4 gap-1">

{settlements.map((m, idx) => {

const isDue = m.balance < 0;

return (
<div
key={idx}
className="p-5 rounded-md shadow backdrop-blur-sm bg-white/20 border"
>

{/* PROFILE */}
<div className="flex flex-col items-center mb-3">

{m.image ? (
<img
src={m.image}
className="w-16 h-16 rounded-full object-cover border mb-2"
/>
) : (
<div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center font-bold mb-2">
{m.name[0]}
</div>
)}

<h3 className={`text-sm font-bold ${isDue ? "text-red-600" : "text-gray-800"}`}>
{m.name}
</h3>

</div>

{/* DATA */}
<div className="text-xs space-y-2">

<div className="flex justify-between border-b border-gray-400/50 pb-2">
<span>Deposit</span>
<span>৳ {m.deposit.toFixed(2)}</span>
</div>

<div className="flex justify-between border-b border-gray-400/50 pb-2">
<span>Meals</span>
<span>{m.meals}</span>
</div>

<div className="flex justify-between border-b border-gray-400/50 pb-2">
<span>Meal Cost</span>
<span>৳ {Math.ceil(m.mealCost)}</span>
</div>

<div className="flex justify-between font-bold border-b border-gray-400/50 pb-2">
<span>Balance</span>
<span className={isDue ? "text-red-600" : "text-green-600"}>
৳ {Math.ceil(m.balance)}
</span>
</div>

</div>

{/* STATUS */}
<div className="mt-3 text-center">
{isDue ? (
<span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full">
Needs to Pay ৳ {Math.ceil(m.balance * -1)}
</span>
) : (
<span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
Will Receive ৳ {Math.ceil(m.balance)}
</span>
)}
</div>

</div>
);
})}

</div>
</section>

</div>

<div className="text-center my-10 space-y-3">

{/* Save History Button — now opens confirmation modal */}
<button
onClick={() => {
  if (historySaved) {
    toast("Already saved for this month");
    return;
  }
  setShowConfirmModal(true);
}}
disabled={!saveEnabled || isSavingHistory || historySaved}
className={`text-xs px-5 py-2 rounded-md shadow transition flex items-center gap-2 mx-auto
${
saveEnabled
? "bg-indigo-600 text-white hover:bg-indigo-700"
: "bg-gray-300 text-gray-500 cursor-not-allowed"
}`}
>
{isSavingHistory ? (
<>
<Loader2 size={14} className="animate-spin"/>
Saving...
</>
) : historySaved ? (
<>
<Save size={14}/>
Saved to History
</>
) : (
<>
<Save size={14}/>
Save as History
</>
)}
</button>

{/* Helper Text */}
{!saveEnabled && (
<p className="text-xs text-gray-500">
History saving available from 25th to next month 2nd day
</p>
)}

<button
onClick={handlePrintPDF}
className="bg-purple-600 text-white text-xs px-5 py-2 rounded-md shadow hover:bg-purple-700 transition"
>
🖨 Print Report
</button>

</div>

</section>

<Footer />

</section>
);
};

export default SettlementPage;