import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Footer from "./Footer";
// import Header from "./Header";
import DataEntryWarning from "./DataEntryWarning";

// Example member list – replace or fetch dynamically
const members = [
  "Ashik Ali",
  "Ahmed Miraj",
  "Mynul Islam",
  "Tarikul Islam",
  "Mohammad Ali",
  "Jamal Ahmed",
];


interface ManagerStatus{managerStatus:boolean}

const EntryMealDeposit:React.FC<ManagerStatus> = ({managerStatus})=> {
  const [member, setMember] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
    const [loadingOnSubmit, setLoadingOnSubmit] = useState(false)


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!member || !amount) {
      toast.error("Please select a member and enter an amount");
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      toast.error("Amount must be a number");
      return;
    }
    try {
      setLoadingOnSubmit(true)
      const response = await fetch(import.meta.env.VITE_INSERT_MEAL_DEPOSIT_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: (`type=mealDeposit&member=${member}&amount=${numericAmount}`),
      });

      const data = await response.json();
      if (data.status === "success") {
        toast.success(data.message);
        setAmount(""); // reset amount
        setLoadingOnSubmit(false);
      } else {
        toast.error(data.message || "Failed to add deposit");
      }
    } catch (error) {
      setLoadingOnSubmit(false);
      toast.error("Error connecting to server");
      console.error(error);
    }
  };

  return (
    <>
    {/* <Header /> */}
    <section className="backdrop-blur-sm bg-black/60 py-24 p-2">
      <div className="max-w-2xl mx-auto min-h-[62vh] p-3 bg-white/80 backdrop-blur-md rounded-xl shadow-lg">
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
            background: "#1f2937", // gray-800
            color: "#fff",
            },
            success: {
            className: "bg-green-600 text-white text-xs px-3 py-2 rounded-lg shadow-md",
            iconTheme: {
                primary: "#fff",
                secondary: "#16a34a",
            },
            },
            error: {
            className: "bg-red-600 text-white text-xs px-3 py-2 rounded-lg shadow-md",
            iconTheme: {
                primary: "#fff",
                secondary: "#dc2626",
            },
            },
            loading: {
            className: "bg-indigo-600 text-white text-xs px-3 py-2 rounded-lg shadow-md",
            },
        }} />
        <h2 className="text-2xl font-bold text-center mb-6 text-indigo-700">
          Meal Deposit
        </h2>

        {/* Warning */}
        <DataEntryWarning managerStatus={managerStatus} />

        {
          managerStatus && <>
          
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Member Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-1">Member</label>
                <select
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={member}
                  onChange={(e) => setMember(e.target.value)}
                >
                  <option value="">Select Member</option>
                  {members.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {/* Submit Button */}
              <button
                        type="submit"
                        disabled={loadingOnSubmit}
                        className={`w-full py-2 text-sm font-medium rounded-lg transition ${
                            loadingOnSubmit
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-indigo-500 hover:bg-indigo-600 text-white"
                        }`}
                        >
                        {loadingOnSubmit ? "Submitting..." : "Entry Meal Deposit"}
                        </button>
            </form>
          </>
        }

      </div>
    </section>

    <Footer />
    </>
  );
};

export default EntryMealDeposit;