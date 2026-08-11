/* eslint-disable react-hooks/exhaustive-deps */

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  User,
  Wallet,
  Pencil,
  Hash,
  RefreshCw,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

interface DepositEntry {
  trackingID: string;
  member: string;
  amount: number;
}

interface DepositGroup {
  trackingID: string;
  entries: DepositEntry[];
}

const EditMealDeposit = () => {
  const [formData, setFormData] = useState({
    trackingID: "",
    member: "",
    amount: "",
  });

  const [depositGroups, setDepositGroups] = useState<DepositGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Ref for the edit form container
  const formSectionRef = useRef<HTMLDivElement>(null);

  // Google Sheet CSV URL
  const MEAL_DEPOSIT_SHEET =
    import.meta.env.VITE_MEAL_DEPOSIT_SHEET_READER;

  // Apps Script edit URL
  const MEAL_DEPOSIT_EDIT_URL =
    import.meta.env.VITE_MEAL_DEPOSIT_EDIT;

  // ============================================================
  // CSV Parser
  // ============================================================

  const parseCSV = (text: string): string[][] => {
    const rows: string[][] = [];
    let row: string[] = [];
    let value = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (
        char === '"' &&
        insideQuotes &&
        nextChar === '"'
      ) {
        value += '"';
        i++;
      } else if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === "," && !insideQuotes) {
        row.push(value.trim());
        value = "";
      } else if (
        (char === "\n" || char === "\r") &&
        !insideQuotes
      ) {
        if (char === "\r" && nextChar === "\n") {
          i++;
        }

        row.push(value.trim());
        value = "";

        if (row.some((cell) => cell !== "")) {
          rows.push(row);
        }

        row = [];
      } else {
        value += char;
      }
    }

    // Last value/row
    if (value !== "" || row.length > 0) {
      row.push(value.trim());

      if (row.some((cell) => cell !== "")) {
        rows.push(row);
      }
    }

    return rows;
  };

  // ============================================================
  // Fetch deposit data
  // ============================================================

  const fetchDeposits = async () => {
    try {
      setFetching(true);

      const response = await fetch(MEAL_DEPOSIT_SHEET);
      const text = await response.text();

      const rows = parseCSV(text);


      if (rows.length < 1) {
        setDepositGroups([]);
        return;
      }

      // First column = trackingID
      const headers = rows[0];

      const trackingIDIndex = 0;

      // Store entries grouped by trackingID
      const grouped: Record<string, DepositEntry[]> = {};

      rows.slice(1).forEach((row) => {
        const trackingID = (
          row[trackingIDIndex] || ""
        ).trim();

        if (!trackingID) return;

        // Start from column 1 because column 0 is trackingID
        for (
          let colIndex = 1;
          colIndex < headers.length;
          colIndex++
        ) {
          const member = (
            headers[colIndex] || ""
          ).trim();

          if (!member) continue;

          const rawAmount = row[colIndex];

          if (
            rawAmount === undefined ||
            rawAmount === null ||
            rawAmount === ""
          ) {
            continue;
          }

          const amount = Number(rawAmount);

          if (isNaN(amount) || amount <= 0) {
            continue;
          }

          if (!grouped[trackingID]) {
            grouped[trackingID] = [];
          }

          grouped[trackingID].push({
            trackingID,
            member,
            amount,
          });
        }
      });

      const groups: DepositGroup[] = Object.entries(
        grouped
      ).map(([trackingID, entries]) => ({
        trackingID,
        entries,
      }));

      // Newest/latest tracking IDs first
      groups.reverse();

      setDepositGroups(groups);
    } catch (error) {
      console.error(
        "Failed to fetch meal deposits:",
        error
      );

      toast.error("মিল জমার তথ্য লোড করা যায়নি।");
    } finally {
      setFetching(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchDeposits();
  }, []);

  // ============================================================
  // Tracking IDs
  // ============================================================

  const trackingIDs = useMemo(() => {
    return depositGroups.map(
      (group) => group.trackingID
    );
  }, [depositGroups]);

  // ============================================================
  // Members available for selected tracking ID
  // ============================================================

  const selectedGroup = useMemo(() => {
    return depositGroups.find(
      (group) =>
        group.trackingID === formData.trackingID
    );
  }, [depositGroups, formData.trackingID]);

  const selectedMembers =
    selectedGroup?.entries || [];

  // ============================================================
  // Form change
  // ============================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // Tracking ID change
  // ============================================================

  const handleTrackingIDChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const trackingID = e.target.value;

    setFormData({
      trackingID,
      member: "",
      amount: "",
    });
  };

  // ============================================================
  // Member change
  // ============================================================

  const handleMemberChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const member = e.target.value;

    const selectedEntry = selectedMembers.find(
      (entry) => entry.member === member
    );

    setFormData({
      ...formData,
      member,
      amount: selectedEntry
        ? String(selectedEntry.amount)
        : "",
    });
  };

  // ============================================================
  // Scroll to edit form
  // ============================================================

  const scrollToEditForm = () => {
    // First try to scroll the actual form element into view
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    // Extra fallback for pages where the main scrolling
    // container is the window
    setTimeout(() => {
      if (formSectionRef.current) {
        const rect =
          formSectionRef.current.getBoundingClientRect();

        const absoluteTop =
          rect.top + window.pageYOffset;

        window.scrollTo({
          top: Math.max(0, absoluteTop - 20),
          behavior: "smooth",
        });
      }
    }, 100);
  };

  // ============================================================
  // Select entry and scroll to form
  // ============================================================

  const handleEditEntry = (
    entry: DepositEntry
  ) => {
    setFormData({
      trackingID: entry.trackingID,
      member: entry.member,
      amount: String(entry.amount),
    });

    // Wait until React updates the selected form values,
    // then scroll to the form.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToEditForm();
      });
    });
  };

  // ============================================================
  // Submit update
  // ============================================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (
      !formData.trackingID ||
      !formData.member ||
      !formData.amount
    ) {
      toast.error("অনুগ্রহ করে সব তথ্য পূরণ করুন।");
      return;
    }

    const amount = Number(formData.amount);

    if (isNaN(amount) || amount <= 0) {
      toast.error("সঠিক পরিমাণ লিখুন।");
      return;
    }

    try {
      setLoading(true);

      const loadingToast = toast.loading(
        "মিল জমা আপডেট হচ্ছে..."
      );

      const params = new URLSearchParams({
        type: "editLastMealDeposit",
        trackingID: formData.trackingID,
        member: formData.member,
        amount: formData.amount,
      });

      const response = await fetch(
        MEAL_DEPOSIT_EDIT_URL,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
          body: params,
        }
      );

      const result = await response.json();

      toast.dismiss(loadingToast);

      if (result.status === "success") {
        toast.success(
          result.message ||
            "মিল জমা সফলভাবে আপডেট হয়েছে।"
        );

        setFormData({
          trackingID: "",
          member: "",
          amount: "",
        });

        await fetchDeposits();

        // After successful update, return to form
        requestAnimationFrame(() => {
          scrollToEditForm();
        });
      } else {
        toast.error(
          result.message ||
            "মিল জমা আপডেট করা যায়নি।"
        );
      }
    } catch (error) {
      toast.error(
        "সার্ভার সমস্যা হয়েছে। আবার চেষ্টা করুন। " +
          (error as Error).message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col items-center px-3 py-8 sm:py-10">
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
      {/* ======================================================
          FORM SECTION
          ====================================================== */}

      <div
        ref={formSectionRef}
        className="w-full max-w-4xl scroll-mt-5"
      >
        <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-5 sm:p-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
              <Pencil className="w-6 h-6 text-amber-600" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              মিল জমা সম্পাদনা
            </h2>

            <p className="text-[11px] leading-relaxed text-slate-600 mt-1.5 max-w-md">
              প্রথমে ট্র্যাকিং আইডি নির্বাচন করুন।
              এরপর ঐ আইডির সদস্য নির্বাচন করে জমার
              পরিমাণ পরিবর্তন করুন।
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 mt-6"
          >
            {/* Tracking ID */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" />
                ট্র্যাকিং আইডি
              </label>

              <select
                name="trackingID"
                value={formData.trackingID}
                onChange={handleTrackingIDChange}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all capitalize"
                required
              >
                <option value="">
                  ট্র্যাকিং আইডি নির্বাচন করুন
                </option>

                {trackingIDs.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </div>

            {/* Member */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                সদস্যের নাম
              </label>

              <select
                name="member"
                value={formData.member}
                onChange={handleMemberChange}
                disabled={!formData.trackingID}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed capitalize"
                required
              >
                <option value="">
                  {formData.trackingID
                    ? "সদস্য নির্বাচন করুন"
                    : "প্রথমে ট্র্যাকিং আইডি নির্বাচন করুন"}
                </option>

                {selectedMembers.map((entry) => (
                  <option
                    key={`${entry.trackingID}-${entry.member}`}
                    value={entry.member}
                  >
                    {entry.member} — ৳{entry.amount}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Member & Current Amount */}
            {formData.member && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Selected Member */}
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-[10px] font-medium text-slate-400 mb-1">
                    নির্বাচিত সদস্য
                  </p>

                  <p className="text-xs font-semibold text-slate-700 truncate capitalize">
                    {formData.member}
                  </p>
                </div>

                {/* Current Amount */}
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-[10px] font-medium text-slate-400 mb-1">
                    বর্তমান জমা
                  </p>

                  <p className="text-sm font-bold text-amber-600">
                    ৳
                    {selectedMembers
                      .find(
                        (entry) =>
                          entry.member === formData.member
                      )
                      ?.amount?.toLocaleString() || "0"}
                  </p>
                </div>
              </div>
            )}

            {/* Changed Amount */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" />
                পরিবর্তিত জমার পরিমাণ (৳)
              </label>

              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="নতুন জমার পরিমাণ লিখুন"
                disabled={!formData.member}
                min="1"
                className="w-full p-3 rounded-xl bg-white border border-amber-200 text-slate-700 placeholder-slate-400 text-xs outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />

              {formData.member && formData.amount && (
                <p className="text-[10px] text-slate-400 mt-1.5">
                  বর্তমান ৳
                  {selectedMembers
                    .find(
                      (entry) =>
                        entry.member === formData.member
                    )
                    ?.amount?.toLocaleString() || "0"}{" "}
                  → পরিবর্তিত ৳
                  {Number(formData.amount).toLocaleString()}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={
                loading ||
                !formData.trackingID ||
                !formData.member ||
                !formData.amount
              }
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.99] transition-all text-white text-sm font-semibold shadow-md shadow-amber-200 disabled:opacity-60 disabled:active:scale-100 disabled:cursor-not-allowed"
            >
              {loading
                ? "আপডেট হচ্ছে..."
                : "মিল জমা আপডেট করুন"}
            </button>
          </form>


          {/* Refresh */}
          <button
            type="button"
            onClick={fetchDeposits}
            disabled={fetching}
            className="w-full mt-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-xs font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                fetching ? "animate-spin" : ""
              }`}
            />

            {fetching
              ? "তথ্য লোড হচ্ছে..."
              : "তথ্য রিফ্রেশ করুন"}
          </button>
        </div>
      </div>

      {/* ======================================================
          ALL DEPOSIT ENTRIES
          ====================================================== */}

      <div className="w-full max-w-4xl mt-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              সকল মিল জমার এন্ট্রি
            </h3>

            <p className="text-[10px] text-slate-500 mt-0.5">
              ট্র্যাকিং আইডি অনুযায়ী জমাগুলো দেখানো হচ্ছে
            </p>
          </div>

          <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
            {depositGroups.length} টি এন্ট্রি
          </span>
        </div>

        {fetching && depositGroups.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
            <RefreshCw className="w-5 h-5 mx-auto text-amber-500 animate-spin" />

            <p className="text-xs text-slate-500 mt-2">
              মিল জমার তথ্য লোড হচ্ছে...
            </p>
          </div>
        ) : depositGroups.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
            <p className="text-xs text-slate-500">
              কোনো মিল জমার এন্ট্রি পাওয়া যায়নি।
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {depositGroups.map((group) => {
              const groupTotal = group.entries.reduce(
                (sum, entry) =>
                  sum + entry.amount,
                0
              );

              return (
                <div
                  key={group.trackingID}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                >
                  {/* Group Header */}
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                        <Hash className="w-4 h-4 text-amber-600" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[9px] text-slate-400 uppercase tracking-wide">
                          Tracking ID
                        </p>

                        <p className="text-xs font-bold text-slate-700 truncate">
                          {group.trackingID}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-[9px] text-slate-400">
                        মোট
                      </p>

                      <p className="text-xs font-bold text-amber-600">
                        ৳{groupTotal.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Entries */}
                  <div className="divide-y divide-slate-100">
                    {group.entries.map((entry) => (
                      <div
                        key={`${entry.trackingID}-${entry.member}`}
                        className="px-4 py-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-slate-500" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-700 truncate capitalize">
                              {entry.member}
                            </p>

                            <p className="text-[9px] text-slate-400">
                              {entry.trackingID}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-slate-700">
                            ৳{entry.amount.toLocaleString()}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              handleEditEntry(entry)
                            }
                            className="p-1.5 rounded-lg text-amber-600 bg-amber-50 hover:bg-amber-100 transition-all"
                            title="Edit this Amount"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default EditMealDeposit;
