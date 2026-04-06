/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { UserPlus, Users, Briefcase, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface Member {
  designation: string;
  name: string;
  mobile?: string;
  photo?: string;
}

const AddPersonnel: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
//   console.log(members);

  const [type, setType] = useState<"member" | "other">("member");
  const [selectedMember, setSelectedMember] = useState("");
  const [newName, setNewName] = useState("");
  const [designation, setDesignation] = useState("");
  const [mobile, setMobile] = useState("");
  const [photo, setPhoto] = useState("");
  const [loading, setLoading] = useState(false);

  // Load Members from Sheet (CSV)
  useEffect(() => {
    const fetchMembers = () => {
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
        }));

      setMembers(parsed);
      setLoadingMembers(false);

    })
    .catch(() => {
        setLoadingMembers(false);
    });
    };

    fetchMembers();
  }, []);


  // Filter Members (Row 2-7)
  const memberList = members.filter(
    (m) => m.designation === "Member" || m.designation === "Manager"
  );

  // Submit Handler
  const handleSubmit = async () => {
    if (!newName) {
      toast.error("Please enter personnel name");
      return;
    }

    let payload: any;
    if (type === "member") {
      if (!selectedMember) {
        toast.error("Select member to replace");
        return;
      }

      const selectedIndex = memberList.findIndex(
        (m) => m.name === selectedMember
      );

      const rowIndex = selectedIndex + 2; // Row 2-7

      payload = {
        type: "replace",
        rowIndex,
        designation: "Member",
        name: newName,
        mobile,
        photo: photo || "https://i.postimg.cc/yN6zyD1X/member.jpg",
      };
    } else {
      payload = {
        type: "append",
        designation,
        name: newName,
        mobile,
        photo,
      };
    }

    try {
      setLoading(true);
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
      body: body,
    });

    const data = await res.json();

    toast.dismiss("personnel");

    if (data.status === "success") {
      toast.success(data.message);
    } else {
      toast.error(data.message);
    }

      // Reset
      setNewName("");
      setDesignation("");
      setMobile("");
      setPhoto("");
      setSelectedMember("");

      // Reload Members
    //   window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Failed to Add Personnel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-6 mt-6">
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
      <div className="flex items-center gap-2 mb-4">
        <UserPlus className="text-blue-600" />
        <h2 className="text-xl font-semibold">Add Personnel</h2>
      </div>

      {/* Type Selection */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setType("member")}
          className={`p-4 rounded-xl border flex items-center gap-2 justify-center transition
          ${
            type === "member"
              ? "bg-blue-50 border-blue-500"
              : "hover:bg-gray-50"
          }`}
        >
          <Users /> Replace Member
        </button>

        <button
          onClick={() => setType("other")}
          className={`p-4 rounded-xl border flex items-center gap-2 justify-center transition
          ${
            type === "other"
              ? "bg-green-50 border-green-500"
              : "hover:bg-gray-50"
          }`}
        >
          <Briefcase /> Add Other Personnel
        </button>
      </div>

      {/* Replace Member */}
      {type === "member" && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Select Member</label>

            {loadingMembers ? (
              <div className="flex items-center gap-2 mt-2 text-gray-500">
                <Loader2 className="animate-spin" size={16} /> Loading...
              </div>
            ) : (
              <select
                className="w-full mt-1 border rounded-xl p-2"
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value.trim())}
              >
                <option value="">Select Member</option>
                {memberList.map((m, index) => (
                  <option key={index} value={m.name}>
                    {m.name} ({m.designation})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">New Member Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value.trim())}
              className="w-full mt-1 border rounded-xl p-2"
              placeholder="Enter new member name"
            />
          </div>
        </div>
      )}

      {/* Other Personnel */}
      {type === "other" && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Designation</label>
            <input
              type="text"
              placeholder="Khala / Paper Boy / Water Man"
              value={designation}
              onChange={(e) => setDesignation(e.target.value.trim())}
              className="w-full mt-1 border rounded-xl p-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Personnel Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value.trim())}
              className="w-full mt-1 border rounded-xl p-2"
              placeholder="Enter personnel name"
            />
          </div>
        </div>
      )}

      {/* Common Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="text-sm font-medium">Mobile</label>
          <input
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.trim())}
            className="w-full mt-1 border rounded-xl p-2"
            placeholder="01XXXXXXXXX"
          />
        </div>

        <div>
            <div>
                <label className="text-sm font-medium">Photo URL</label>
                <input
                    type="text"
                    value={photo}
                    onChange={(e) => setPhoto(e.target.value.trim())}
                    className="w-full mt-1 border rounded-xl p-2"
                    placeholder="Optional"
                />
                </div>
                <p className="text-xs text-gray-400 mt-2">Upload photo and get direct link <a href="https://postimg.cc/gallery/BH8xHfn" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">here</a></p>
            </div>
        </div>
        <div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium shadow-md flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="animate-spin" size={18} />}
        Save Personnel
      </button>
    </div>
  );
};

export default AddPersonnel;
