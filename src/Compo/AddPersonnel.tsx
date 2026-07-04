/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  UserPlus,
  Users,
  Briefcase,
  Loader2,
  Mail,
  ShieldCheck,
  Image as ImageIcon,
  Tag,
  User,
  Phone,
  Repeat,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface Personnel {
  designation: string;
  name: string;
  mobile?: string;
  photo?: string;
}

const DEFAULT_MEMBER_PHOTO = "https://i.postimg.cc/yN6zyD1X/member.jpg";
const DEFAULT_PERSONNEL_PHOTO = "https://i.postimg.cc/yN6zyD1X/member.jpg";

const AddPersonnel: React.FC = () => {
  // Existing personnel list, used only for the "replace by mobile" dropdown
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [loadingPersonnel, setLoadingPersonnel] = useState(true);

  const [type, setType] = useState<"member" | "personnel">("member");

  // ----- Member (add) fields -----
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<"member" | "manager" | "assist_manager">("member");
  const [memberPhoto, setMemberPhoto] = useState("");

  // ----- Personnel (add / replace) fields -----
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [selectedPersonnelMobile, setSelectedPersonnelMobile] = useState("");
  const [personnelDesignation, setPersonnelDesignation] = useState("");
  const [personnelName, setPersonnelName] = useState("");
  const [personnelMobile, setPersonnelMobile] = useState("");
  const [personnelPhoto, setPersonnelPhoto] = useState("");

  const [loading, setLoading] = useState(false);

  // Load existing personnel (for the replace-by-mobile dropdown only)
  useEffect(() => {
    const fetchPersonnel = () => {
      fetch(import.meta.env.VITE_PERSONNEL_SHEET_READER)
        .then((res) => res.text())
        .then((text) => {
          const rows = text.split("\n").slice(1);

          const parsed = rows
            .map((row) => row.split(","))
            .filter((row) => row[1])
            .map((row) => ({
              designation: row[0]?.trim(),
              name: row[1]?.trim(),
              mobile: row[2]?.trim(),
              photo: row[3]?.trim(),
            }))
            // Only "other" personnel (not dynamic members) are replaceable here,
            // and they need a mobile number to be matched against on the backend
            .filter((p) => p.designation !== "Member" && p.designation !== "Manager" && p.mobile);

          setPersonnelList(parsed);
          setLoadingPersonnel(false);
        })
        .catch(() => {
          setLoadingPersonnel(false);
        });
    };

    fetchPersonnel();
  }, []);

  const resetMemberForm = () => {
    setMemberName("");
    setMemberEmail("");
    setMemberRole("member");
    setMemberPhoto("");
  };

  const resetPersonnelForm = () => {
    setReplaceExisting(false);
    setSelectedPersonnelMobile("");
    setPersonnelDesignation("");
    setPersonnelName("");
    setPersonnelMobile("");
    setPersonnelPhoto("");
  };

  const postPayload = async (payload: Record<string, any>) => {
    const body = new URLSearchParams();
    Object.entries(payload).forEach(([key, value]) => {
      body.append(key, String(value ?? ""));
    });

    toast.loading("Saving...", { id: "personnel" });

    const res = await fetch(import.meta.env.VITE_PERSONNEL_INSERT_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data = await res.json();
    toast.dismiss("personnel");

    if (data.status === "success") {
      toast.success(data.message);
    } else {
      toast.error(data.message);
    }
  };

  // ----- Submit: Member -----
  const handleSubmitMember = async () => {
    if (!memberName) {
      toast.error("Please enter member name");
      return;
    }
    if (!memberEmail) {
      toast.error("Please enter member email");
      return;
    }

    // POST payload structure (backend: type === "addMember")
    // {
    //   type: "addMember",
    //   name: string,
    //   email: string,
    //   role: "member" | "manager" | "assist_manager",
    //   photo: string
    // }
    const payload = {
      type: "addMember",
      name: memberName,
      email: memberEmail,
      role: memberRole,
      photo: memberPhoto || DEFAULT_MEMBER_PHOTO,
    };

    try {
      setLoading(true);
      await postPayload(payload);
      resetMemberForm();
    } catch (error) {
      console.error(error);
      toast.error("Failed to Add Member");
    } finally {
      setLoading(false);
    }
  };

  // ----- Submit: Personnel (add or replace) -----
  const handleSubmitPersonnel = async () => {
    if (!personnelName) {
      toast.error("Please enter personnel name");
      return;
    }

    if (replaceExisting && !selectedPersonnelMobile) {
      toast.error("Select the personnel to replace");
      return;
    }

    // POST payload structure:
    //
    // Replace existing (backend: type === "replacePersonnel")
    // Backend should look up the row where `mobile` === targetMobile and overwrite it.
    // {
    //   type: "replacePersonnel",
    //   targetMobile: string,   // mobile of the personnel being replaced (lookup key)
    //   designation: string,
    //   name: string,
    //   mobile: string,         // new mobile number
    //   photo: string
    // }
    //
    // Add new (backend: type === "addPersonnel")
    // {
    //   type: "addPersonnel",
    //   designation: string,
    //   name: string,
    //   mobile: string,
    //   photo: string
    // }
    const payload = replaceExisting
      ? {
          type: "replacePersonnel",
          targetMobile: selectedPersonnelMobile,
          designation: personnelDesignation,
          name: personnelName,
          mobile: personnelMobile,
          photo: personnelPhoto || DEFAULT_PERSONNEL_PHOTO,
        }
      : {
          type: "addPersonnel",
          designation: personnelDesignation,
          name: personnelName,
          mobile: personnelMobile,
          photo: personnelPhoto || DEFAULT_PERSONNEL_PHOTO,
        };

    try {
      setLoading(true);
      await postPayload(payload);
      resetPersonnelForm();
    } catch (error) {
      console.error(error);
      toast.error("Failed to Add Personnel");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (type === "member") {
      handleSubmitMember();
    } else {
      handleSubmitPersonnel();
    }
  };

  return (
    <section className="flex items-center justify-center px-3 py-10 sm:py-12">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            fontSize: "14px",
          },
        }}
      />

      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-slate-100 p-5 sm:p-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3">
            <UserPlus className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
            সদস্য / কর্মী যুক্ত করুন
          </h2>
        </div>

        {/* Type Selection */}
        <div className="grid grid-cols-2 gap-3 mt-6 mb-2">
          <button
            type="button"
            onClick={() => setType("member")}
            className={`p-3.5 rounded-xl border-2 flex items-center gap-2 justify-center text-sm font-semibold transition-all ${
              type === "member"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Users className="w-4 h-4" /> সদস্য
          </button>

          <button
            type="button"
            onClick={() => setType("personnel")}
            className={`p-3.5 rounded-xl border-2 flex items-center gap-2 justify-center text-sm font-semibold transition-all ${
              type === "personnel"
                ? "bg-teal-50 border-teal-500 text-teal-700"
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Briefcase className="w-4 h-4" /> অন্যান্য কর্মী
          </button>
        </div>

        {/* Tab description */}
        {type === "member" ? (
          <p className="text-[10px] leading-relaxed text-slate-400 text-center max-w-lg mx-auto mb-6">
            ম্যানুয়ালি সদস্য যুক্ত করার অপশনটি সবার জন্য উন্মুক্ত নয়, এটি শুধু
            হিসাব-নিকাশ ঠিক রাখার উদ্দেশ্যে ব্যবহৃত হয়।
          </p>
        ) : (
          <p className="text-[10px] leading-relaxed text-slate-400 text-center max-w-lg mx-auto mb-6">
            নতুন কর্মী যুক্ত করুন, অথবা চাইলে বিদ্যমান কাউকে পরিবর্তন করতে
            পারবেন। কাউকে পরিবর্তন করতে চাইলে চেকবক্স নির্বাচন করে নতুন কর্মীর
            তথ্য পূরণ করুন।
          </p>
        )}

        {/* Member Form */}
        {type === "member" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  নাম
                </label>
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value.trim())}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="সদস্যের নাম লিখুন"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  ইমেইল
                </label>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value.trim())}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="member@example.com"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                রোল
              </label>
              <select
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={memberRole}
                onChange={(e) =>
                  setMemberRole(e.target.value as "member" | "manager" | "assist_manager")
                }
              >
                <option value="member">Member</option>
                <option value="manager">Manager</option>
                <option value="assist_manager">Assistant Manager</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                ছবির লিংক
              </label>
              <input
                type="text"
                value={memberPhoto}
                onChange={(e) => setMemberPhoto(e.target.value.trim())}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="ঐচ্ছিক"
              />
              <p className="text-[10px] text-slate-400 mt-2">
                ছবি আপলোড করে সরাসরি লিংক নিন{" "}
                <a
                  href="https://postimg.cc/gallery/BH8xHfn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-500 underline"
                >
                  এখানে
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Personnel Form */}
        {type === "personnel" && (
          <div className="space-y-4">
            <label className="flex items-center gap-2.5 p-3.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-all">
              <input
                type="checkbox"
                checked={replaceExisting}
                onChange={(e) => {
                  setReplaceExisting(e.target.checked);
                  setSelectedPersonnelMobile("");
                }}
                className="w-4 h-4 accent-teal-600"
              />
              <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5" />
                বিদ্যমান কর্মী পরিবর্তন করতে চান?
              </span>
            </label>

            {replaceExisting && (
              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-500 mb-1.5">
                  পরিবর্তনের জন্য কর্মী নির্বাচন করুন
                </label>

                {loadingPersonnel ? (
                  <div className="flex items-center gap-2 p-3 text-slate-400 text-xs">
                    <Loader2 className="animate-spin" size={14} /> লোড হচ্ছে...
                  </div>
                ) : (
                  <select
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    value={selectedPersonnelMobile}
                    onChange={(e) => setSelectedPersonnelMobile(e.target.value.trim())}
                  >
                    <option value="">মোবাইল নম্বর অনুযায়ী নির্বাচন করুন</option>
                    {personnelList.map((p, index) => (
                      <option key={index} value={p.mobile}>
                        {p.name} ({p.designation}) - {p.mobile}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  পদবি
                </label>
                <input
                  type="text"
                  placeholder="খালা / পেপার বয় / ওয়াটার ম্যান"
                  value={personnelDesignation}
                  onChange={(e) => setPersonnelDesignation(e.target.value.trim())}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  কর্মীর নাম
                </label>
                <input
                  type="text"
                  value={personnelName}
                  onChange={(e) => setPersonnelName(e.target.value.trim())}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="কর্মীর নাম লিখুন"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                মোবাইল
              </label>
              <input
                type="text"
                value={personnelMobile}
                onChange={(e) => setPersonnelMobile(e.target.value.trim())}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                placeholder="01XXXXXXXXX"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                ছবির লিংক
              </label>
              <input
                type="text"
                value={personnelPhoto}
                onChange={(e) => setPersonnelPhoto(e.target.value.trim())}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                placeholder="ঐচ্ছিক"
              />
              <p className="text-[10px] text-slate-400 mt-2">
                ছবি আপলোড করে সরাসরি লিংক নিন{" "}
                <a
                  href="https://postimg.cc/gallery/BH8xHfn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 underline"
                >
                  এখানে
                </a>
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full mt-6 py-3.5 rounded-xl text-white text-sm font-semibold shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:active:scale-100 disabled:opacity-60 ${
            type === "member"
              ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
              : "bg-teal-600 hover:bg-teal-700 shadow-teal-200"
          }`}
        >
          {loading && <Loader2 className="animate-spin" size={16} />}
          {type === "member" ? "সদস্য সংরক্ষণ করুন" : "কর্মী সংরক্ষণ করুন"}
        </button>
      </div>
    </section>
  );
};

export default AddPersonnel;