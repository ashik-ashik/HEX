import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
// import Header from "./Header";
// import DataEntryWarning from "./DataEntryWarning";
import useAuth from "../hooks/useAuth";
import { CalendarDays, UtensilsCrossed, Lock, Loader2 } from "lucide-react";

interface MealEntry {
  [key: string]: string; // <-- store as string to allow fractions
}
interface AuthContextType {
  userRole: string | null;
}
interface MemberNameList {
  memberNameList: string[];
}

const MealCountEntry: React.FC<MemberNameList> = ({ memberNameList }) => {
  const [mealData, setMealData] = useState<MealEntry>(
    memberNameList.reduce((acc, member) => ({ ...acc, [member]: "" }), {})
  );
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0] // default today
  );
  const [loadingOnSubmit, setLoadingOnSubmit] = useState(false);
  const { userRole } = useAuth() as AuthContextType;

  const canEnter = userRole === "manager" || userRole === "assist_manager";

  const filledCount = Object.values(mealData).filter((v) => v !== "").length;

  const handleChange = (member: string, value: string) => {
    // Allow empty string (user deleting input)
    if (value === "") {
      setMealData((prev) => ({ ...prev, [member]: "" }));
      return;
    }

    // Convert string to number
    const num = Number(value);

    // Check if it's a valid number
    if (!isNaN(num)) {
      // Store as string (to allow fractional input like "1.5")
      setMealData((prev) => ({ ...prev, [member]: value }));
    } else {
      // Invalid input, ignore or show toast
      toast.error("Please enter a valid number");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingOnSubmit(true);
    toast.success("Adding Meals...!");
    try {
      // Format data for Google Apps Script
      const body =
        `type=mealCount&Date=${date}&` +
        Object.entries(mealData)
          .map(
            ([name, count]) =>
              `${encodeURIComponent(name)}=${encodeURIComponent(count || "0")}`
          )
          .join("&");

      // Replace with your Google Apps Script URL
      const response = await fetch(
        import.meta.env.VITE_INSERT_MEAL_COUNTS_API,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
        }
      );

      if (response.ok) {
        toast.success("Meal counts submitted successfully!", {
          duration: 3000,
          style: {
            fontSize: "0.75rem",
            padding: "8px 12px",
            borderRadius: "8px",
          },
        });
        // Reset form
        setMealData(
          memberNameList.reduce((acc, member) => ({ ...acc, [member]: "" }), {})
        );
      } else {
        toast.error("Failed to submit meal counts.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error submitting meal counts.");
    } finally {
      setLoadingOnSubmit(false);
    }
  };

  return (
    <>
      {/* <Header /> */}
      <section className="min-h-screen backdrop-blur-sm bg-white/70 py-24 px-3">
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

        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          {/* Header band */}
          <div className="bg-indigo-600 px-5 py-4 flex items-center gap-3">
            <div className="bg-white/15 rounded-lg p-2">
              <UtensilsCrossed size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Daily Meal Entry
              </h2>
              <p className="text-[11px] text-indigo-100">
                Record today&apos;s meal count for every member
              </p>
            </div>
          </div>

          {/* Warning */}
          {/* <DataEntryWarning /> */}

          {canEnter ? (
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Date + progress */}
              <div className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3">
                <div className="flex items-center gap-2 flex-1">
                  <CalendarDays size={16} className="text-indigo-600 shrink-0" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-gray-700 focus:outline-none"
                    required
                  />
                </div>
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full whitespace-nowrap">
                  {filledCount}/{memberNameList.length} entered
                </span>
              </div>

              {/* Member list */}
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                {memberNameList.map((member) => (
                  <div
                    key={member}
                    className="flex justify-between items-center gap-3 px-3 py-2.5 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <label className="text-sm font-medium text-gray-700 truncate">
                      {member}
                    </label>
                    <input
                      list="meal-options"
                      value={mealData[member]}
                      required
                      onChange={(e) => handleChange(member, e.target.value)}
                      className="w-24 p-1.5 text-xs border border-gray-200 rounded-md text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                      placeholder="0"
                    />
                  </div>
                ))}
                {/* Suggested Values */}
                <datalist id="meal-options">
                  <option value="0" />
                  <option value="0.5" />
                  <option value="1" />
                  <option value="1.5" />
                  <option value="2" />
                  <option value="2.5" />
                  <option value="3" />
                  <option value="3.5" />
                  <option value="4" />
                  <option value="4.5" />
                  <option value="5" />
                </datalist>
              </div>

              <button
                type="submit"
                disabled={loadingOnSubmit}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loadingOnSubmit ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Entry Meals"
                )}
              </button>
            </form>
          ) : (
            <div className="p-8 flex flex-col items-center text-center gap-2">
              <div className="bg-gray-100 rounded-full p-3">
                <Lock size={20} className="text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-600">
                Restricted to managers
              </p>
              <p className="text-xs text-gray-400 max-w-xs">
                Only managers and assistant managers can submit daily meal
                entries.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default MealCountEntry;