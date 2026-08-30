import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { User, Wallet } from "lucide-react";
import useAuth from "../hooks/useAuth";
import type { UsersList } from "../services/DataTypes";

const EntryMealDeposit = () => {
  const [member, setMember] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [loadingOnSubmit, setLoadingOnSubmit] =
    useState(false);

  const { userRole, houseMembers } = useAuth() as {
    userRole: string;
    houseMembers: UsersList;
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!member || !amount) {
      toast.error(
        "Please select a member and enter an amount."
      );
      return;
    }

    const numericAmount = parseFloat(amount);

    const loadingToast = toast.loading(
      "Adding meal deposit..."
    );

    try {
      setLoadingOnSubmit(true);

      const response = await fetch(
        import.meta.env.VITE_INSERT_MEAL_DEPOSIT_API,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
          body: `type=mealDeposit&member=${member}&amount=${numericAmount}`,
        }
      );

      const data = await response.json();

      if (data === "success") {
        toast.success(
          data.message ?? "Meal deposit added successfully.",
          {
            id: loadingToast,
          }
        );

        setAmount("");
        setLoadingOnSubmit(false);
      } else {
        toast.error(
          data.message ||
            "Failed to add meal deposit.",
          {
            id: loadingToast,
          }
        );
      }
    } catch (error) {
      setLoadingOnSubmit(false);

      toast.error(
        "Unable to connect to the server.",
        {
          id: loadingToast,
        }
      );

      console.error(error);
    }
  };

  return (
    <>
      <section className="flex items-center justify-center px-3 py-10 sm:py-12">
        <Toaster
          position="top-right"
          containerStyle={{
            position: "fixed",
            top: 100,
            right: 20,
            zIndex: 9999,
          }}
          toastOptions={{
            className:
              "text-xs px-3 py-2 rounded-lg shadow-md",

            style: {
              background: "#1f2937",
              color: "#fff",
            },

            success: {
              className:
                "bg-green-600 text-white text-xs px-3 py-2 rounded-lg shadow-md",

              iconTheme: {
                primary: "#fff",
                secondary: "#16a34a",
              },
            },

            error: {
              className:
                "bg-red-600 text-white text-xs px-3 py-2 rounded-lg shadow-md",

              iconTheme: {
                primary: "#fff",
                secondary: "#dc2626",
              },
            },

            loading: {
              className:
                "bg-indigo-600 text-white text-xs px-3 py-2 rounded-lg shadow-md",
            },
          }}
        />

        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-100 p-5 sm:p-8">

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3">
              <Wallet className="w-6 h-6 text-indigo-600" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              Add Meal Deposit
            </h2>

            <p className="text-[10px] leading-relaxed text-slate-600 mt-1.5 max-w-md">
              Use this form to add a meal deposit
              for a house member. Select the member,
              enter the correct amount, and submit
              the deposit.
            </p>
          </div>

          {(userRole === "manager" ||
            userRole === "assist_manager") && (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 mt-6"
            >
              {/* Member Dropdown */}
              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Depositing Member
                </label>

                <select
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={member}
                  onChange={(e) =>
                    setMember(e.target.value)
                  }
                >
                  <option value="">
                    Select Member
                  </option>

                  {houseMembers.map((m) => (
                    <option
                      key={m?.email}
                      value={m?.email?.split("@")[0]}
                    >
                      {m?.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5" />
                  Deposit Amount (BDT)
                </label>

                <input
                  type="text"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                  placeholder="Enter the deposit amount"
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loadingOnSubmit}
                className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.99] disabled:active:scale-100 ${
                  loadingOnSubmit
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
                }`}
              >
                {loadingOnSubmit
                  ? "Submitting..."
                  : "Add Meal Deposit"}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
};

export default EntryMealDeposit;