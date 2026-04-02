import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
// import Header from "./Header";
import Footer from "./Footer";
import DataEntryWarning from "./DataEntryWarning";

// Member list
const members = [
  "Ashik Ali",
  "Ahmed Miraj",
  "Mynul Islam",
  "Tarikul Islam",
  "Mohammad Ali",
  "Jamal Ahmed",
];

interface MealEntry {
  [key: string]: string; // <-- store as string to allow fractions
}
interface ManagerStatus{managerStatus:boolean}

const MealCountEntry:React.FC<ManagerStatus> = ({managerStatus}) => {
  const [mealData, setMealData] = useState<MealEntry>(
    members.reduce((acc, member) => ({ ...acc, [member]: "" }), {})
  );
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0] // default today
  );
  const [loadingOnSubmit, setLoadingOnSubmit] = useState(false);

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
    toast.success("Adding Meals...!")
    try {
      // Format data for Google Apps Script
      const body = `type=mealCount&Date=${date}&` +
        Object.entries(mealData)
          .map(([name, count]) => `${encodeURIComponent(name)}=${encodeURIComponent(count || "0")}`)
          .join("&");

      // Replace with your Google Apps Script URL
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbx5UawsnHMh9e3h52-Q9yBf1LmfsMa1vI7AI86RAWDq3MZS0jH4Ks9t6C3COm5PtO3J/exec",
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
        setMealData(members.reduce((acc, member) => ({ ...acc, [member]: "" }), {}));
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
    <section className="backdrop-blur-sm bg-white/70 py-24 p-2">
      <div className="max-w-xl mx-auto  p-4 bg-white rounded-xl shadow-md">
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
          Daily Meal Entry
        </h2>
        {/* Warning */}
        <DataEntryWarning managerStatus={managerStatus} />

        {
          managerStatus && <>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Select Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="p-1 border rounded-md text-sm"
                required
              />
            </div>

            {members.map((member) => (
              <div key={member} className="flex justify-between items-center p-2 border-b border-gray-10">
                <label className="text-sm font-medium">{member}</label>
                <input
                  list="meal-options"
                  value={mealData[member]}
                  required
                  onChange={(e) => handleChange(member, e.target.value)}
                  className=" p-1 text-xs  border rounded-md text-center"
                  placeholder="Number of meal(s)"
                />
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
            ))}

            <button
              type="submit"
              disabled={loadingOnSubmit}
              className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              {loadingOnSubmit ? "Submitting..." : "Entry Meals"}
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

export default MealCountEntry;