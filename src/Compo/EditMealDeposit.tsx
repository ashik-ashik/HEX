/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { FaUser, FaMoneyBillWave, FaEdit } from "react-icons/fa";
import { toast } from "react-hot-toast";

interface MemberNameList{memberNameList:string[]}
const EditMealDeposit: React.FC< MemberNameList> = ({ memberNameList}) => {
    
  const [formData, setFormData] = useState({
    member: "",
    amount: "",
  });

  const [loading, setLoading] = useState(false);

  // Replace with your Apps Script Web App URL
  const MEAL_DEPOSIT_EDIT_URL = import.meta.env.VITE_MEAL_DEPOSIT_EDIT;


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
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
      toast.error("Server error. Please try again. ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-100 p-3 rounded-xl">
            <FaEdit className="text-blue-600 text-xl" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Edit Meal Deposit
            </h2>
            <p className="text-sm text-gray-500">
              Update the latest deposit entry for a member
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Member Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Member Name
            </label>

            <div className="relative">
              <FaUser className="absolute left-4 top-4 text-gray-400" />

              <div className="relative">
                <FaUser className="absolute left-4 top-4 text-gray-400 z-10" />

                <select
                    name="member"
                    value={formData.member}
                    onChange={(e) =>
                    setFormData({
                        ...formData,
                        member: e.target.value,
                    })
                    }
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                    required
                >
                    <option value="">Select Member Name</option>

                    {memberNameList?.map((member: string, index: number) => (
                    <option key={index} value={member}>
                        {member}
                    </option>
                    ))}
                </select>
                </div>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Replace Last Deposit Amount
            </label>

            <div className="relative">
              <FaMoneyBillWave className="absolute left-4 top-4 text-gray-400" />

              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter updated amount"
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white transition duration-200 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Updating..." : "Update Meal Deposit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditMealDeposit;