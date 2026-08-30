/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import {
  CalendarDays,
  Lock,
  Loader2,
  PencilLine,
} from "lucide-react";
import type { UsersList } from "../services/DataTypes";
import useAppData from "../hooks/useAppData";

/* ==========================================
   Types
========================================== */

interface MealEntry {
  [username: string]: number;
}

interface MealCountRow {
  date: string;
  meals: MealEntry;
}

interface MealCountResponse {
  data: MealCountRow[];
  [key: string]: unknown;
}

/* ==========================================
   Component

   IMPORTANT:
   This component is EDIT-ONLY.

   A manager can only pick a date that
   ALREADY has a meal count entry and
   correct it. There is no way to create
   a new date entry from here — if a date
   (e.g. today) has not been entered yet,
   it will simply not appear in the date
   dropdown below.
========================================== */

const EditMealCountEntry: React.FC = () => {
  /* ==========================================
     App Data

     IMPORTANT:
     readMealCount is NOT transformed.
     It remains:

     {
       date: "2026-08-01",
       meals: {
         mdashika989: 2.5,
         jamalhossain: 0
       }
     }
  ========================================== */

  const {
    readMealCount,
    setReadMealCount,
  } = useAppData() as {
    readMealCount: MealCountResponse | undefined;

    setReadMealCount: React.Dispatch<
      React.SetStateAction<
        MealCountResponse | undefined
      >
    >;
  };

  /* ==========================================
     Auth / House Members
  ========================================== */

  const {
    userRole,
    houseMembers,
  } = useAuth() as {
    userRole: string;
    houseMembers: UsersList;
  };

  const canEnter =
    userRole === "manager" ||
    userRole === "assist_manager";

  /* ==========================================
     Convert House Members

     username:
     email before @

     name:
     actual member name
  ========================================== */

  const members = useMemo(() => {
    return (houseMembers || [])
      .map((member) => ({
        name: member?.name,
        username: member.email
          .split("@")[0]
          .trim()
          .toLowerCase(),
      }));
  }, [houseMembers]);

  /* ==========================================
     Create Empty Meal Data

     IMPORTANT:
     Keys are username, NOT name.
  ========================================== */

  const createEmptyMealData = (): MealEntry => {
    return members.reduce(
      (acc, member) => {
        acc[member.username] = 0;
        return acc;
      },
      {} as MealEntry
    );
  };

  /* ==========================================
     Editable Dates

     Only dates that already exist in
     readMealCount.data are selectable.
     Sorted newest first.
  ========================================== */

  const editableDates = useMemo(() => {
    const rows =
      Array.isArray(readMealCount?.data)
        ? readMealCount.data
        : [];

    return [...rows]
      .map((row) => String(row.date).trim())
      .filter(Boolean)
      .sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
  }, [readMealCount?.data]);

  /* ==========================================
     State
  ========================================== */

  const [mealData, setMealData] =
    useState<MealEntry>(
      createEmptyMealData()
    );

  const [date, setDate] =
    useState<string>("");

  const [loadingOnSubmit, setLoadingOnSubmit] =
    useState(false);

  /* ==========================================
     Default to the most recent editable date
     once entries are available, and keep the
     selection valid if the underlying data
     changes.
  ========================================== */

  useEffect(() => {
    if (editableDates.length === 0) {
      setDate("");
      return;
    }

    if (!date || !editableDates.includes(date)) {
      setDate(editableDates[0]);
    }
  }, [editableDates]);

  /* ==========================================
     Filled Count
  ========================================== */

  const filledCount =
    Object.keys(mealData).filter(
      (username) =>
        mealData[username] !== undefined &&
        mealData[username] !== null
    ).length;

  /* ==========================================
     Load Existing Meal Data

     readMealCount already contains:

     {
       date: "2026-08-01",

       meals: {
         mdashika989: 2.5,
         jamalhossain: 0
       }
     }

     We simply use the username to populate
     the input.

     We DO NOT modify readMealCount.
  ========================================== */

  useEffect(() => {
    if (!date) {
      setMealData(createEmptyMealData());
      return;
    }

    const rows =
      Array.isArray(readMealCount?.data)
        ? readMealCount.data
        : [];

    /* Find selected date */

    const existingEntry =
      rows.find(
        (row) =>
          String(row.date).trim() ===
          String(date).trim()
      );

    /* ========================================
       No entry for selected date
       (shouldn't happen since the dropdown
       only lists existing dates, but guard
       anyway)
    ======================================== */

    if (!existingEntry) {
      setMealData(
        createEmptyMealData()
      );

      return;
    }

    /* ========================================
       Existing entry found
    ======================================== */

    const existingMeals =
      existingEntry.meals || {};

    const updatedMealData =
      members.reduce(
        (acc, member) => {
          const username =
            member.username;

          const value =
            existingMeals[
              username
            ];

          /*
           * 0 is a valid meal value.
           */

          acc[username] =
            value !== undefined &&
            value !== null
              ? Number(value)
              : 0;

          return acc;
        },
        {} as MealEntry
      );

    setMealData(
      updatedMealData
    );
  }, [
    date,
    readMealCount?.data,
    members,
  ]);

  /* ==========================================
     Handle Meal Input Change

     username is used internally.
  ========================================== */

  const handleChange = (
    username: string,
    value: string
  ) => {
    /*
     * Allow empty input while typing.
     *
     * Since the state is numeric, temporarily
     * use NaN for empty input.
     */

    if (value === "") {
      setMealData((prev) => ({
        ...prev,
        [username]: NaN,
      }));

      return;
    }

    const num = Number(value);

    if (!Number.isNaN(num)) {
      setMealData((prev) => ({
        ...prev,
        [username]: num,
      }));
    } else {
      toast.error(
        "Please enter a valid number"
      );
    }
  };

  /* ==========================================
     Submit Meal Data (UPDATE only)

     POST uses username:

     mdashika989=2.5
     jamalhossain=0

     NOT:

     Md Ashik Ali=2.5
  ========================================== */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!date) {
      toast.error(
        "No date selected to update."
      );

      return;
    }

    setLoadingOnSubmit(true);

    const loadingToast =
      toast.loading(
        "Updating Meals..."
      );

    try {
      /* ========================================
         Build POST body
      ======================================== */

      const body =
        `type=mealCount&Date=${encodeURIComponent(
          date
        )}&` +
        members
          .map(
            (member) =>
              `${encodeURIComponent(
                member.username
              )}=${encodeURIComponent(
                Number.isNaN(
                  mealData[
                    member.username
                  ]
                )
                  ? "0"
                  : String(
                      mealData[
                        member.username
                      ] ?? 0
                    )
              )}`
          )
          .join("&");

      const response = await fetch(
        import.meta.env
          .VITE_INSERT_MEAL_COUNTS_API,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          body,
        }
      );

      /* ========================================
         API Error
      ======================================== */

      if (!response.ok) {
        toast.error(
          "Failed to update meal counts.",
          {
            id: loadingToast,
          }
        );

        return;
      }

      /* ========================================
         Keep ORIGINAL readMealCount structure

         meals remains:

         {
           mdashika989: 2.5,
           jamalhossain: 0
         }

         We do NOT add name/username objects.

         Since this is EDIT-ONLY, the date
         always already exists in currentData,
         so we only ever replace an existing
         row — we never append a new one.
      ======================================== */

      const updatedEntry: MealCountRow = {
        date,

        meals: Object.fromEntries(
          members.map(
            (member) => [
              member.username,

              Number.isNaN(
                mealData[
                  member.username
                ]
              )
                ? 0
                : Number(
                    mealData[
                      member.username
                    ] ?? 0
                  ),
            ]
          )
        ),
      };

      /* ========================================
         Immediately update Context

         No page refresh required.
      ======================================== */

      setReadMealCount((prev) => {
        const currentData =
          Array.isArray(prev?.data)
            ? prev.data
            : [];

        const existingIndex =
          currentData.findIndex(
            (row) =>
              String(row.date).trim() ===
              String(date).trim()
          );

        if (existingIndex === -1) {
          /* Shouldn't happen in edit-only mode */

          return prev;
        }

        const updatedData = [
          ...currentData,
        ];

        updatedData[
          existingIndex
        ] = updatedEntry;

        return {
          ...(prev || {}),
          data: updatedData,
        };
      });

      toast.success(
        "Meal counts updated successfully!",
        {
          id: loadingToast,
        }
      );
    } catch (error) {
      console.error(
        "Meal update error:",
        error
      );

      toast.error(
        "Error updating meal counts.",
        {
          id: loadingToast,
        }
      );
    } finally {
      setLoadingOnSubmit(false);
    }
  };

  /* ==========================================
     UI
  ========================================== */

  return (
    <>
      <section className="min-h-screen backdrop-blur-sm bg-white/70 py-24 px-3">

        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
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

          {/* Header */}

          <div className="bg-indigo-600 px-5 py-4 flex items-center gap-3">
            <div className="bg-white/15 rounded-lg p-2">
              <PencilLine
                size={20}
                className="text-white"
              />
            </div>

            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Edit Meal Entry
              </h2>

              <p className="text-[11px] text-indigo-100">
                Correct a meal count for an
                already-recorded date
              </p>
            </div>
          </div>

          {canEnter ? (
            editableDates.length === 0 ? (
              /* ====================================
                  No editable data yet
              ==================================== */
              <div className="p-8 flex flex-col items-center text-center gap-2">
                <div className="bg-gray-100 rounded-full p-3">
                  <CalendarDays
                    size={20}
                    className="text-gray-400"
                  />
                </div>

                <p className="text-sm font-medium text-gray-600">
                  No meal entries yet
                </p>

                <p className="text-xs text-gray-400 max-w-xs">
                  There&apos;s no recorded meal
                  count for any date yet, so
                  there&apos;s nothing to edit
                  here. Enter today&apos;s meals
                  first from the meal entry page.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="p-5 space-y-4"
              >

                {/* ====================================
                    Date Select + Progress
                ==================================== */}

                <div className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3">

                  <div className="flex items-center gap-2 flex-1">
                    <CalendarDays
                      size={16}
                      className="text-indigo-600 shrink-0"
                    />

                    <select
                      value={date}
                      onChange={(e) =>
                        setDate(
                          e.target.value
                        )
                      }
                      className="w-full bg-transparent text-sm font-medium text-gray-700 focus:outline-none"
                      required
                    >
                      {editableDates.map(
                        (d) => (
                          <option
                            key={d}
                            value={d}
                          >
                            {d}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full whitespace-nowrap">
                    {filledCount}/
                    {members.length} entered
                  </span>
                </div>

                {/* ====================================
                    Member List
                ==================================== */}

                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">

                  {members.map(
                    (member) => (
                      <div
                        key={member.username}
                        className="flex justify-between items-center gap-3 px-3 py-2.5 bg-white hover:bg-gray-50 transition-colors"
                      >

                        {/*
                          UI SHOWS REAL NAME
                          but internally this
                          member is identified
                          by member.username
                        */}

                        <label className="text-sm font-medium text-gray-700 truncate capitalize">
                          {member?.name}
                        </label>

                        <input
                          list="meal-options"
                          type="number"
                          step="0.5"
                          min="0"
                          value={
                            Number.isNaN(
                              mealData[
                                member.username
                              ]
                            )
                              ? ""
                              : mealData[
                                  member.username
                                ] ?? ""
                          }
                          required
                          onChange={(e) =>
                            handleChange(
                              member.username,
                              e.target.value
                            )
                          }
                          className="w-24 p-1.5 text-xs border border-gray-200 rounded-md text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                          placeholder="0"
                        />
                      </div>
                    )
                  )}

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

                {/* ====================================
                    Submit
                ==================================== */}

                <button
                  type="submit"
                  disabled={
                    loadingOnSubmit
                  }
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingOnSubmit ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />

                      Updating...
                    </>
                  ) : (
                    "Update Meals"
                  )}
                </button>
              </form>
            )
          ) : (
            <div className="p-8 flex flex-col items-center text-center gap-2">
              <div className="bg-gray-100 rounded-full p-3">
                <Lock
                  size={20}
                  className="text-gray-400"
                />
              </div>

              <p className="text-sm font-medium text-gray-600">
                Restricted to managers
              </p>

              <p className="text-xs text-gray-400 max-w-xs">
                Only managers and assistant
                managers can edit daily meal
                entries.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default EditMealCountEntry;