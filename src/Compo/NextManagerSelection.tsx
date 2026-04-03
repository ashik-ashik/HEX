/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
// import Header from "./Header";
import Footer from "./Footer";

const API_URL = import.meta.env.VITE_CHANGE_MANAGER_API;

interface Member {
  designation: string;
  name: string;
  mobile: string;
  photo?: string;
}
interface ManagerStatus {
    managerStatus: boolean
}

const ChangeManager:React.FC<ManagerStatus> = ({managerStatus}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [selected, setSelected] = useState("");
  const [currentManager, setCurrentManager] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  /***************************************
 * Fetch Members (CSV)
 ***************************************/
  useEffect(() => {

const fetchMembers = async () => {
  try {
    const res = await fetch(
      import.meta.env.VITE_CURRENT_MANAGER_FINDER_IN_NEXT_MANAGER_SELECTION
    );

    const csvText = await res.text();

    const rows = csvText.split("\n").map((row) => row.split(","));

    // Remove header
    const data = rows.slice(1);

    const parsedMembers: Member[] = data
      .filter((row) => row[1]) // remove empty rows
      .map((row) => ({
        designation: row[0]?.trim(),
        name: row[1]?.trim(),
        mobile: row[2]?.trim(),
        photo: row[3]?.trim(),
      }));

    setMembers(parsedMembers);

    const manager = parsedMembers.find(
      (m) => m.designation === "Manager"
    );

    if (manager) {
      setCurrentManager(manager.name);
    }

  } catch (err) {
    toast.error("Failed to load members");
  }
};

    fetchMembers();
  }, []);

  /***************************************
   * Change Manager
   ***************************************/
  const handleChangeManager = async () => {
    if (!selected) {
      toast.error("Please select a member");
      return;
    }

    setLoading(true);

    const toastId = toast.loading("Changing Manager...");

    try {
      const body = new URLSearchParams();

        body.append("type", "changeManager");
        body.append("name", selected);


      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        body: body,
      });

      const data = await res.json();

      if (data.status === "success") {
        toast.success(data.message, { id: toastId });
        setConfirm(false);
        setCurrentManager(selected);
        setSelected("");
      } else {
        toast.error(data.message, { id: toastId });
      }
    } catch (error) {
      toast.error("Something went wrong", { id: toastId });
    }

    setLoading(false);
  };

  return (

    <>
        {/* <Header /> */}

        <section className="backdrop-blur-sm bg-black/50 py-20 p-2">
          <div className="min-h-[62vh] lg:min-h-screen">
            <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg">
            <Toaster
                position="top-right"
                containerStyle={{
                top: 100,
                right: 20,
                }}
            />

            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Change Manager
            </h2>

            {/* Current Manager */}
            <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-sm text-gray-500">Current Manager</p>

                <div className="flex items-center gap-3 mt-2">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                    {currentManager?.charAt(0)}
                </div>

                <span className="font-semibold text-gray-800">
                    {currentManager || "Loading..."}
                </span>
                </div>
            </div>

            {/* Select Member */}

            {
                managerStatus ? <>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                    Select New Manager
                    </label>

                    <select
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                    >
                    <option value="">Choose Member</option>

                    {members
                        .slice(0, 6)
                        .filter((m) => m.designation !== "Manager")
                        .map((member, index) => (
                        <option key={index} value={member.name}>
                            {member.name.trim()}
                        </option>
                        ))}
                    </select>
                </div>

                {/* Button */}
                <button
                    onClick={() => setConfirm(true)}
                    disabled={!selected || loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition"
                >
                    Change Manager
                </button>
                
                </> : <>
                
                </>
            }

            {/* Confirm Modal */}
            {confirm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                <div className="bg-white p-6 rounded-2xl shadow-xl w-96">
                    <h3 className="text-lg font-semibold mb-3">
                    Confirm Change
                    </h3>

                    <p className="text-gray-600 mb-5">
                    Are you sure you want to make{" "}
                    <span className="font-semibold">{selected}</span>{" "}
                    as new manager?
                    </p>

                    <div className="flex justify-end gap-3">
                    <button
                        onClick={() => setConfirm(false)}
                        className="px-4 py-2 rounded-md text-xs border"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleChangeManager}
                        className="px-4 py-2 bg-orange-600 text-white rounded-md text-xs"
                    >
                        Confirm
                    </button>
                    </div>
                </div>
                </div>
            )}
            </div>
          </div>
        </section>

        <Footer />
    </>
  );
};

export default ChangeManager;