import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Calendar, User, Wallet, ShoppingCart } from "lucide-react";
import useAuth from "../hooks/useAuth";
import type { UsersList } from "../services/DataTypes";

type FormData = {
  type: string;
  date: string;
  doer: string;
  amount: string;
};

const EnsertBazarCostsAPI = import.meta.env.VITE_INSERT_BAZAR_COSTS_API;

interface AuthContextType {
  userRole: string | null;
}

interface MemberNameList {
  memberNameList: string[];
}

const EntryBazarCosts: React.FC<MemberNameList> = ({
  memberNameList,
}) => {
  const [formData, setFormData] = useState<FormData>({
    type: "bazar",
    date: new Date().toISOString().split("T")[0],
    doer: "",
    amount: "",
  });

  const { houseMembers, userRole } = useAuth() as {
    houseMembers: UsersList;
    userRole: AuthContextType;
  };

  const [loadingOnSubmit, setLoadingOnSubmit] = useState(false);

  /*
   * Get the username part of email.
   *
   * Example:
   * ashikali0204@gmail.com
   *        ↓
   * ashikali0204
   */
  const getEmailUsername = (email: string) => {
    return email.split("@")[0].trim().toLowerCase();
  };

  /*
   * Create the member list for dropdown.
   *
   * memberNameList contains the members that should be displayed.
   *
   * houseMembers contains:
   * {
   *   name,
   *   email,
   *   ...
   * }
   *
   * Result:
   * {
   *   name: "Md. Ashik Ali",
   *   userID: "ashikali0204"
   * }
   */
  const members = memberNameList
    .map((memberName) => {
      const houseMember = houseMembers?.find(
        (member) =>
          member.name?.trim().toLowerCase() ===
          memberName.trim().toLowerCase()
      );

      if (!houseMember?.email) {
        return null;
      }

      return {
        name: houseMember.name,
        userID: getEmailUsername(houseMember.email),
      };
    })
    .filter(
      (
        member
      ): member is {
        name: string;
        userID: string;
      } => member !== null
    );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!formData.doer) {
      toast.error("Please select a member");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoadingOnSubmit(true);

    const loadingToast = toast.loading("Adding Bazar Cost...");

    try {
      const response = await fetch(EnsertBazarCostsAPI, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          type: "bazar",
          Date: formData.date,
          Doer: formData.doer,
          Amount: formData.amount,
        }).toString(),
      });

      if (!response.ok) {
        throw new Error("Failed to add bazar cost");
      }

      setFormData({
        type: "bazar",
        date: new Date().toISOString().split("T")[0],
        doer: "",
        amount: "",
      });

      toast.success("Bazar cost added successfully!", {
        id: loadingToast,
      });
    } catch (err) {
      console.error(err);

      toast.error("Failed to add bazar cost.", {
        id: loadingToast,
      });
    } finally {
      setLoadingOnSubmit(false);
    }
  };

  return (
    <>
      <section className="flex items-center justify-center px-3 py-10 sm:py-12">
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

        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-slate-100 p-5 sm:p-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3">
              <ShoppingCart className="w-6 h-6 text-indigo-600" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              বাজার খরচ এড করুন
            </h2>

            <p className="text-[11px] leading-relaxed text-slate-600 mt-1.5 max-w-md">
              বাজার করার তারিখ, কোন সদস্য বাজার করেছে এবং খরচের
              পরিমাণ যুক্ত করুন। সঠিক তথ্য দিয়ে ফর্মটি পূরণ করুন,
              যাতে হিসাব নির্ভুল থাকে।
            </p>
          </div>

          {userRole && (
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
            >
              {/* Date */}
              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  বাজারের তারিখ
                </label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Member Dropdown */}
              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  কে বাজার করেছে?
                </label>

                <select
                  name="doer"
                  value={formData.doer}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                >
                  <option value="">
                    সদস্য নির্বাচন করুন
                  </option>

                  {members.map((member) => (
                    <option
                      key={member.userID}
                      value={member.userID}
                    >
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5" />
                  কত টাকার বাজার (৳)
                </label>

                <input
                  type="number"
                  name="amount"
                  placeholder="টাকার পরিমাণ লিখুন"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="1"
                  step="0.01"
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Submit Button */}
              <div className="md:col-span-3 mt-2">
                <button
                  type="submit"
                  disabled={loadingOnSubmit}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] transition-all text-white text-sm font-semibold shadow-md shadow-indigo-200 disabled:opacity-50 disabled:active:scale-100"
                >
                  {loadingOnSubmit
                    ? "সাবমিট হচ্ছে..."
                    : "বাজার খরচ যুক্ত করুন"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
};

export default EntryBazarCosts;