import React, { useState } from "react";
import { FaCalendarAlt, FaUser, FaMoneyBillWave, FaEdit } from "react-icons/fa";
import { toast } from "react-hot-toast";



interface MemberNameList{memberNameList:string[]}


const BAZAR_CONST_EDIT_URL = import.meta.env.VITE_BAZAR_COSTS_EDIT;

const EditLastBazarCost: React.FC< MemberNameList> = ({ memberNameList}) => {
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
    //   `Are you sure you want to update the last bazar cost?\n\nDate: ${formData.date}\nMember: ${formData.doer}\nAmount: ৳${formData.amount}`
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
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8 my-24">
      <div className="flex items-center gap-3 mb-6">
        <FaEdit className="text-blue-600 text-2xl" />
        <h2 className="text-2xl font-bold text-gray-800">
          Edit Last Bazar Cost
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Date */}
        <div>
          <label className="block font-medium mb-2 text-sm text-gray-700">
            Date
          </label>

          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-4 text-gray-400" />

            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Member Select */}
        <div>
          <label className="block font-medium mb-2 text-sm text-gray-700">
            Member Name
          </label>

          <div className="relative">
            <FaUser className="absolute left-3 top-4 text-gray-400" />

            <select
              name="doer"
              value={formData.doer}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              <option value="">Select Member</option>

             {memberNameList?.map((member: string, index: number) => (
                    <option key={index} value={member}>
                        {member}
                    </option>
                    ))}
            </select>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block font-medium mb-2 text-sm text-gray-700">
            Amount
          </label>

          <div className="relative">
            <FaMoneyBillWave className="absolute left-3 top-4 text-gray-400" />

            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition duration-200 disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update Last Bazar Cost"}
        </button>
      </form>
    </div>
  );
}


export default EditLastBazarCost;