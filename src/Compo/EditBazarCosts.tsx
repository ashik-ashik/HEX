import React, {
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Calendar,
  User,
  Wallet,
  Pencil,
  Hash,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import useAppData from "../hooks/useAppData";
import type { BazarCostResponse, UsersList } from "../services/DataTypes";
import useAuth from "../hooks/useAuth";



interface BazarCost {
  trackingID: string;
  date: string;
  name: string;
  amount: string | number;
}

interface AppDataContext {
  bazarCosts: BazarCostResponse;
  setBazarCosts?: React.Dispatch<
    React.SetStateAction<BazarCostResponse>
  >;
}

const BAZAR_COST_EDIT_URL =
  import.meta.env.VITE_BAZAR_COSTS_EDIT;

const EditLastBazarCost= () => {
  // =========================================================
  // APP DATA
  // =========================================================

  const { bazarCosts, setBazarCosts } =
    useAppData() as AppDataContext;
    const {houseMembers} = useAuth () as {houseMembers: UsersList}

    const showMemberName = (uid: string) => {
    return houseMembers.find(hm => hm.email.split('@')[0] === uid)
  }

  /*
   * bazarCosts.data:
   *
   * [
   *   {
   *     trackingID: "Bco289611",
   *     date: "Aug 01, 2026",
   *     name: "Mynul Islam",
   *     amount: "2980"
   *   },
   *   ...
   * ]
   */


  // =========================================================
  // FORM STATE
  // =========================================================

  const [formData, setFormData] = useState({
    trackingID: "",
    date: "",
    name: "",
    amount: "",
  });

  const [loading, setLoading] = useState(false);

  // =========================================================
  // FORM REF
  // =========================================================

  const formRef = useRef<HTMLFormElement>(null);

  // =========================================================
  // SELECTED ENTRY
  // =========================================================

  const selectedEntry = useMemo(() => {
    if (!formData.trackingID) {
      return null;
    }

    return (
      bazarCosts?.data.find(
        (entry) =>
          entry.trackingID ===
          formData.trackingID
      ) || null
    );
  }, [
    bazarCosts, formData
  ]);

  // =========================================================
  // TRACKING IDS
  // =========================================================

  const trackingIDs = useMemo(() => {
    return bazarCosts?.data
      .map((entry) => entry.trackingID)
      .reverse();
  }, [bazarCosts]);

  // =========================================================
  // HANDLE FORM CHANGE
  // =========================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // TRACKING ID CHANGE
  // =========================================================

  const handleTrackingIDChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const trackingID = e.target.value;

    const entry = bazarCosts?.data.find(
      (item) =>
        item.trackingID === trackingID
    );

    if (entry) {
      setFormData({
        trackingID: entry.trackingID,
        date: entry.date,
        name: entry.name,
        amount: String(entry.amount),
      });
    } else {
      setFormData({
        trackingID,
        date: "",
        name: "",
        amount: "",
      });
    }
  };

  // =========================================================
  // EDIT ENTRY
  // =========================================================

  const handleEditEntry = (
    entry: BazarCost
  ) => {
    setFormData({
      trackingID: entry.trackingID,
      date: entry.date,
      name: entry.name,
      amount: String(entry.amount),
    });

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
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !formData.trackingID ||
      !formData.date ||
      !formData.name ||
      !formData.amount
    ) {
      toast.error(
        "সব প্রয়োজনীয় তথ্য পূরণ করুন"
      );
      return;
    }

    const amount = Number(
      formData.amount
    );

    if (
      Number.isNaN(amount) ||
      amount < 0
    ) {
      toast.error(
        "সঠিক টাকার পরিমাণ দিন"
      );
      return;
    }

    if (!selectedEntry) {
      toast.error(
        "নির্বাচিত বাজার খরচের তথ্য পাওয়া যায়নি"
      );
      return;
    }

    const previousAmount = Number(
      selectedEntry.amount
    );

    // =====================================================
    // CHECK WHETHER ANYTHING CHANGED
    // =====================================================

    if (
      selectedEntry.date ===
        formData.date &&
      selectedEntry.name ===
        formData.name &&
      previousAmount === amount
    ) {
      toast.error(
        "কোনো তথ্য পরিবর্তন করা হয়নি"
      );
      return;
    }

    try {
      setLoading(true);

      const loadingToast =
        toast.loading(
          "বাজার খরচ আপডেট হচ্ছে..."
        );

      // =====================================================
      // SEND TO APPS SCRIPT
      // =====================================================

      const params =
        new URLSearchParams({
          type: "handleEditBazarCost",
          trackingID:
            formData.trackingID,
          Date: formData.date,
          Doer: formData.name,
          Amount: formData.amount,
        });

      const response =
        await fetch(
          BAZAR_COST_EDIT_URL,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded",
            },
            body: params,
          }
        );

      const result =
        await response.json();

      toast.dismiss(
        loadingToast
      );

      if (
        result.status ===
        "success"
      ) {
        toast.success(
          result.message ||
            "বাজার খরচ সফলভাবে আপডেট হয়েছে"
        );

        // =================================================
        // UPDATE HOOK LOCAL STATE
        // =================================================

        if (setBazarCosts) {
          setBazarCosts(
            (previousData) => ({
              ...previousData,

              data:
                previousData.data.map(
                  (entry) =>
                    entry.trackingID ===
                    formData.trackingID
                      ? {
                          ...entry,
                          date:
                            formData.date,
                          name:
                            formData.name,
                          amount:
                            String(
                              amount
                            ),
                        }
                      : entry
                ),
            })
          );
        }

        // Keep updated data visible
        setFormData({
          trackingID:
            formData.trackingID,
          date: formData.date,
          name: formData.name,
          amount:
            formData.amount,
        });
      } else {
        toast.error(
          result.message ||
            "বাজার খরচ আপডেট করা যায়নি"
        );
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "সার্ভারে সমস্যা হয়েছে"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const handleReset = () => {
    setFormData({
      trackingID: "",
      date: "",
      name: "",
      amount: "",
    });
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <section className="w-full bg-white px-3 py-8 sm:px-6 sm:py-10">
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
        }}
      />

      <div className="w-full max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
            <Pencil className="w-6 h-6 text-amber-600" />
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-800">
            বাজার খরচ সম্পাদনা
          </h2>

          <p className="text-[11px] leading-relaxed text-slate-600 mt-1.5 max-w-md">
            Tracking ID নির্বাচন করে যেকোনো
            বাজার খরচের তারিখ, সদস্য এবং
            পরিমাণ পরিবর্তন করতে পারবেন।
          </p>
        </div>

        {/* FORM */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="scroll-mt-5 w-full mx-auto bg-white rounded-xl shadow-xl border border-slate-100 p-5 sm:p-8"
        >
          {/* Tracking ID */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" />
              ট্র্যাকিং আইডি
            </label>

            <select
              name="trackingID"
              value={
                formData.trackingID
              }
              onChange={
                handleTrackingIDChange
              }
              disabled={loading}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all disabled:opacity-50"
              required
            >
              <option value="">
                ট্র্যাকিং আইডি নির্বাচন করুন
              </option>

              {trackingIDs?.map(
                (id) => (
                  <option
                    key={id}
                    value={id}
                  >
                    {id}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Current Entry Information */}
          {selectedEntry && (
            <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                <div>
                  <p className="text-[10px] text-slate-400 mb-1">
                    বর্তমান তারিখ
                  </p>

                  <p className="text-xs font-semibold text-slate-700">
                    {selectedEntry.date}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 mb-1">
                    সদস্য
                  </p>

                  <p className="text-xs font-semibold text-slate-700">
                    {selectedEntry.name}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 mb-1">
                    বর্তমান খরচ
                  </p>

                  <p className="text-sm font-bold text-amber-600">
                    ৳
                    {Number(
                      selectedEntry.amount
                    ).toLocaleString()}
                  </p>
                </div>

              </div>
            </div>
          )}

          <div className="space-y-4 mt-5">

            {/* Date */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                তারিখ পরিবর্তন করুন
              </label>

              <input
                type="date"
                name="date"
                value={
                  formData.date
                }
                onChange={
                  handleChange
                }
                disabled={
                  !formData.trackingID ||
                  loading
                }
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all disabled:opacity-50"
                required
              />
            </div>

            {/* Member */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                সদস্য
              </label>

              <select
                name="name"
                value={
                  formData.name
                }
                onChange={
                  handleChange
                }
                disabled={
                  !formData.trackingID ||
                  loading
                }
                className="w-full capitalize p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all disabled:opacity-50"
                required
              >
                <option value="">
                  সদস্য নির্বাচন করুন
                </option>

                {houseMembers?.map(
                  (
                    member,
                    index
                  ) => (
                    <option
                      key={index}
                      value={member?.email?.split("@")[0]}
                    >
                      {member?.name}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Amount */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" />
                পরিবর্তিত পরিমাণ (৳)
              </label>

              <input
                type="number"
                name="amount"
                value={
                  formData.amount
                }
                onChange={
                  handleChange
                }
                placeholder="নতুন টাকার পরিমাণ লিখুন"
                min="0"
                step="0.01"
                disabled={
                  !formData.trackingID ||
                  loading
                }
                className="w-full p-3 rounded-xl bg-white border border-amber-200 text-slate-700 placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all disabled:opacity-50"
                required
              />

              {selectedEntry &&
                formData.amount && (
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    বর্তমান ৳
                    {Number(
                      selectedEntry.amount
                    ).toLocaleString()}
                    {" → "}
                    পরিবর্তিত ৳
                    {Number(
                      formData.amount
                    ).toLocaleString()}
                  </p>
                )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3">

              <button
                type="button"
                onClick={
                  handleReset
                }
                disabled={loading}
                className="flex-1 py-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold transition-all disabled:opacity-50"
              >
                রিসেট
              </button>

              <button
                type="submit"
                disabled={
                  loading ||
                  !formData.trackingID ||
                  !formData.date ||
                  !formData.name ||
                  !formData.amount
                }
                className="flex-1 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.99] transition-all text-white text-sm font-semibold shadow-md shadow-amber-200 disabled:opacity-60 disabled:active:scale-100 disabled:cursor-not-allowed"
              >
                {loading
                  ? "আপডেট হচ্ছে..."
                  : "বাজার খরচ আপডেট করুন"}
              </button>

            </div>
          </div>
        </form>

        {/* ALL BAZAR COST ENTRIES */}
        <div className="mt-8">

          {/* List Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <h3 className="text-md font-bold text-slate-800">
                সকল বাজার খরচ
              </h3>

              <p className="text-[11px] text-slate-500 mt-1">
                যেকোনো এন্ট্রি সম্পাদনা করতে
                পাশে থাকা সম্পাদনা বাটনে ক্লিক করুন।
              </p>
            </div>

            <div className="w-fit px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
              মোট{" "}
              {bazarCosts?.data.length}{" "}
              টি এন্ট্রি
            </div>
          </div>

          {/* Empty */}
          {bazarCosts?.data.length ===
          0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-xs text-slate-500">
                কোনো বাজার খরচের তথ্য পাওয়া যায়নি।
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border border-slate-200 bg-white">

              {/* Desktop Header */}
              <div className="hidden sm:grid sm:grid-cols-5 gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                <div>Tracking ID</div>
                <div>তারিখ</div>
                <div>সদস্য</div>
                <div className="text-right">
                  পরিমাণ
                </div>
                <div className="text-right">
                  অ্যাকশন
                </div>
              </div>

              {/* Entries */}
              <div className="divide-y divide-slate-100">

                {bazarCosts?.data
                  .slice()
                  .reverse()
                  .map(
                    (entry) => (
                      <div
                        key={
                          entry.trackingID
                        }
                        className="grid grid-cols-1 sm:grid-cols-5 gap-3 px-4 py-4 sm:items-center hover:bg-slate-50/70 transition-all"
                      >

                        {/* Tracking ID */}
                        <div>
                          <p className="text-[10px] text-slate-400 sm:hidden mb-1">
                            Tracking ID
                          </p>

                          <p className="text-xs font-bold text-slate-700">
                            {
                              entry.trackingID
                            }
                          </p>
                        </div>

                        {/* Date */}
                        <div>
                          <p className="text-[10px] text-slate-400 sm:hidden mb-1">
                            তারিখ
                          </p>

                          <p className="text-xs font-medium text-slate-700">
                            {entry.date}
                          </p>
                        </div>

                        {/* Name */}
                        <div>
                          <p className="text-[10px] text-slate-400 sm:hidden mb-1">
                            সদস্য
                          </p>

                          <p className="text-xs font-medium text-slate-700 capitalize">
                            {
                              showMemberName(entry.name)?.name
                            }
                          </p>
                        </div>

                        {/* Amount */}
                        <div className="sm:text-right">
                          <p className="text-[10px] text-slate-400 sm:hidden mb-1">
                            পরিমাণ
                          </p>

                          <p className="text-sm font-bold text-amber-600">
                            ৳
                            {Number(
                              entry.amount
                            ).toLocaleString()}
                          </p>
                        </div>

                        {/* Edit */}
                        <div className="flex sm:justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              handleEditEntry(
                                entry
                              )
                            }
                            disabled={
                              loading
                            }
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="এই এন্ট্রি সম্পাদনা করুন"
                          >
                            <Pencil size={15} />
                            Edit
                          </button>
                        </div>

                      </div>
                    )
                  )}

              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default EditLastBazarCost;