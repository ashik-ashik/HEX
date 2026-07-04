import React, { useState } from "react";
import { User, Wallet, Pencil } from "lucide-react";
import { toast } from "react-hot-toast";

interface MemberNameList {
  memberNameList: string[];
}

const EditMealDeposit: React.FC<MemberNameList> = ({ memberNameList }) => {
  const [formData, setFormData] = useState({
    member: "",
    amount: "",
  });

  const [loading, setLoading] = useState(false);

  // Replace with your Apps Script Web App URL
  const MEAL_DEPOSIT_EDIT_URL = import.meta.env.VITE_MEAL_DEPOSIT_EDIT;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.member || !formData.amount) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      const loadingToast = toast.loading("Updating meal deposit...");

      const params = new URLSearchParams({
        type: "editLastMealDeposit",
        member: formData.member,
        amount: formData.amount,
      });

      const response = await fetch(MEAL_DEPOSIT_EDIT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      const result = await response.json();

      toast.dismiss(loadingToast);

      if (result.status === "success") {
        toast.success(result.message || "Deposit updated successfully");

        setFormData({
          member: "",
          amount: "",
        });
      } else {
        toast.error(result.message || "Something went wrong");
      }
    } catch (error) {
      toast.error("Server error. Please try again. "+ (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex items-center justify-center px-3 py-10 sm:py-12">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-slate-100 p-5 sm:p-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
            <Pencil className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
            মিল জমা সম্পাদনা
          </h2>
          <p className="text-[11px] leading-relaxed text-slate-600 mt-1.5 max-w-md">
            এই ফর্মটি প্রতিটি সদস্যের ক্ষেত্রে শুধুমাত্র সর্বশেষ যুক্ত করা জমার
            পরিমাণটি পরিবর্তন করবে। এর আগের কোনো জমার এন্ট্রি এর মাধ্যমে
            সম্পাদনা করা যাবে না, তাই তথ্য দেওয়ার আগে ভালোভাবে নিশ্চিত হয়ে
            নিন।
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Member Name */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              সদস্যের নাম
            </label>
            <select
              name="member"
              value={formData.member}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  member: e.target.value,
                })
              }
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              required
            >
              <option value="">সদস্য নির্বাচন করুন</option>
              {memberNameList?.map((member: string, index: number) => (
                <option key={index} value={member}>
                  {member}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5" />
              সর্বশেষ জমার পরিমাণ পরিবর্তন করুন (৳)
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="আপডেটকৃত পরিমাণ লিখুন"
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 text-xs outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.99] transition-all text-white text-sm font-semibold shadow-md shadow-amber-200 disabled:opacity-60 disabled:active:scale-100"
          >
            {loading ? "আপডেট হচ্ছে..." : "মিল জমা আপডেট করুন"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default EditMealDeposit;