import React, { type FormEvent, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaEnvelope, FaUserShield, FaPaperPlane, FaUser } from "react-icons/fa";
import useAuth from "../hooks/useAuth";

type RoleType = "member" | "manager";

interface UserItem {
  type:string;
  email: string;
  role: string;
  name: string;
  photoURL:string;
  uid	:string;
  emailVerified:string;
  phoneNumber:string;
  provider:string;
  lastLoginAt:string;
}


const UpdateUserRole: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<RoleType>("member");
  const [rolePostLoading, setRolePostLoading] = useState<boolean>(false);

const { usersList, userIsLoading, setUsersList, user } = useAuth() as {
    usersList: UserItem[];
    userIsLoading: boolean;
    setUsersList: React.Dispatch<React.SetStateAction<UserItem[]>>;
    user: {
      email?: string;
    };
  };

console.log(usersList, userIsLoading)

  const API_URL = import.meta.env.VITE_USER_SHEET_WRITE_URL as string;


  const currentManagerEmail = user?.email || "";

  /**
   * Filter users:
   * - remove current manager himself
   * - keep all other members/users
   * - reverse for latest-first style
   */
  const filteredUsers = useMemo(() => {
    return [...(usersList || [])]
      .filter(
        (item: UserItem) =>
          item.email &&
          item.email !== currentManagerEmail
      )
      .reverse();
  }, [usersList, currentManagerEmail]);

  /**
   * Selected user details
   */
  const selectedUser = useMemo(() => {
    return filteredUsers.find(
      (item: UserItem) => item.email === email
    );
  }, [email, filteredUsers]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!email) {
    return toast.error("Please select a user email");
  }

  if (!role) {
    return toast.error("Please select a role");
  }

  if (!API_URL) {
    return toast.error("API URL is missing");
  }

  setRolePostLoading(true);

  const toastId = toast.loading("Updating user role...");

  try {
    const params = new URLSearchParams();
    params.append("type", "userRole");
    params.append("email", email);
    params.append("role", role);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const rawText = await response.text();

    if (!rawText) {
      throw new Error("Empty server response");
    }

    let data: {
      status?: string;
      message?: string;
    };

    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error("Server returned invalid JSON response");
    }

    // Success conditions
    if (
      response.ok &&
      (data?.status === "success" ||
        data?.status === "updated" ||
        !data?.status)
    ) {
      // update local usersList immediately
      setUsersList((prev: UserItem[]) =>
        prev.map((user) =>
          user.email === email
            ? { ...user, role: role }
            : user
        )
      );
      setEmail("");
      setRole("member");

      toast.success(
        data?.message || "User role updated successfully!",
        {
          id: toastId,
        }
      );

      return;
    }

    // Server-side handled error
    if (data?.status === "error") {
      throw new Error(data?.message || "Failed to update role");
    }

    // HTTP failure fallback
    if (response.ok && data?.status !== "error") {
      setUsersList((prev: UserItem[]) =>
          prev.map((item) =>
            item.email === email
              ? {
                  ...item,
                  role,
                }
              : item
          )
        );
      setEmail("");
      setRole("member");

      toast.success(
        data?.message || "User role updated successfully!",
        {
          id: toastId,
        }
      );

      return;
    }

    throw new Error("Unexpected response from server");
  } catch (error) {
    const err = error as Error;

    console.error("Update role error:", err);

    toast.error(
      err.message || "Something went wrong while updating role",
      {
        id: toastId,
      }
    );
  } finally {
    setRolePostLoading(false);
  }
};



  if (userIsLoading) {
    return (
      <div>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white shadow-lg rounded-2xl p-6 border">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Update User Role
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Assign or change user access level in the
          system
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* Email Select */}
        <div className="relative">
          <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />

          <select
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">
              Select member
            </option>

            {filteredUsers.map(
              (item: UserItem, index: number) => (
                <option
                  key={index}
                  value={item.email}
                >
                  {item.name || item.email}
                </option>
              )
            )}
          </select>
        </div>

        {/* Selected User Name Output */}
        <div className="relative">
          <FaUser className="absolute left-3 top-3.5 text-gray-400" />

          <div className="w-full pl-10 pr-3 py-2.5 border rounded-lg bg-gray-50 text-gray-700 min-h-[46px] flex items-center">
            {selectedUser?.email || "Selected user Email will appear here"}
          </div>
        </div>

        {/* Role Select */}
        <div className="relative">
          <FaUserShield className="absolute left-3 top-3.5 text-gray-400" />

          <select
            value={role}
            onChange={(e) =>
              setRole(
                e.target.value as RoleType
              )
            }
            className="w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="member">
              Member
            </option>
            <option value="manager">
              Manager
            </option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={rolePostLoading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60"
        >
          <FaPaperPlane />

          {rolePostLoading
            ? "Updating..."
            : "Update Role"}
        </button>
      </form>
    </div>
  );
};

export default UpdateUserRole;