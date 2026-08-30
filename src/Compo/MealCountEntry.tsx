/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import {
  CalendarDays,
  UtensilsCrossed,
  Lock,
  Loader2,
  PowerOff,
  Eye,
} from "lucide-react";
import type { UsersList } from "../services/DataTypes";
import useAppData from "../hooks/useAppData";
import { Link } from "react-router-dom";

/* ==========================================
   Types
========================================== */

interface MealEntry {
  [username: string]: number;
}

interface MealOffMap {
  [username: string]: boolean;
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
   This component is ENTRY-ONLY.

   If the selected date already has a
   submitted entry, the form switches to a
   READ-ONLY view of what was entered —
   editing an already-entered date is not
   allowed here (use the separate Edit Meal
   Entry component for that).
========================================== */

const MealCountEntry: React.FC = () => {
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
     Local Date
  ========================================== */

  const getLocalDate = (): string => {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

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

     Example:

     {
       mdashika989: "",
       jamalhossain: "",
       ahmmedmiraj007: ""
     }
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
     LocalStorage helpers for "Meal Off"

     IMPORTANT:
     Meal Off is GLOBAL per member, NOT scoped
     to a single date. Once a manager marks a
     member off, that member stays marked off
     on every date they open next — the entry
     field stays disabled and pinned to 0 —
     until a manager explicitly unchecks them.
     There is no daily reset.

     Key: mealOff:members
     Value: ["mdashika989", "jamalhossain"]
  ========================================== */

  const MEAL_OFF_STORAGE_KEY =
    "mealOff:members";

  const loadMealOffFromStorage =
    (): MealOffMap => {
      try {
        const raw = window.localStorage.getItem(
          MEAL_OFF_STORAGE_KEY
        );

        if (!raw) return {};

        const usernames: string[] =
          JSON.parse(raw);

        return usernames.reduce(
          (acc, username) => {
            acc[username] = true;
            return acc;
          },
          {} as MealOffMap
        );
      } catch (err) {
        console.log(err)
        /* localStorage unavailable / corrupted — ignore */
        return {};
      }
    };

  const saveMealOffToStorage = (
    offMap: MealOffMap
  ) => {
    try {
      const usernames = Object.keys(
        offMap
      ).filter((username) => offMap[username]);

      if (usernames.length === 0) {
        window.localStorage.removeItem(
          MEAL_OFF_STORAGE_KEY
        );
      } else {
        window.localStorage.setItem(
          MEAL_OFF_STORAGE_KEY,
          JSON.stringify(usernames)
        );
      }
    } catch (err) {
      console.log(err)
      /* localStorage unavailable — ignore */
    }
  };

  /* ==========================================
     State
  ========================================== */

  const [mealData, setMealData] =
    useState<MealEntry>(
      createEmptyMealData()
    );

  const [mealOff, setMealOff] =
    useState<MealOffMap>({});

  /*
   * Remembers each member's last typed value
   * so turning "Meal Off" back off restores
   * what was there instead of leaving it at 0.
   */

  const [preOffValues, setPreOffValues] =
    useState<MealEntry>({});

  const [date, setDate] =
    useState<string>(
      getLocalDate()
    );

  const [loadingOnSubmit, setLoadingOnSubmit] =
    useState(false);

  /* ==========================================
     Existing entry for the selected date

     If this exists, the date is already
     submitted, so the component renders in
     READ-ONLY mode instead of an editable
     form.
  ========================================== */

  const existingEntry = useMemo(() => {
    const rows =
      Array.isArray(readMealCount?.data)
        ? readMealCount.data
        : [];

    return (
      rows.find(
        (row) =>
          String(row.date).trim() ===
          String(date).trim()
      ) || null
    );
  }, [readMealCount?.data, date]);

  const isReadOnly = !!existingEntry;

  /* ==========================================
     Filled Count
  ========================================== */

  const filledCount =
    Object.keys(mealData).filter(
      (username) =>
        mealData[username] !== undefined &&
        mealData[username] !== null &&
        !Number.isNaN(mealData[username])
    ).length;

  const offCount = Object.keys(
    mealOff
  ).filter((username) => mealOff[username])
    .length;

  /* ==========================================
     Load Data For Selected Date

     Two cases:

     1) Date already has a submitted entry
        -> populate mealData from it (read-only
           view), Meal Off is irrelevant here.

     2) Date is open for entry
        -> start from a blank sheet, then
           restore any Meal Off selections
           saved locally for this date and
           zero those members out.
  ========================================== */

  useEffect(() => {
    if (existingEntry) {
      const existingMeals =
        existingEntry.meals || {};

      const loadedMealData =
        members.reduce(
          (acc, member) => {
            const value =
              existingMeals[
                member.username
              ];

            acc[member.username] =
              value !== undefined &&
              value !== null
                ? Number(value)
                : 0;

            return acc;
          },
          {} as MealEntry
        );

      setMealData(loadedMealData);
      setMealOff({});
      setPreOffValues({});

      return;
    }

    /* ========================================
       Open date — start fresh, then reapply
       whichever members are globally marked
       Meal Off (persisted across every date
       until a manager unchecks them).
    ======================================== */

    const savedOffMap =
      loadMealOffFromStorage();

    const freshMealData =
      createEmptyMealData();

    members.forEach((member) => {
      if (savedOffMap[member.username]) {
        freshMealData[member.username] = 0;
      }
    });

    setMealData(freshMealData);
    setMealOff(savedOffMap);
    setPreOffValues({});
  }, [
    date,
    existingEntry,
    members,
  ]);

  /* ==========================================
     NOTE on persistence:

     Meal Off is saved to localStorage directly
     inside toggleMealOff (below) — NOT via a
     useEffect keyed on the mealOff state.

     An effect-based "resave on every change"
     approach is racy: on mount, the load effect
     above calls setMealOff(savedOffMap), but
     that update hasn't committed yet when this
     same render's effects run, so a persist
     effect would still see the OLD (empty)
     mealOff and immediately overwrite the
     freshly loaded data with nothing — which is
     exactly what was wiping out off-members when
     navigating back to this route. Saving
     directly in the click handler avoids that
     entirely.
  ========================================== */

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
     Toggle "Meal Off" For A Member

     Turning it ON:
     - remembers the current value in
       preOffValues
     - forces the field to 0 and disables it
     - saves the updated off-list to
       localStorage immediately (computed
       synchronously, not read back from state)

     Turning it OFF:
     - restores whatever value was there
       before (falls back to 0)
     - re-enables the field
     - removes this member from the stored
       off-list immediately
  ========================================== */

  const toggleMealOff = (
    username: string
  ) => {
    if (isReadOnly) return;

    const turningOff = !mealOff[username];

    /*
     * Compute the next map directly instead of
     * relying on the functional setState form,
     * so we have the exact final value to hand
     * to saveMealOffToStorage in this same call
     * — no effect, no race, no stale closure.
     */

    const nextMealOff: MealOffMap = {
      ...mealOff,
      [username]: turningOff,
    };

    setMealOff(nextMealOff);
    saveMealOffToStorage(nextMealOff);

    if (turningOff) {
      setPreOffValues((prev) => ({
        ...prev,
        [username]: mealData[username],
      }));

      setMealData((prev) => ({
        ...prev,
        [username]: 0,
      }));
    } else {
      setMealData((prev) => {
        const restored =
          preOffValues[username];

        return {
          ...prev,
          [username]:
            restored !== undefined &&
            !Number.isNaN(restored)
              ? restored
              : 0,
        };
      });
    }
  };

  /* ==========================================
     Submit Meal Data

     POST uses username:

     mdashika989=2.5
     jamalhossain=0

     NOT:

     Md Ashik Ali=2.5

     Members marked "Meal Off" are always
     posted as 0, regardless of what's in
     mealData (defensive — the field is
     already disabled/zeroed, this just makes
     sure a stale value can never sneak in).
  ========================================== */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (isReadOnly) return;

    setLoadingOnSubmit(true);

    const loadingToast =
      toast.loading(
        "Saving Meals..."
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
          .map((member) => {
            const value = mealOff[
              member.username
            ]
              ? 0
              : Number.isNaN(
                  mealData[
                    member.username
                  ]
                )
              ? 0
              : mealData[
                  member.username
                ] ?? 0;

            return `${encodeURIComponent(
              member.username
            )}=${encodeURIComponent(
              String(value)
            )}`;
          })
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
          "Failed to submit meal counts.",
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
      ======================================== */

      const updatedEntry: MealCountRow = {
        date,

        meals: Object.fromEntries(
          members.map((member) => {
            const value = mealOff[
              member.username
            ]
              ? 0
              : Number.isNaN(
                  mealData[
                    member.username
                  ]
                )
              ? 0
              : Number(
                  mealData[
                    member.username
                  ] ?? 0
                );

            return [member.username, value];
          })
        ),
      };

      /* ========================================
         Immediately update Context

         No page refresh required. This will
         also flip the component into read-only
         mode for this date on the next render,
         since existingEntry will now be found.
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

        let updatedData: MealCountRow[];

        if (existingIndex !== -1) {
          /* Existing date */

          updatedData = [
            ...currentData,
          ];

          updatedData[
            existingIndex
          ] = updatedEntry;
        } else {
          /* New date */

          updatedData = [
            ...currentData,
            updatedEntry,
          ];
        }

        return {
          ...(prev || {}),
          data: updatedData,
        };
      });

      /*
       * IMPORTANT: we deliberately do NOT clear
       * the global Meal Off list here. A member
       * marked off stays off for every future
       * date they're opened on — only an
       * explicit uncheck by a manager removes
       * them from the list. Local component
       * state is reset only because this date
       * is about to flip into read-only mode.
       */

      setMealOff({});
      setPreOffValues({});

      toast.success(
        "Meal counts saved successfully!",
        {
          id: loadingToast,
        }
      );
    } catch (error) {
      console.error(
        "Meal submission error:",
        error
      );

      toast.error(
        "Error submitting meal counts.",
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

        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">

          {/* Header */}

          <div className="bg-indigo-600 px-5 py-4 flex items-center gap-3">
            <div className="bg-white/15 rounded-lg p-2">
              <UtensilsCrossed
                size={20}
                className="text-white"
              />
            </div>

            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Daily Meal Entry
              </h2>

              <p className="text-[11px] text-indigo-100">
                {isReadOnly
                  ? "Viewing an already-submitted entry"
                  : "Record meal count for every member"}
              </p>
            </div>
          </div>

          {canEnter ? (
            <div className="p-5 space-y-4">

              {/* ====================================
                  Date + Progress
              ==================================== */}

              <div className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3">

                <div className="flex items-center gap-2 flex-1">
                  <CalendarDays
                    size={16}
                    className="text-indigo-600 shrink-0"
                  />

                  <input
                    type="date"
                    value={date}
                    onChange={(e) =>
                      setDate(
                        e.target.value
                      )
                    }
                    className="w-full bg-transparent text-sm font-medium text-gray-700 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  {offCount > 0 &&
                    !isReadOnly && (
                      <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full whitespace-nowrap">
                        {offCount} meal(s) off
                      </span>
                    )}

                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full whitespace-nowrap">
                    {filledCount}/
                    {members.length} entered
                  </span>
                </div>
              </div>

              {/* ====================================
                  Read-only notice
              ==================================== */}

              {isReadOnly && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 text-amber-700 text-xs rounded-xl p-3">
                  <Eye
                    size={14}
                    className="shrink-0 mt-0.5"
                  />

                  <span>
                    This date already has a
                    submitted entry, so it&apos;s
                    shown here read-only. Go to 
                    <Link to='/manager/edit-meal-count-entry' className="font-bold text-blue-500 "> Edit Meal Entry</Link> to make
                    changes.
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit}>

                {/* ====================================
                    Member List
                ==================================== */}

                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">

                  {members.map(
                    (member) => {
                      const isOff =
                        !!mealOff[
                          member.username
                        ];

                      return (
                        <div
                          key={member.username}
                          className={`flex justify-between items-center gap-3 px-3 py-2.5 transition-colors ${
                            isOff
                              ? "bg-red-50/60"
                              : "bg-white hover:bg-gray-50"
                          }`}
                        >

                          {/*
                            UI SHOWS REAL NAME
                            but internally this
                            member is identified
                            by member.username
                          */}

                          <label
                            className={`text-sm font-medium truncate capitalize ${
                              isOff
                                ? "text-red-400 "
                                : "text-gray-700"
                            }`}
                          >
                            {member?.name}
                          </label>

                          <div className="flex items-center gap-2 shrink-0">

                            {!isReadOnly && (
                              <button
                                type="button"
                                onClick={() =>
                                  toggleMealOff(
                                    member.username
                                  )
                                }
                                aria-pressed={isOff}
                                title={
                                  isOff
                                    ? "Meal off on every date until you turn it back on"
                                    : "Tap to mark off, stays off on every date until unchecked"
                                }
                                className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border transition-colors ${
                                  isOff
                                    ? "bg-red-500 border-red-500 text-white"
                                    : "bg-white border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500"
                                }`}
                              >
                                <PowerOff
                                  size={11}
                                />
                                Meal Off
                              </button>
                            )}

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
                              required={
                                !isReadOnly &&
                                !isOff
                              }
                              disabled={
                                isReadOnly ||
                                isOff
                              }
                              onChange={(e) =>
                                handleChange(
                                  member.username,
                                  e.target.value
                                )
                              }
                              className="w-20 p-1.5 text-xs border border-gray-200 rounded-md text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition disabled:bg-gray-100 disabled:text-gray-400"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      );
                    }
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

                {!isReadOnly && (
                  <button
                    type="submit"
                    disabled={
                      loadingOnSubmit
                    }
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {loadingOnSubmit ? (
                      <>
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />

                        Saving...
                      </>
                    ) : (
                      "Entry Meals"
                    )}
                  </button>
                )}
              </form>
            </div>
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
                managers can submit daily meal
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