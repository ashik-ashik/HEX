import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Footer from "./Footer";
// import Header from "./Header";
import DataEntryWarning from "./DataEntryWarning";
import useAuth from "../hooks/useAuth";
interface AuthContextType {
  userRole: string | null;
}

const UtilityCostEntry = () => {
  const [costSection, setCostSection] = useState("");
  const [amount, setAmount] = useState("");
  const [loadingOnSubmit, setLoadingOnSubmit] = useState(false);
    const {userRole} = useAuth() as AuthContextType;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!costSection || !amount) {
      toast.error("Please fill all fields");
      return;
    }

    // Optional: validate amount is a number
    if (isNaN(Number(amount))) {
      toast.error("Amount must be a number");
      return;
    }

    try {
      setLoadingOnSubmit(true)
      const response = await fetch(
        import.meta.env.VITE_INSERT_UTILITY_COSTS_API,
        {
          method: "POST",
          headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
          body: new URLSearchParams({
            type: "utilityCosts",
            costSection: costSection,
            amount: amount,
          }),
        }
      );

      const result = await response.json();
      toast.success(result.message);

      // Reset form
      setCostSection("");
      setAmount("");
      setLoadingOnSubmit(false)
    } catch (error) {
      console.error(error);
      toast.error("Failed to add utility cost");
    }
  };

  return (
    <>
    {/* <Header /> */}
    <section className="w-full backdrop-blur-sm bg-white/70 min-h-[70vh] py-24 p-2">
      <div className="min-h-[62vh] lg:min-h-screen">

        <div className="max-w-2xl mx-auto p-3 bg-white rounded-xl shadow-md">
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
          <h2 className="text-lg font-bold mb-4 text-center text-indigo-700">
            Add Utility Cost
          </h2>
          {/* warning */}
          <DataEntryWarning />

          {
            userRole === 'manager' && <>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cost Section</label>
                <input
                  type="text"
                  value={costSection}
                  onChange={(e) => setCostSection(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Electricity, Water, Internet..."
                  required
                  list="utility-costs-sector-list"
                />
                <datalist id="utility-costs-sector-list">
                  <option value="Toiletries">Toiletries</option>
                  <option value="ময়লা বিল">ময়লা বিল</option>
                  <option value="Basa vara">Basa vara</option>
                  <option value="Khala Bill">Khala Bill</option>
                  <option value="Gass Bill">Gass Bill</option>
                  <option value="Electricity Bill">Electricity Bill</option>
                  <option value="Wi-Fi Bill">Wi-Fi Bill</option>
                  <option value="Water Bill">Water Bill</option>
                  <option value="Paper Bill">Paper Bill</option>
                  <option value="Tooth Paste">Tooth Paste</option>
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="500"
                  required
                />
              </div>
              <button
                        type="submit"
                        disabled={loadingOnSubmit}
                        className={`w-full py-2 text-sm font-medium rounded-lg transition ${
                            loadingOnSubmit
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-indigo-500 hover:bg-indigo-600 text-white"
                        }`}
                        >
                        {loadingOnSubmit ? "Submitting..." : "Entry Utility Cost"}
                        </button>
            </form>
            </>
          }
        </div>
      </div>
    </section>
    <Footer />
    </>
  );
};

export default UtilityCostEntry;