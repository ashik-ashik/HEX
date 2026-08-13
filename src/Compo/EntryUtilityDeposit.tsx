/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
// import Header from "./Header";
// import DataEntryWarning from "./DataEntryWarning";
import useAuth from "../hooks/useAuth";
import type { UsersList } from "../services/DataTypes";





const EntryUtilityDeposit = () => {
  const [member, setMember] = useState("");
  const [amount, setAmount] = useState("");
  const [loadingOnSubmit, setLoadingOnSubmit] = useState(false);
    const {userRole, houseMembers} = useAuth() as {userRole:string, houseMembers: UsersList};
  

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
      const response = await fetch( import.meta.env.VITE_INSERT_UTILITY_DEPOSIT_API,
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
          background: "#1f2937",
          color: "#fff",
        },
      }}
    />

    <section className="bg-white p-4">
      <div className="max-w-2xl mx-auto">

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

          {/* Header */}
          <div className="border-b px-6 py-5">
            <h2 className="text-2xl font-bold text-slate-800">
              ইউটিলিটি ডিপোজিট এন্ট্রি
            </h2>

            <p className="text-[11px] leading-relaxed text-slate-600 mt-2">
              এই ফর্মের মাধ্যমে সদস্যদের ইউটিলিটি ডিপোজিট সংরক্ষণ করা হবে।
              প্রথমে সদস্য নির্বাচন করুন, তারপর জমার পরিমাণ লিখে
              <span className="font-medium"> "ডিপোজিট সংরক্ষণ করুন"</span>
              বাটনে ক্লিক করুন।
            </p>
          </div>

          {(userRole === "manager" || userRole === "assist_manager") && (
            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-6"
            >
              {/* Member */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  সদস্য নির্বাচন করুন
                </label>

                <select
                  required
                  value={member}
                  onChange={(e) => setMember(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">সদস্য নির্বাচন করুন</option>

                  {houseMembers.map((m) => (
                    <option key={m.email} value={m?.email?.split('@')[0]}>
                      {m?.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  জমার পরিমাণ (৳)
                </label>

                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="যেমন: ১০০০"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loadingOnSubmit}
                className={`w-full rounded-lg py-3 text-sm font-semibold transition ${
                  loadingOnSubmit
                    ? "bg-slate-300 cursor-not-allowed text-slate-600"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {loadingOnSubmit
                  ? "সংরক্ষণ করা হচ্ছে..."
                  : "ডিপোজিট সংরক্ষণ করুন"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  </>
);
};

export default EntryUtilityDeposit;