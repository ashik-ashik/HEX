import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Calendar, Utensils, Save, CheckCircle, RotateCcw } from "lucide-react";
import useAuth from "../hooks/useAuth";

interface AuthContextType {
  userRole: string | null;
}

const SetFixedMeal= () => {
    const {userRole} = useAuth() as AuthContextType;
  // Current Month
  const currentMonth = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const storageKey = `fixedMeal`;

  // Saved Meal State
  const [savedMeal, setSavedMeal] = useState<number | null>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved !== null ? Number(saved) : null;
  });

  // Form State
  const [fixedMeal, setFixedMeal] = useState<number | "">("");
  const [loading, setLoading] = useState<boolean>(false);

  // Submit Handler
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (userRole !== 'manager') {
      toast.error("Only manager can set fixed meal");
      return;
    }

    if (fixedMeal === "" || Number(fixedMeal) < 0) {
      toast.error("Enter valid fixed meal");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      localStorage.setItem(storageKey, fixedMeal.toString());

      setSavedMeal(Number(fixedMeal));
      setFixedMeal("");

      toast.success(`Fixed meal set for ${currentMonth}`);

      setLoading(false);
    }, 400);
  };

  // Reset Handler
  const handleReset = () => {
    if (userRole !== "manager") {
      toast.error("Only manager can reset fixed meal");
      return;
    }

    localStorage.setItem(storageKey, "0");
    setSavedMeal(0);

    toast.success("Fixed meal reset successfully");
  };

  return (
    <div className="p-2 md:p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-6 p-4 backdrop-blur-md rounded-md">
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <Utensils className="text-indigo-600" />
          Set Fixed Meal
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Set fixed meal for current month
        </p>
      </div>

      {/* Card */}
      <div className="bg-white shadow-lg rounded-xl p-6 max-w-lg border mx-auto">

        {/* Month Display */}
        <div className="flex items-center gap-2 mb-3 text-gray-600">
          <Calendar size={18} />
          <span className="font-medium">{currentMonth}</span>
        </div>

        {/* Saved Meal Display */}
        {savedMeal !== null && savedMeal > 0 && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between gap-2">
            
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-600" />
              <span className="flex items-center text-sm font-medium text-green-700">
                Current Fixed Meal:
                <span className="font-bold text-5xl pl-4">
                  {savedMeal}
                </span>
              </span>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
            >
              <RotateCcw size={14} />
              Reset
            </button>

          </div>
        )}

        {/* No Fixed Meal Display */}
        {(savedMeal === 0 || savedMeal === null) && (
          <div className="mb-4 p-3 bg-gray-50 border rounded-lg text-sm text-gray-600">
            No fixed meal for this month
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Input */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Fixed Meal Count
            </label>

            <input
              type="number"
              step="0.5"
              value={fixedMeal}
              onChange={(e) =>
                setFixedMeal(
                  e.target.value === ""
                    ? ""
                    : Number(e.target.value)
                )
              }
              placeholder="Enter fixed meal"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? "Saving..." : "Set Fixed Meal"}
          </button>

        </form>

        {/* Info */}
        <div className="mt-4 text-xs text-gray-500">
          This fixed meal will apply for all members this month.
        </div>

      </div>
    </div>
  );
};

export default SetFixedMeal;