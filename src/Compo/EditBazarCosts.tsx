import React, { useState } from "react";
import { Calendar, User, Wallet, Pencil } from "lucide-react";
import { toast } from "react-hot-toast";

interface MemberNameList {
  memberNameList: string[];
}

const BAZAR_CONST_EDIT_URL = import.meta.env.VITE_BAZAR_COSTS_EDIT;

const EditLastBazarCost: React.FC<MemberNameList> = ({ memberNameList }) => {
  const [formData, setFormData] = useState({
    date: "",
    doer: "",
    amount: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date || !formData.doer || !formData.amount) {
      toast.error("Please fill all required fields");
      return;
    }

    // const confirmEdit = window.confirm(
    //   `Are you sure you want to update the last bazar cost?\n\nDate: ${formData.date}\nMember: ${formData.doer}\nAmount: ৳ ${formData.amount}`
    // );

    // if (!confirmEdit) return;

    try {
      setLoading(true);
      const loadingToast = toast.loading("Updating last bazar cost...");

      const params = new URLSearchParams({
        type: "EditLastBazarCost",
        Date: formData.date,
        Doer: formData.doer,
        Amount: formData.amount,
      });

      const response = await fetch(BAZAR_CONST_EDIT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      const result = await response.json();

      toast.dismiss(loadingToast);

      if (result.status === "success") {
        toast.success(result.message || "Bazar cost updated successfully");

        setFormData({
          date: "",
          doer: "",
          amount: "",
        });
      } else {
        toast.error(result.message || "Failed to update bazar cost");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
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
          <h2 className="text-lg sm:text-xl font-bold text-slate-800">
            সর্বশেষ বাজার খরচ সম্পাদনা
          </h2>
          <p className="text-[11px] leading-relaxed text-slate-600 mt-1.5 max-w-md">
            এই ফর্মটি শুধুমাত্র সর্বশেষ যুক্ত করা বাজার খরচের এন্ট্রিটি
            পরিবর্তন করবে। এর আগের কোনো এন্ট্রি এর মাধ্যমে সম্পাদনা করা যাবে
            না, তাই তথ্য দেওয়ার আগে ভালোভাবে নিশ্চিত হয়ে নিন।
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Date */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              তারিখ
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              required
            />
          </div>

          {/* Member Select */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              সদস্যের নাম
            </label>
            <select
              name="doer"
              value={formData.doer}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
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
              পরিমাণ (৳)
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="টাকার পরিমাণ লিখুন"
              min="0"
              step="0.01"
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.99] transition-all text-white text-sm font-semibold shadow-md shadow-amber-200 disabled:opacity-60 disabled:active:scale-100"
          >
            {loading ? "আপডেট হচ্ছে..." : "সর্বশেষ বাজার খরচ আপডেট করুন"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default EditLastBazarCost;