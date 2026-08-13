
import { Pencil } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const utilityCostReadAPI =
  import.meta.env.VITE_UTILITY_COSTS_SHEET_READER;

const utilityCostUpdateAPI =
  import.meta.env.VITE_UTILITY_COSTS_UPDATE_SHEET_WRITER;

interface UtilityCost {
  trackingID: string;
  costSection: string;
  amount: number;
}

const EditUtilityCosts = () => {
  const [utilityCostData, setUtilityCostData] = useState<
    UtilityCost[]
  >([]);

  const [selectedTrackingID, setSelectedTrackingID] =
    useState("");

  const [newAmount, setNewAmount] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =========================================================
  // FORM REF
  // Used to scroll back to the edit form when editing an entry
  // =========================================================

  const formRef = useRef<HTMLFormElement>(null);

  // =========================================================
  // FETCH UTILITY COST DATA
  // =========================================================

  const fetchUtilityCostData = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(utilityCostReadAPI);

      if (!response.ok) {
        throw new Error(
          "Failed to fetch utility cost data"
        );
      }

      const data = await response.text();

      // Remove \r and empty lines
      const lines = data
        .split("\n")
        .map((line) =>
          line.replace(/\r/g, "").trim()
        )
        .filter((line) => line !== "");

      if (lines.length < 2) {
        setUtilityCostData([]);
        return;
      }

      // =====================================================
      // HEADER
      // trackingID,Cost Section,Amount
      // =====================================================

      const headers = lines[0]
        .split(",")
        .map((header) => header.trim());

      console.log(
        "Utility Cost Headers:",
        headers
      );

      const formattedData: UtilityCost[] = [];

      // =====================================================
      // EACH ROW = ONE COST ENTRY
      // =====================================================

      for (
        let rowIndex = 1;
        rowIndex < lines.length;
        rowIndex++
      ) {
        const row = lines[rowIndex]
          .split(",")
          .map((value) => value.trim());

        const trackingID = row[0];
        const costSection = row[1];
        const amountValue = row[2];

        if (!trackingID || !costSection) {
          continue;
        }

        if (
          amountValue === undefined ||
          amountValue === "" ||
          isNaN(Number(amountValue))
        ) {
          continue;
        }

        formattedData.push({
          trackingID,
          costSection,
          amount: Number(amountValue),
        });
      }

      setUtilityCostData(formattedData);
    } catch (error) {
      console.error(
        "Error fetching utility cost data:",
        error
      );

      toast.error(
        "ইউটিলিটি খরচের তথ্য লোড করা যায়নি"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUtilityCostData();
  }, []);

  // =========================================================
  // SELECTED COST
  // =========================================================

  const selectedCost = useMemo(() => {
    if (!selectedTrackingID) {
      return null;
    }

    return (
      utilityCostData.find(
        (item) =>
          item.trackingID ===
          selectedTrackingID
      ) || null
    );
  }, [
    utilityCostData,
    selectedTrackingID,
  ]);

  // =========================================================
  // TRACKING IDs
  //
  // Latest first
  // =========================================================

  const trackingIDs = useMemo(() => {
    return utilityCostData
      .map((item) => item.trackingID)
      .reverse();
  }, [utilityCostData]);

  // =========================================================
  // TRACKING ID CHANGE
  // =========================================================

  const handleTrackingIDChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const trackingID = e.target.value;

    setSelectedTrackingID(trackingID);

    const cost = utilityCostData.find(
      (item) =>
        item.trackingID === trackingID
    );

    if (cost) {
      setNewAmount(String(cost.amount));
    } else {
      setNewAmount("");
    }
  };

  // =========================================================
  // EDIT ENTRY
  //
  // Select the entry and scroll to the form
  // =========================================================

  const handleEditEntry = (
    cost: UtilityCost
  ) => {
    setSelectedTrackingID(cost.trackingID);
    setNewAmount(String(cost.amount));

    // Wait for React state update, then scroll
    // to the edit form.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });
  };

  // =========================================================
  // UPDATE UTILITY COST
  // =========================================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!selectedTrackingID) {
      toast.error("Tracking ID নির্বাচন করুন");
      return;
    }

    if (!selectedCost) {
      toast.error(
        "নির্বাচিত Tracking ID-এর তথ্য পাওয়া যায়নি"
      );
      return;
    }

    if (
      newAmount === "" ||
      isNaN(Number(newAmount)) ||
      Number(newAmount) < 0
    ) {
      toast.error(
        "সঠিক নতুন খরচের পরিমাণ দিন"
      );
      return;
    }

    // No need to update if amount hasn't changed
    if (
      Number(newAmount) ===
      selectedCost.amount
    ) {
      toast.error(
        "নতুন পরিমাণ বর্তমান পরিমাণের সমান"
      );
      return;
    }

    const loadingToast = toast.loading(
      "ইউটিলিটি খরচ আপডেট হচ্ছে..."
    );

    try {
      setIsSubmitting(true);

      const params = new URLSearchParams({
        type: "updateUtilityCost",
        trackingID: selectedTrackingID,
        amount: newAmount,
      });

      const response = await fetch(
        `${utilityCostUpdateAPI}`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
          body: params,
        }
      );

      if (!response.ok) {
        throw new Error(
          "Update request failed"
        );
      }

      const result = await response.json();

      if (result.status !== "success") {
        throw new Error(
          result.message ||
            "Failed to update utility cost"
        );
      }

      toast.dismiss(loadingToast);

      toast.success(
        "ইউটিলিটি খরচ সফলভাবে আপডেট হয়েছে"
      );

      // =====================================================
      // UPDATE LOCAL STATE
      // =====================================================

      setUtilityCostData((previousData) =>
        previousData.map((item) =>
          item.trackingID ===
          selectedTrackingID
            ? {
                ...item,
                amount: Number(newAmount),
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Error updating utility cost:",
        error
      );

      toast.dismiss(loadingToast);

      toast.error(
        error instanceof Error
          ? error.message
          : "ইউটিলিটি খরচ আপডেট করা যায়নি"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const handleReset = () => {
    setSelectedTrackingID("");
    setNewAmount("");
  };

  return (
    <div className="w-full bg-white p-4 sm:p-6">
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

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-6">
        <h1 className="text-lg font-bold text-[#2B2117]">
          ইউটিলিটি খরচ সম্পাদনা
        </h1>

        <p className="mt-1 text-xs text-gray-500">
          Tracking ID নির্বাচন করে নির্দিষ্ট
          ইউটিলিটি খরচের পরিমাণ পরিবর্তন করুন।
        </p>
      </div>

      {/* =====================================================
          EDIT FORM
      ====================================================== */}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="scroll-mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-6"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* Tracking ID */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Tracking ID
            </label>

            <select
              value={selectedTrackingID}
              onChange={
                handleTrackingIDChange
              }
              disabled={
                isLoading ||
                isSubmitting
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-[#2B2117] focus:ring-1 focus:ring-[#2B2117] disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <option value="">
                Tracking ID নির্বাচন করুন
              </option>

              {trackingIDs.map(
                (trackingID) => (
                  <option
                    key={trackingID}
                    value={trackingID}
                  >
                    {trackingID}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Cost Section */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700">
              খরচের বিভাগ
            </label>

            <div className="flex min-h-[42px] items-center rounded-lg border border-gray-200 bg-gray-100 px-3 text-xs font-semibold text-gray-700">
              {selectedCost
                ? selectedCost.costSection
                : "Tracking ID নির্বাচন করুন"}
            </div>
          </div>

          {/* Current Amount */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700">
              বর্তমান খরচ
            </label>

            <div className="flex min-h-[42px] items-center rounded-lg border border-gray-200 bg-gray-100 px-3 text-xs font-semibold text-gray-700">
              {selectedCost
                ? `${selectedCost.amount.toLocaleString()} টাকা`
                : "Tracking ID নির্বাচন করুন"}
            </div>
          </div>

          {/* New Amount */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700">
              নতুন খরচের পরিমাণ
            </label>

            <input
              type="number"
              min="0"
              step="any"
              value={newAmount}
              onChange={(e) =>
                setNewAmount(
                  e.target.value
                )
              }
              disabled={
                !selectedCost ||
                isSubmitting
              }
              placeholder="নতুন পরিমাণ লিখুন"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-[#2B2117] focus:ring-1 focus:ring-[#2B2117] disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Selected Information */}
        {selectedCost && (
          <div className="mt-5 rounded-lg border border-[#2B2117]/10 bg-white p-4">
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-4">

              <div>
                <p className="text-gray-500 text-xs">
                  Tracking ID
                </p>

                <p className="font-semibold text-[#2B2117]">
                  {selectedCost.trackingID}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-xs">
                  খরচের বিভাগ
                </p>

                <p className="font-semibold text-[#2B2117]">
                  {selectedCost.costSection}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-xs">
                  বর্তমান খরচ
                </p>

                <p className="font-semibold text-[#2B2117]">
                  {selectedCost.amount.toLocaleString()}{" "}
                  টাকা
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-xs">
                  পরিবর্তিত খরচ
                </p>

                <p className="font-semibold text-orange-600">
                  {newAmount &&
                  !isNaN(Number(newAmount))
                    ? `${Number(
                        newAmount
                      ).toLocaleString()} টাকা`
                    : "—"}
                </p>
              </div>

            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            className="rounded-md border border-red-300 bg-red-50 px-5 py-2.5 text-xs font-medium text-gray-700 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            রিসেট
          </button>

          <button
            type="submit"
            disabled={
              isSubmitting ||
              !selectedCost ||
              !newAmount
            }
            className="rounded-md bg-orange-600 px-5 py-2.5 text-xs font-medium text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "আপডেট হচ্ছে..."
              : "খরচ আপডেট করুন"}
          </button>

        </div>
      </form>

      {/* =====================================================
          ALL UTILITY COSTS
      ====================================================== */}

      <div className="mt-8">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-md font-bold text-[#2B2117]">
              সকল ইউটিলিটি খরচ
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              সর্বশেষ খরচটি প্রথমে দেখানো হচ্ছে
            </p>
          </div>

          <div className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            মোট {utilityCostData.length} টি
            এন্ট্রি
          </div>

        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-8 text-center text-xs text-gray-500">
            ইউটিলিটি খরচের তথ্য লোড হচ্ছে...
          </div>
        ) : utilityCostData.length === 0 ? (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-8 text-center text-xs text-gray-500">
            কোনো ইউটিলিটি খরচের তথ্য পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

            {/* Table Header */}
            <div className="hidden grid-cols-4 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:grid">
              <div>Tracking ID</div>

              <div>
                খরচের বিভাগ
              </div>

              <div className="text-right">
                পরিমাণ
              </div>

              <div className="text-right">
                Action
              </div>
            </div>

            {/* Latest first */}
            <div className="divide-y divide-gray-100">

              {utilityCostData
                .slice()
                .reverse()
                .map((cost) => (
                  <div
                    key={cost.trackingID}
                    className="grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-4 sm:items-center"
                  >

                    {/* Tracking ID */}
                    <div>
                      <p className="text-xs text-gray-400 sm:hidden">
                        Tracking ID
                      </p>

                      <p className="text-sm font-bold text-[#2B2117]">
                        {cost.trackingID}
                      </p>
                    </div>

                    {/* Cost Section */}
                    <div>
                      <p className="text-xs text-gray-400 sm:hidden">
                        খরচের বিভাগ
                      </p>

                      <p className="text-sm font-medium text-gray-800">
                        {cost.costSection}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="sm:text-right">
                      <p className="text-xs text-gray-400 sm:hidden">
                        পরিমাণ
                      </p>

                      <p className="text-sm font-bold text-[#2B2117]">
                        {cost.amount.toLocaleString()}{" "}
                        টাকা
                      </p>
                    </div>

                    {/* Edit Button */}
                    <div className="flex sm:justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          handleEditEntry(cost)
                        }
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md bg-orange-50 px-3 py-2 text-xs font-medium text-orange-600 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
                        title="এই খরচ সম্পাদনা করুন"
                      >
                        <span className="text-sm">
                          <Pencil size={15} />
                        </span>
                        Edit
                      </button>
                    </div>

                  </div>
                ))}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditUtilityCosts;
