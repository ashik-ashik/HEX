import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MealPlan {
  date: Date;
  lunch: string;
  dinner: string;
}

const fishMeals = [
  "Rice, Fish Curry, Dal",
  "Rice, Fish Bhuna, Dal",
  "Rice, Fish Curry, Bhorta",
];

const poultryMeals = [
  "Rice, Chicken Curry, Dal",
  "Rice, Chicken Bhuna, Vegetable",
  "Rice, Chicken Roast, Dal",
];

const specialMeals = [
  "Rice, Beef Curry",
];

const vegetableDinner = [
  "Rice, Dal, Vegetable",
  "Rice, Egg Curry, Bhorta",
];

const khichuriMeals = [
  "Khichuri, Egg, Vegetable",
];

const getRandom = (arr: string[]) =>
  arr[Math.floor(Math.random() * arr.length)];

const generateMonthlyPlan = (year: number, month: number): MealPlan[] => {
  const days = new Date(year, month + 1, 0).getDate();

  // 2 Special Beef Days
  const specialDays = new Set<number>();
  while (specialDays.size < 1) {
    specialDays.add(Math.floor(Math.random() * days) + 1);
  }

  let khichuriCount = 0;
  const maxKhichuri = 4;

  const plans: MealPlan[] = [];

  for (let i = 1; i <= days; i++) {
    const date = new Date(year, month, i);

    let lunch = "";
    let dinner = "";

    // Special Day
    if (specialDays.has(i)) {
      lunch = getRandom(specialMeals);
      dinner = getRandom(vegetableDinner);
    }

    // Poultry Lunch
    else if (i % 3 === 0) {
      lunch = getRandom(poultryMeals);

      const dinnerOptions = [
        () => getRandom(fishMeals),
        () => getRandom(vegetableDinner),
        () => {
          if (khichuriCount < maxKhichuri) {
            khichuriCount++;
            return getRandom(khichuriMeals);
          }
          return getRandom(vegetableDinner);
        },
      ];

      dinner =
        dinnerOptions[
          Math.floor(Math.random() * dinnerOptions.length)
        ]();
    }

    // Fish Lunch
    else {
      lunch = getRandom(fishMeals);

      // Fish lunch → poultry dinner
      dinner = getRandom(poultryMeals);
    }

    plans.push({
      date,
      lunch,
      dinner,
    });
  }

  return plans;
};

const MonthlyMealPlan: React.FC = () => {
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();


const mealPlan = React.useMemo<MealPlan[]>(
  () => generateMonthlyPlan(year, month),
  [year, month]
);
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
        <div className="backdrop-blur-sm bg-white/80 shadow">
            <div className="p-4 md:p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                onClick={handlePrevMonth}
                className="p-2 rounded-lg hover:bg-gray-100"
                >
                <ChevronLeft />
                </button>

                <h1 className="text-xl md:text-2xl font-bold">
                Monthly Meal Plan - {monthName}
                </h1>

                <button
                onClick={handleNextMonth}
                className="p-2 rounded-lg hover:bg-gray-100"
                >
                <ChevronRight />
                </button>
            </div>

            {/* Timeline */}
            <div className="space-y-3">
                {mealPlan.map((plan, index) => {
                const planDate = plan.date;

                const isToday =
                    planDate.toDateString() === today.toDateString();

                const isSpecialMeal =
                    plan.lunch.includes("Beef")

                return (
                    <div
                    key={index}
                    className={`relative pl-6 border-l-2 ${
                        isToday ? "border-blue-500" : "border-gray-500"
                    }`}
                    >
                    {/* Dot */}
                    <div
                        className={`absolute -left-2 top-5 w-3.5 h-3.5 rounded-full ${
                        isToday ? "bg-blue-500" : "bg-gray-600"
                        }`}
                    />

                    {/* Card */}
                    <div
                        className={`p-4 rounded-2xl shadow-sm border transition-all
                        ${
                        isSpecialMeal
                            ? "bg-amber-50 border-amber-400 shadow-md"
                            : isToday
                            ? "bg-blue-50 border-blue-400 shadow-md"
                            : "bg-gray-50 border-gray-200 hover:shadow"
                        }
                        `}
                    >
                        {/* Date */}
                        <div className="flex justify-between items-center mb-2">
                        <h3
                            className={`font-semibold text-sm md:text-base ${
                            isToday && "text-blue-700"
                            }`}
                        >
                            {planDate.toLocaleDateString("default", {
                            day: "2-digit",
                            month: "long",
                            weekday: "long",
                            })}

                            {isSpecialMeal && (
                            <span className="ml-2 text-xs bg-amber-600 text-white px-2 py-0.5 rounded">
                                Special Meal
                            </span>
                            )}

                            {isToday && (
                            <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                                Today
                            </span>
                            )}
                        </h3>
                        </div>

                        {/* Meals */}
                        <div className="grid md:grid-cols-2 gap-2 text-sm">
                        <div className="p-2 rounded-lg bg-white border">
                            <span className="font-medium">Lunch:</span>
                            <p className="text-gray-700 mt-1">
                            {plan.lunch}
                            </p>
                        </div>

                        <div className="p-2 rounded-lg bg-white border">
                            <span className="font-medium">Dinner:</span>
                            <p className="text-gray-700 mt-1">
                            {plan.dinner}
                            </p>
                        </div>
                        </div>
                    </div>
                    </div>
                );
                })}
            </div>
            </div>
        </div>
    </>
  );
};

export default MonthlyMealPlan;