import { Pencil } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import type { UsersList } from "../services/DataTypes";

const utilityDepositReadAPI =
  import.meta.env.VITE_UTILITY_DEPOSIT_SHEET_READER;

const utilityDepositUpdateAPI =
  import.meta.env.VITE_UTILITY_DEPOSIT_UPDATE_SHEET_WRITER;

interface UtilityDeposit {
  trackingID: string;
  member: string;
  amount: number;
}

const EditUtilityDeposit = () => {
  const [utilityDepositData, setUtilityDepositData] = useState<
    UtilityDeposit[]
  >([]);

  const [selectedTrackingID, setSelectedTrackingID] = useState("");

  const [selectedMember, setSelectedMember] = useState("");

  const [newAmount, setNewAmount] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { houseMembers } = useAuth() as {
    houseMembers: UsersList;
  };

  const showMemberName = (uid: string) => {
    return houseMembers.find(
      (hm) => hm.email.split("@")[0] === uid
    );
  };

  // =========================================================
  // FORM REF
  // Used to scroll to the form when editing an entry
  // =========================================================

  const formRef = useRef<HTMLFormElement>(null);

  // =========================================================
  // FETCH DATA
  // =========================================================

  const fetchUtilityDepositData = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(
        utilityDepositReadAPI
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch utility deposit data"
        );
      }

      const data = await response.text();

      const lines = data
        .split("\n")
        .map((line) =>
          line.replace(/\r/g, "").trim()
        )
        .filter((line) => line !== "");

      if (lines.length < 2) {
        setUtilityDepositData([]);
        return;
      }

      // First row = headers
      const headers = lines[0]
        .split(",")
        .map((header) => header.trim());

      // Skip trackingID
      const members = headers.slice(1);

      const formattedData: UtilityDeposit[] = [];

      // Every row = separate tracking ID
      for (
        let rowIndex = 1;
        rowIndex < lines.length;
        rowIndex++
      ) {
        const row = lines[rowIndex]
          .split(",")
          .map((value) => value.trim());

        const trackingID = row[0];

        if (!trackingID) continue;

        // Every non-empty member amount
        // = separate deposit
        members.forEach(
          (member, memberIndex) => {
            const amountValue =
              row[memberIndex + 1];

            if (
              amountValue === undefined ||
              amountValue === "" ||
              isNaN(Number(amountValue))
            ) {
              return;
            }

            formattedData.push({
              trackingID,
              member,
              amount: Number(amountValue),
            });
          }
        );
      }

      setUtilityDepositData(formattedData);
    } catch (error) {
      console.error(
        "Error fetching utility deposit data:",
        error
      );

      toast.error(
        "Failed to load utility deposit information."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUtilityDepositData();
  }, []);

  // =========================================================
  // UNIQUE TRACKING IDS
  // =========================================================

  const trackingIDs = useMemo(() => {
    return [
      ...new Set(
        utilityDepositData.map(
          (item) => item.trackingID
        )
      ),
    ];
  }, [utilityDepositData]);

  // =========================================================
  // MEMBERS FOR SELECTED TRACKING ID
  // =========================================================

  const membersForSelectedTracking =
    useMemo(() => {
      if (!selectedTrackingID) return [];

      return utilityDepositData.filter(
        (item) =>
          item.trackingID ===
          selectedTrackingID
      );
    }, [
      utilityDepositData,
      selectedTrackingID,
    ]);

  // =========================================================
  // SELECTED DEPOSIT
  // =========================================================

  const selectedDeposit = useMemo(() => {
    if (
      !selectedTrackingID ||
      !selectedMember
    ) {
      return null;
    }

    return (
      utilityDepositData.find(
        (item) =>
          item.trackingID ===
            selectedTrackingID &&
          item.member === selectedMember
      ) || null
    );
  }, [
    utilityDepositData,
    selectedTrackingID,
    selectedMember,
  ]);

  // =========================================================
  // TRACKING ID CHANGE
  // =========================================================

  const handleTrackingIDChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const trackingID = e.target.value;

    setSelectedTrackingID(trackingID);

    // Reset member and amount
    // when tracking ID changes
    setSelectedMember("");
    setNewAmount("");
  };

  // =========================================================
  // MEMBER CHANGE
  // =========================================================

  const handleMemberChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const member = e.target.value;

    setSelectedMember(member);

    const deposit =
      utilityDepositData.find(
        (item) =>
          item.trackingID ===
            selectedTrackingID &&
          item.member === member
      );

    if (deposit) {
      setNewAmount(String(deposit.amount));
    } else {
      setNewAmount("");
    }
  };

  // =========================================================
  // EDIT ENTRY
  //
  // Select exact tracking ID + member,
  // populate current amount,
  // then scroll to form.
  // =========================================================

  const handleEditEntry = (
    deposit: UtilityDeposit
  ) => {
    setSelectedTrackingID(
      deposit.trackingID
    );

    setSelectedMember(
      deposit.member
    );

    setNewAmount(
      String(deposit.amount)
    );

    // Wait for React state updates,
    // then scroll to the form.
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
  // SUBMIT UPDATE
  // =========================================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!selectedTrackingID) {
      toast.error(
        "Please select a Tracking ID."
      );
      return;
    }

    if (!selectedMember) {
      toast.error(
        "Please select a member."
      );
      return;
    }

    if (
      !newAmount ||
      Number(newAmount) < 0
    ) {
      toast.error(
        "Please enter a valid new deposit amount."
      );
      return;
    }

    if (!selectedDeposit) {
      toast.error(
        "The selected deposit information could not be found."
      );
      return;
    }

    // Don't update if amount is unchanged
    if (
      Number(newAmount) ===
      selectedDeposit.amount
    ) {
      toast.error(
        "The new amount is the same as the current amount."
      );
      return;
    }

    const loadingToast =
      toast.loading(
        "Updating deposit information..."
      );

    try {
      setIsSubmitting(true);

      const params =
        new URLSearchParams({
          type: "updateUtilityDeposit",
          trackingID:
            selectedTrackingID,
          member: selectedMember,
          amount: newAmount,
        });

      const response = await fetch(
        utilityDepositUpdateAPI,
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
          "Update request failed."
        );
      }

      const result =
        await response.json();

      if (
        result.status !== "success"
      ) {
        throw new Error(
          result.message ||
            "Failed to update the utility deposit."
        );
      }

      toast.dismiss(loadingToast);

      toast.success(
        `${showMemberName(selectedMember)?.name || selectedMember}'s deposit was updated successfully.`
      );

      // =====================================================
      // UPDATE LOCAL STATE IMMEDIATELY
      // =====================================================

      setUtilityDepositData(
        (previousData) =>
          previousData.map(
            (item) =>
              item.trackingID ===
                selectedTrackingID &&
              item.member ===
                selectedMember
                ? {
                    ...item,
                    amount:
                      Number(
                        newAmount
                      ),
                  }
                : item
          )
      );
    } catch (error) {
      console.error(
        "Error updating utility deposit:",
        error
      );

      toast.dismiss(loadingToast);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update the deposit information."
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
    setSelectedMember("");
    setNewAmount("");
  };

  // =========================================================
  // GROUP DATA BY TRACKING ID
  // =========================================================

  const groupedData = useMemo(() => {
    const groups: Record<
      string,
      UtilityDeposit[]
    > = {};

    utilityDepositData.forEach(
      (item) => {
        if (!groups[item.trackingID]) {
          groups[item.trackingID] = [];
        }

        groups[item.trackingID].push(
          item
        );
      }
    );

    return groups;
  }, [utilityDepositData]);

  // =========================================================
  // RENDER
  // =========================================================

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
          PAGE HEADER
      ====================================================== */}

      <div className="mb-6">
        <h1 className="text-lg font-bold text-[#2B2117]">
          Edit Utility Deposit
        </h1>

        <p className="mt-1 text-xs text-gray-500">
          Select a Tracking ID and member to
          update the deposit amount.
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
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-[#2B2117] focus:ring-1 focus:ring-[#2B2117] disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <option value="">
                Select Tracking ID
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

          {/* Member */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700">
              Member
            </label>

            <select
              value={selectedMember}
              onChange={
                handleMemberChange
              }
              disabled={
                !selectedTrackingID ||
                isSubmitting
              }
              className="w-full capitalize rounded-md border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-[#2B2117] focus:ring-1 focus:ring-[#2B2117] disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <option value="">
                Select Member
              </option>

              {membersForSelectedTracking.map(
                (item) => (
                  <option
                    key={`${item.trackingID}-${item.member}`}
                    value={item.member}
                  >
                    {showMemberName(item.member)?.name ||
                      item.member}{" "}
                    — ৳
                    {item.amount.toLocaleString()}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Current Amount */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700">
              Current Deposit Amount
            </label>

            <div className="flex h-[42px] items-center rounded-md border border-gray-200 bg-gray-100 px-3 text-xs font-semibold text-gray-700">
              {selectedDeposit
                ? `${selectedDeposit.amount.toLocaleString()} BDT`
                : "Select a member"}
            </div>
          </div>

          {/* New Amount */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700">
              Updated Deposit Amount
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
                !selectedDeposit ||
                isSubmitting
              }
              placeholder="Enter the new amount"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-[#2B2117] focus:ring-1 focus:ring-[#2B2117] disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Selected Information */}
        {selectedDeposit && (
          <div className="mt-5 rounded-lg border border-[#2B2117]/10 bg-white p-4">
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-4">

              {/* Tracking ID */}
              <div>
                <p className="text-gray-500 text-xs">
                  Tracking ID
                </p>

                <p className="font-semibold text-[#2B2117]">
                  {
                    selectedDeposit.trackingID
                  }
                </p>
              </div>

              {/* Member */}
              <div>
                <p className="text-gray-500 text-xs">
                  Member
                </p>

                <p className="font-semibold text-[#2B2117] capitalize">
                  {
                    showMemberName(
                      selectedDeposit.member
                    )?.name ||
                    selectedDeposit.member
                  }
                </p>
              </div>

              {/* Current Amount */}
              <div>
                <p className="text-gray-500 text-xs">
                  Current Deposit
                </p>

                <p className="font-semibold text-[#2B2117]">
                  {selectedDeposit.amount.toLocaleString()}{" "}
                  BDT
                </p>
              </div>

              {/* Changed Amount */}
              <div>
                <p className="text-gray-500 text-xs">
                  Updated Deposit
                </p>

                <p className="font-semibold text-orange-600">
                  {newAmount &&
                  !isNaN(
                    Number(newAmount)
                  )
                    ? `${Number(
                        newAmount
                      ).toLocaleString()} BDT`
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          {/* Reset */}
          <button
            type="button"
            onClick={handleReset}
            disabled={
              isSubmitting
            }
            className="rounded-md border border-red-300 bg-red-50 px-5 py-2.5 text-xs font-medium text-red-700 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>

          {/* Submit */}
          <button
            type="submit"
            disabled={
              isSubmitting ||
              !selectedDeposit ||
              !newAmount
            }
            className="rounded-md bg-orange-600 px-5 py-2.5 text-xs font-medium text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Updating..."
              : "Update Deposit"}
          </button>
        </div>
      </form>

      {/* =====================================================
          ALL DATA
      ====================================================== */}

      <div className="mt-8">

        {/* Section Header */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-md font-bold text-[#2B2117]">
              All Utility Deposits
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              All deposit records grouped by
              Tracking ID.
            </p>
          </div>

          <div className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            {utilityDepositData.length}{" "}
            Entries
          </div>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
            Loading information...
          </div>
        ) : Object.keys(
            groupedData
          ).length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
            No utility deposit records found.
          </div>
        ) : (
          <div className="space-y-4">

            {Object.entries(
              groupedData
            )
              .reverse()
              .map(
                ([
                  trackingID,
                  deposits,
                ]) => (
                  <div
                    key={trackingID}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                  >

                    {/* Tracking Header */}
                    <div className="flex flex-col gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

                      <div>
                        <p className="text-xs text-gray-500">
                          Tracking ID
                        </p>

                        <p className="font-bold text-[#2B2117]">
                          {trackingID}
                        </p>
                      </div>

                      <div className="text-sm text-gray-500">
                        {deposits.length}{" "}
                        {deposits.length === 1
                          ? "Deposit"
                          : "Deposits"}
                      </div>
                    </div>

                    {/* Deposit List */}
                    <div className="divide-y divide-gray-100">

                      {deposits.map(
                        (deposit) => (
                          <div
                            key={`${deposit.trackingID}-${deposit.member}`}
                            className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                          >

                            {/* Member */}
                            <div>
                              <p className="text-sm font-medium text-gray-800 capitalize">
                                {
                                  showMemberName(
                                    deposit.member
                                  )?.name ||
                                  deposit.member
                                }
                              </p>

                              <p className="text-xs text-gray-500">
                                {
                                  deposit.trackingID
                                }
                              </p>
                            </div>

                            {/* Amount + Edit */}
                            <div className="flex items-center justify-between gap-3 sm:justify-end">

                              <div className="text-sm font-bold text-[#2B2117]">
                                {deposit.amount.toLocaleString()}{" "}
                                <span className="text-xs font-normal text-gray-500">
                                  BDT
                                </span>
                              </div>

                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleEditEntry(
                                    deposit
                                  )
                                }
                                disabled={
                                  isSubmitting
                                }
                                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-orange-50 px-3 py-2 text-xs font-medium text-orange-600 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Edit this deposit"
                              >
                                <span className="text-sm">
                                  <Pencil size={15} />
                                </span>

                                Edit
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditUtilityDeposit;