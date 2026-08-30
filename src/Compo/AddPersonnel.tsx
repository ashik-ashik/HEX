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
  Info,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface Personnel {
  designation: string;
  name: string;
  mobile?: string;
  photo?: string;
}



const DEFAULT_MEMBER_PHOTO =
  "https://i.postimg.cc/yN6zyD1X/member.jpg";

const DEFAULT_PERSONNEL_PHOTO =
  "https://i.postimg.cc/yN6zyD1X/member.jpg";

const AddPersonnel: React.FC = () => {
  // ============================================================
  // EXISTING PERSONNEL
  // ============================================================

  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [loadingPersonnel, setLoadingPersonnel] = useState(true);

  // ============================================================
  // TYPE
  // ============================================================

  const [type, setType] = useState<"member" | "personnel">("member");

  // ============================================================
  // MEMBER FIELDS
  // ============================================================

  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");

  const [memberRole, setMemberRole] = useState<
    "member" | "manager" | "assist_manager"
  >("member");

  const [memberPhoto, setMemberPhoto] = useState("");

  // ============================================================
  // PERSONNEL FIELDS
  // ============================================================

  const [replaceExisting, setReplaceExisting] = useState(false);

  const [
    selectedPersonnelMobile,
    setSelectedPersonnelMobile,
  ] = useState("");

  const [
    personnelDesignation,
    setPersonnelDesignation,
  ] = useState("");

  const [personnelName, setPersonnelName] = useState("");

  const [personnelMobile, setPersonnelMobile] = useState("");

  const [personnelPhoto, setPersonnelPhoto] = useState("");

  // ============================================================
  // LOADING
  // ============================================================

  const [loading, setLoading] = useState(false);

  // ============================================================
  // LOAD EXISTING PERSONNEL
  // ============================================================

  useEffect(() => {
    const fetchPersonnel = async () => {
      try {
        setLoadingPersonnel(true);

        const url =
          import.meta.env.VITE_PERSONNEL_SHEET_READER;

        if (!url) {
          throw new Error(
            "Personnel reader API URL is missing."
          );
        }

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(
            `Failed to load personnel: ${res.status}`
          );
        }

        const text = await res.text();

        const rows = text
          .split("\n")
          .slice(1);

        const parsed = rows
          .map((row) => row.split(","))
          .filter((row) => row[1])
          .map((row) => ({
            designation: row[0]?.trim() || "",
            name: row[1]?.trim() || "",
            mobile: row[2]?.trim() || "",
            photo: row[3]?.trim() || "",
          }))
          .filter(
            (p) =>
              p.designation !== "Member" &&
              p.designation !== "Manager" &&
              p.mobile
          );

        setPersonnelList(parsed);
      } catch (error) {
        console.error(
          "Failed to load personnel:",
          error
        );

        setPersonnelList([]);
      } finally {
        setLoadingPersonnel(false);
      }
    };

    fetchPersonnel();
  }, []);

  // ============================================================
  // RESET FORMS
  // ============================================================

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

  // ============================================================
  // POST DATA
  // ============================================================

  const postPayload = async (
    payload: Record<string, any>
  ) => {
    const apiUrl =
      import.meta.env.VITE_PERSONNEL_INSERT_API;

    if (!apiUrl) {
      throw new Error(
        "Personnel insert API URL is missing."
      );
    }

    const body = new URLSearchParams();

    Object.entries(payload).forEach(
      ([key, value]) => {
        body.append(
          key,
          String(value ?? "")
        );
      }
    );

    const controller =
      new AbortController();

    const timeoutId =
      window.setTimeout(() => {
        controller.abort();
      }, 20000);

    try {
      console.log(
        "Sending payload:",
        Object.fromEntries(body.entries())
      );

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: body.toString(),
        signal: controller.signal,
      });

      // Read as TEXT first.
      // This prevents immediate JSON parsing errors.
      const text = await res.text();

      console.log(
        "Apps Script response status:",
        res.status
      );

      console.log(
        "Apps Script response text:",
        text
      );

      if (!res.ok) {
        throw new Error(
          `Server returned error ${res.status}`
        );
      }

      if (!text.trim()) {
        throw new Error(
          "Server returned an empty response."
        );
      }

      let data: string;

      try {
        data = JSON.parse(text);
        console.log(data)
      } catch (parseError) {
        console.error(
          "JSON parsing failed:",
          parseError
        );

        console.error(
          "Raw server response:",
          text
        );

        throw new Error(
          "Server response is not valid JSON."
        );
      }

      console.log(
        "Parsed response:",
        data
      );

      if (
        data &&
        data.toLowerCase() === "success"
      ) {
        return data;
      }

      
    } catch (error: any) {
      console.error(
        "Personnel API error:",
        error
      );

      if (error?.name === "AbortError") {
        throw new Error(
          "Request timed out. The server may be busy."
        );
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error(
        "Cannot connect to server."
      );
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  // ============================================================
  // SUBMIT MEMBER
  // ============================================================

  const handleSubmitMember = async () => {
    // Prevent duplicate request
    if (loading) return;

    if (!memberName.trim()) {
      toast.error(
        "Please enter the member name."
      );
      return;
    }

    if (!memberEmail.trim()) {
      toast.error(
        "Please enter the member email."
      );
      return;
    }

    const payload = {
      type: "addMember",
      name: memberName.trim(),
      email: memberEmail.trim(),
      role: memberRole,
      photo:
        memberPhoto.trim() ||
        DEFAULT_MEMBER_PHOTO,
    };

    const toastId = "personnel";

    try {
      setLoading(true);

      toast.loading("Saving member...", {
        id: toastId,
      });

      const result = await postPayload(payload);
      console.log(result)
      toast.success(        
          "Member added successfully.",
        {
          id: toastId,
        }
      );

      // Reset only after confirmed success
      resetMemberForm();
    } catch (error: any) {
      console.error(
        "Failed to add member:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to add member.",
        {
          id: toastId,
        }
      );
    } finally {
      // ALWAYS stop button spinner
      setLoading(false);
    }
  };

  // ============================================================
  // SUBMIT PERSONNEL
  // ============================================================

  const handleSubmitPersonnel = async () => {
    // Prevent duplicate request
    if (loading) return;

    if (!personnelName.trim()) {
      toast.error(
        "Please enter the personnel name."
      );
      return;
    }

    if (
      replaceExisting &&
      !selectedPersonnelMobile.trim()
    ) {
      toast.error(
        "Please select the personnel to replace."
      );
      return;
    }

    const payload = replaceExisting
      ? {
          type: "replacePersonnel",
          targetMobile:
            selectedPersonnelMobile.trim(),
          designation:
            personnelDesignation.trim(),
          name: personnelName.trim(),
          mobile: personnelMobile.trim(),
          photo:
            personnelPhoto.trim() ||
            DEFAULT_PERSONNEL_PHOTO,
        }
      : {
          type: "addPersonnel",
          designation:
            personnelDesignation.trim(),
          name: personnelName.trim(),
          mobile: personnelMobile.trim(),
          photo:
            personnelPhoto.trim() ||
            DEFAULT_PERSONNEL_PHOTO,
        };

    const toastId = "personnel";

    try {
      setLoading(true);

      toast.loading(
        replaceExisting
          ? "Replacing personnel..."
          : "Saving personnel...",
        {
          id: toastId,
        }
      );

      const result =
        await postPayload(payload);
        console.log(result)

      toast.success(
        result ||
          (replaceExisting
            ? "Personnel replaced successfully."
            : "Personnel added successfully."),
        {
          id: toastId,
        }
      );

      // Reset only after confirmed success
      resetPersonnelForm();
    } catch (error: any) {
      console.error(
        "Failed to save personnel:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to save personnel.",
        {
          id: toastId,
        }
      );
    } finally {
      // ALWAYS stop button spinner
      setLoading(false);
    }
  };

  // ============================================================
  // MAIN SUBMIT
  // ============================================================

  const handleSubmit = async () => {
    if (loading) return;

    if (type === "member") {
      await handleSubmitMember();
    } else {
      await handleSubmitPersonnel();
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
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
          duration: 3000,
          style: {
            borderRadius: "12px",
            fontSize: "14px",
          },
        }}
      />

      <div className="w-full max-w-3xl rounded-3xl border border-slate-100 bg-white p-5 shadow-xl sm:p-8">

        {/* HEADER */}

        <div className="mb-2 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
            <UserPlus className="h-6 w-6 text-indigo-600" />
          </div>

          <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">
            Add Member / Personnel
          </h2>

          <p className="mt-1.5 max-w-lg text-[11px] leading-relaxed text-slate-500">
            Add a house member or manage other
            personnel associated with the house.
          </p>
        </div>

        {/* TYPE SELECTION */}

        <div className="mb-2 mt-6 grid grid-cols-2 gap-3">

          <button
            type="button"
            disabled={loading}
            onClick={() =>
              setType("member")
            }
            className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3.5 text-sm font-semibold transition-all disabled:opacity-60 ${
              type === "member"
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Users className="h-4 w-4" />
            Member
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() =>
              setType("personnel")
            }
            className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3.5 text-sm font-semibold transition-all disabled:opacity-60 ${
              type === "personnel"
                ? "border-teal-500 bg-teal-50 text-teal-700"
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Other Personnel
          </button>
        </div>

        {/* TAB DESCRIPTION */}

        {type === "member" ? (
          <div className="mb-6 mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
            <div className="flex items-start gap-2.5">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

              <div>
                <p className="text-xs font-semibold text-amber-800">
                  Important: Member Registration
                </p>

                <p className="mt-1 text-[10px] leading-relaxed text-amber-700">
                  Manually adding a member is not the
                  recommended way to register a house
                  member. Members should normally
                  participate through the login system
                  using their own account.
                </p>

                <p className="mt-2 text-[10px] leading-relaxed text-amber-700">
                  However, if a person is currently
                  unable to log in or does not use a
                  digital device, the manager may
                  create a{" "}
                  <span className="font-semibold">
                    shadow member
                  </span>{" "}
                  on their behalf.
                </p>

                <p className="mt-2 text-[10px] font-medium leading-relaxed text-amber-800">
                  Shadow members are used only for
                  calculations and accounting
                  purposes. They do not represent an
                  active digital user of the system.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="mx-auto mb-6 max-w-lg text-center text-[10px] leading-relaxed text-slate-400">
            Add new personnel, or replace an
            existing personnel record if necessary.
            To replace someone, enable the
            replacement option and provide the new
            personnel information.
          </p>
        )}

        {/* MEMBER FORM */}

        {type === "member" && (
          <div className="space-y-4">

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <div className="flex flex-col">
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <User className="h-3.5 w-3.5" />
                  Member Name
                </label>

                <input
                  type="text"
                  disabled={loading}
                  value={memberName}
                  onChange={(e) =>
                    setMemberName(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                  placeholder="Enter member name"
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </label>

                <input
                  type="email"
                  disabled={loading}
                  value={memberEmail}
                  onChange={(e) =>
                    setMemberEmail(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                  placeholder="member@example.com"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5" />
                Role
              </label>

              <select
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                value={memberRole}
                onChange={(e) =>
                  setMemberRole(
                    e.target
                      .value as "member"
                  )
                }
              >
                <option value="">
                  Select Role
                </option>

                <option value="member">
                  Member
                </option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <ImageIcon className="h-3.5 w-3.5" />
                Photo URL
              </label>

              <input
                type="text"
                disabled={loading}
                value={memberPhoto}
                onChange={(e) =>
                  setMemberPhoto(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                placeholder="Optional"
              />

              <p className="mt-2 text-[10px] text-slate-400">
                Upload a photo and get a direct link{" "}
                <a
                  href="https://postimg.cc/gallery/BH8xHfn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-500 underline"
                >
                  here
                </a>
                .
              </p>
            </div>
          </div>
        )}

        {/* PERSONNEL FORM */}

        {type === "personnel" && (
          <div className="space-y-4">

            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 transition-all hover:bg-slate-100">
              <input
                type="checkbox"
                disabled={loading}
                checked={replaceExisting}
                onChange={(e) => {
                  setReplaceExisting(
                    e.target.checked
                  );

                  setSelectedPersonnelMobile("");
                }}
                className="h-4 w-4 accent-teal-600"
              />

              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <Repeat className="h-3.5 w-3.5" />
                Replace an existing personnel?
              </span>
            </label>

            {replaceExisting && (
              <div className="flex flex-col">
                <label className="mb-1.5 text-xs font-medium text-slate-500">
                  Select Personnel to Replace
                </label>

                {loadingPersonnel ? (
                  <div className="flex items-center gap-2 p-3 text-xs text-slate-400">
                    <Loader2
                      className="animate-spin"
                      size={14}
                    />
                    Loading personnel...
                  </div>
                ) : (
                  <select
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500 disabled:opacity-60"
                    value={
                      selectedPersonnelMobile
                    }
                    onChange={(e) =>
                      setSelectedPersonnelMobile(
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select by mobile number
                    </option>

                    {personnelList.map(
                      (p, index) => (
                        <option
                          key={`${p.mobile}-${index}`}
                          value={p.mobile || ""}
                        >
                          {p.name} (
                          {p.designation}) -{" "}
                          {p.mobile}
                        </option>
                      )
                    )}
                  </select>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <div className="flex flex-col">
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Tag className="h-3.5 w-3.5" />
                  Designation
                </label>

                <input
                  type="text"
                  disabled={loading}
                  placeholder="Maid / Paper Boy / Water Man"
                  value={
                    personnelDesignation
                  }
                  onChange={(e) =>
                    setPersonnelDesignation(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 disabled:opacity-60"
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <User className="h-3.5 w-3.5" />
                  Personnel Name
                </label>

                <input
                  type="text"
                  disabled={loading}
                  value={personnelName}
                  onChange={(e) =>
                    setPersonnelName(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 disabled:opacity-60"
                  placeholder="Enter personnel name"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Phone className="h-3.5 w-3.5" />
                Mobile Number
              </label>

              <input
                type="text"
                disabled={loading}
                value={personnelMobile}
                onChange={(e) =>
                  setPersonnelMobile(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 disabled:opacity-60"
                placeholder="01XXXXXXXXX"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <ImageIcon className="h-3.5 w-3.5" />
                Photo URL
              </label>

              <input
                type="text"
                disabled={loading}
                value={personnelPhoto}
                onChange={(e) =>
                  setPersonnelPhoto(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 disabled:opacity-60"
                placeholder="Optional"
              />

              <p className="mt-2 text-[10px] text-slate-400">
                Upload a photo and get a direct link{" "}
                <a
                  href="https://postimg.cc/gallery/BH8xHfn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 underline"
                >
                  here
                </a>
                .
              </p>
            </div>
          </div>
        )}

        {/* SUBMIT BUTTON */}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white shadow-md transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ${
            type === "member"
              ? "bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700"
              : "bg-teal-600 shadow-teal-200 hover:bg-teal-700"
          }`}
        >
          {loading && (
            <Loader2
              className="animate-spin"
              size={16}
            />
          )}

          {loading
            ? "Saving..."
            : type === "member"
            ? "Save Member"
            : "Save Personnel"}
        </button>
      </div>
    </section>
  );
};

export default AddPersonnel;
