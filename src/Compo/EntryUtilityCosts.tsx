import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Tag, Wallet, Zap } from "lucide-react";
// import Header from "./Header";
// import DataEntryWarning from "./DataEntryWarning";
import useAuth from "../hooks/useAuth";

interface AuthContextType {
  userRole: string | null;
}

const UtilityCostEntry = () => {
  const [costSection, setCostSection] = useState("");
  const [amount, setAmount] = useState("");
  const [loadingOnSubmit, setLoadingOnSubmit] = useState(false);

  const { userRole } = useAuth() as AuthContextType;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!costSection || !amount) {
      toast.error("Please fill in all fields");
      return;
    }

    const loadingToast = toast.loading(
      "Adding utility cost..."
    );

    try {
      setLoadingOnSubmit(true);

      const response = await fetch(
        import.meta.env.VITE_INSERT_UTILITY_COSTS_API,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            type: "utilityCosts",
            costSection: costSection,
            amount: amount,
          }),
        }
      );

      const result = await response.json();

      if (result === "success") {
        toast.success(
          result.message ?? "Utility cost added successfully",
          {
            id: loadingToast,
          }
        );
      } else {
        toast.error(
          result.message ??
            "Failed to add utility cost",
          {
            id: loadingToast,
          }
        );
      }

      // Reset form
      setCostSection("");
      setAmount("");
      setLoadingOnSubmit(false);
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to add utility cost",
        {
          id: loadingToast,
        }
      );

      setLoadingOnSubmit(false);
    }
  };

  return (
    <>
      {/* <Header /> */}

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

        <div className="w-full max-w-2xl rounded-3xl border border-slate-100 bg-white p-5 shadow-xl sm:p-8">

          {/* Header */}
          <div className="mb-2 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
              <Zap className="h-6 w-6 text-indigo-600" />
            </div>

            <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">
              Add Utility Cost
            </h2>

            <p className="mt-1.5 max-w-md text-[11px] leading-relaxed text-slate-600">
              Use this form to record expenses such as
              electricity, gas, water, Wi-Fi, or other
              shared household costs. Enter the expense
              category and the corresponding amount.
            </p>
          </div>

          {(userRole === "manager" ||
            userRole === "assist_manager") && (
            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4"
            >
              {/* Cost Section */}
              <div className="flex flex-col">
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Tag className="h-3.5 w-3.5" />
                  Expense Category
                </label>

                <input
                  type="text"
                  value={costSection}
                  onChange={(e) =>
                    setCostSection(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Electricity, Water, Internet..."
                  required
                  list="utility-costs-sector-list"
                />

                <datalist id="utility-costs-sector-list">
                  <option value="Toiletries">
                    Toiletries
                  </option>
                  <option value="Cleaning Bill">
                    Cleaning Bill
                  </option>
                  <option value="House Rent">
                    House Rent
                  </option>
                  <option value="Maid Bill">
                    Maid Bill
                  </option>
                  <option value="Gas Bill">
                    Gas Bill
                  </option>
                  <option value="Electricity Bill">
                    Electricity Bill
                  </option>
                  <option value="Wi-Fi Bill">
                    Wi-Fi Bill
                  </option>
                  <option value="Water Bill">
                    Water Bill
                  </option>
                  <option value="Paper Bill">
                    Paper Bill
                  </option>
                  <option value="Toothpaste">
                    Toothpaste
                  </option>
                </datalist>
              </div>

              {/* Amount */}
              <div className="flex flex-col">
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Wallet className="h-3.5 w-3.5" />
                  Amount (৳)
                </label>

                <input
                  type="text"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  placeholder="500"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loadingOnSubmit}
                className={`w-full rounded-xl py-3.5 text-sm font-semibold transition-all active:scale-[0.99] disabled:active:scale-100 ${
                  loadingOnSubmit
                    ? "cursor-not-allowed bg-slate-300 text-slate-500"
                    : "bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700"
                }`}
              >
                {loadingOnSubmit
                  ? "Submitting..."
                  : "Add Utility Cost"}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
};

export default UtilityCostEntry;