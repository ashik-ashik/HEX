
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
// import Header from "./Header";
import Footer from "./Footer";
import DataEntryWarning from "./DataEntryWarning";
import useAuth from "../hooks/useAuth";

type FormData = {
  type: string,
  date: string;
  doer: string;
  amount: string;
};

 // 👉 replace with your real members

// bazacost entry api
const EnsertBazarCostsAPI = import.meta.env.VITE_INSERT_BAZAR_COSTS_API;
interface AuthContextType {
  userRole: string | null;
}
interface MemberNameList{memberNameList:string[]}
const EntryBazarCosts:React.FC< MemberNameList> = ({ memberNameList}) => {

  const members = memberNameList; // 👉 replace with your real members
  const [formData, setFormData] = useState<FormData>({
    type: "bazar",
    date: new Date().toISOString().split("T")[0], // auto today
    doer: "",
    amount: "",
  });
    const {userRole} = useAuth() as AuthContextType;

  const [loadingOnSubmit, setLoadingOnSubmit] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!formData.doer) {
      toast.error("Please select a member");
      return;
    }

    setLoadingOnSubmit(true);

    const promise = fetch(EnsertBazarCostsAPI, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        type: "bazar",
        Date: formData.date,
        Doer: formData.doer,
        Amount: formData.amount,
      }).toString(),
    });

    toast.promise(
      promise,
      {
        loading: "Submitting...",
        success: "✅ Bazar cost added!",
        error: "❌ Submission failed!",
      }
    );

    try {
      await promise;

      setFormData({
        type: "bazar",
        date: new Date().toISOString().split("T")[0],
        doer: "",
        amount: "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOnSubmit(false);
    }
  };

  return (
    <>
        {/* <Header /> */}
        <section className="min-h-screen flex items-center justify-center bg-gray-900/80 backdrop-blur-sm px-2">
      {/* Toast Container */}
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
        }}
        />

      <div className="w-full max-w-3xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6">
        
        {/* Header */}
        <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-6">
          🛒 Bazar Cost Entry
        </h2>

        {/* Warning */}
        <DataEntryWarning  />

        {
          userRole && 
          <>
          
          {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          
          {/* Date */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-300 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="p-3 rounded-lg bg-white/20 text-white outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Member Dropdown */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-300 mb-1">Member (Doer)</label>
            <select
              name="doer"
              value={formData.doer}
              onChange={handleChange}
              required
              className="p-3 rounded-lg bg-white/20 text-white outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" className="text-black">
                Select member
              </option>
              {members.map((member, index) => (
                <option key={index} value={member} className="text-black">
                  {member}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-300 mb-1">Amount (৳)</label>
            <input
              type="number"
              name="amount"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={handleChange}
              required
              className="p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit Button */}
          <div className="md:col-span-3 mt-4">
            <button
              type="submit"
              disabled={loadingOnSubmit}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-all text-white font-semibold shadow-lg disabled:opacity-50"
            >
              {loadingOnSubmit ? "Submitting..." : "Entry Bazar Cost"}
            </button>
          </div>
        </form>
          </>
        
        }
      </div>
    </section>

    <Footer />
    </>
  );
};

export default EntryBazarCosts;