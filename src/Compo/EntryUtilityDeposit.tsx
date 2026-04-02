/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
// import Header from "./Header";
import Footer from "./Footer";
import DataEntryWarning from "./DataEntryWarning";


const members = [
  "Ashik Ali",
  "Ahmed Miraj",
  "Mynul Islam",
  "Tarikul Islam",
  "Mohammad Ali",
  "Jamal Ahmed",
];
interface ManagerStatus{managerStatus:boolean}


const EntryUtilityDeposit: React.FC<ManagerStatus> = ({managerStatus}) => {
  const [member, setMember] = useState("");
  const [amount, setAmount] = useState("");
  const [loadingOnSubmit, setLoadingOnSubmit] = useState(false)
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!member || !amount) {
      toast.error("Please fill all fields");
      return;
    }

    if (isNaN(Number(amount))) {
      toast.error("Amount must be a number");
      return;
    }

    setLoadingOnSubmit(true);

    const toastId = toast.loading("Submitting deposit...");

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbx5UawsnHMh9e3h52-Q9yBf1LmfsMa1vI7AI86RAWDq3MZS0jH4Ks9t6C3COm5PtO3J/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            type: "utilityDeposit",
            member: member,
            amount: amount,
          }),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        toast.success(result.message || "Deposit added!", {
          id: toastId,
        });

        setMember("");
        setAmount("");
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit", {
        id: toastId,
      });
    } finally {
      setLoadingOnSubmit(false);
    }
  };

  return (
    <>
        {/* <Header /> */}

        <section className="backdrop-blur-sm bg-black/60 py-24 p-2">
        <div className="min-h-[62vh] lg:min-h-screen">
            <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-2xl border">
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

                <h2 className="text-lg font-semibold text-center mb-6 text-indigo-600">
                    Utility Deposit Entry
                </h2>

                {/* Warning */}
                <DataEntryWarning managerStatus={managerStatus} />

                {
                  managerStatus && <>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Member Select */}
                      <div>
                      <label className="text-xs font-medium text-gray-600">
                          Select Member
                      </label>
                      <select
                          required
                          value={member}
                          onChange={(e) => setMember(e.target.value)}
                          className="w-full mt-1 p-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                      >
                          <option value="">-- Choose Member --</option>
                          {members.map((m) => (
                          <option key={m} value={m}>
                              {m}
                          </option>
                          ))}
                      </select>
                      </div>

                      {/* Amount Input */}
                      <div>
                      <label className="text-xs font-medium text-gray-600">
                          Amount (৳)
                      </label>
                      <input
                          type="text"
                          required
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="Enter amount..."
                          className="w-full mt-1 p-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
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
                      {loadingOnSubmit ? "Submitting..." : "Entry Utility Deposit"}
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

export default EntryUtilityDeposit;