import type { JSX } from "react";
import type { User, UserCredential } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaSignOutAlt, FaUserShield } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";


import useAuth from "../hooks/useAuth";
import Header from "./Header";

interface UserItem {
  email: string;
  role?: string;
  lastLoginAt?: string;
  name?: string;
  photoURL?: string;
  uid?: string;
  emailVerified?: string;
  phoneNumber?: string;
  provider?: string;
  [key: string]: string | undefined;
}

interface AuthContextType {
  user: User | null;
  usersList: UserItem[];
  userIsLoading: boolean;
  googleLogin: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  userRole: string | null;
}

const GoogleLogin = (): JSX.Element => {
  /**
   * Type assertion is needed here because
   * useAuth() returns context value without
   * direct TS inference in your current setup
   */

  const navigate = useNavigate();
  const {
    user,
    usersList,
    userIsLoading,
    googleLogin,
    logout,
    userRole,
  } = useAuth() as AuthContextType;


  const handleLogin = async (): Promise<void> => {
  try {
    await googleLogin();
    navigate("/");
  } catch (error) {
    const err = error as Error;
    console.error(err.message);
  }
};

const handleLogout = async (): Promise<void> => {
  try {
    await logout();
    navigate("/");
  } catch (error) {
    const err = error as Error;
    console.error(err.message);
  }
};

  const thisUser: UserItem | undefined = usersList.find(
    (u) =>
      u.email?.toLowerCase() ===
      user?.email?.toLowerCase()
  );

  if (userIsLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <p className="text-gray-500 text-lg font-medium">
          Loading user...
        </p>
      </div>
    );
  }

  return (
    <>
        <Header />
        

<div className="min-h-screen pt-24 flex justify-center items-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4">
  <div className="w-full max-w-md bg-white/90 backdrop-blur-md border border-white shadow-2xl rounded-3xl p-8 text-center relative overflow-hidden">
    
    {/* Top Accent */}
    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

    {/* Title */}
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">
        Hex Bachelor House
      </h1>

      <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
        Smart meal management and comfortable daily living for every resident
      </p>
    </div>

    {/* Address Card */}
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 mb-6 shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-2">
        <FaMapMarkerAlt className="text-blue-600 text-lg" />
        <h3 className="font-semibold text-gray-700">
          House Address
        </h3>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">
        Kathaltola, 1051/1, Monipur <br />
        Mirpur-2, Dhaka
      </p>
    </div>

    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
      Login with Google to access your dashboard, meals, monthly planning, and member management
    </p>

    {user ? (
      <div className="space-y-6">
        {/* User Info */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src={
                !user.photoURL ? "https://i.postimg.cc/7h9pH9T8/guest-ava.png" :user.photoURL
              }
              alt="User"
              className="w-24 h-24 rounded-full border-4 border-blue-100 shadow-lg object-cover"
            />

            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 shadow-md">
              <FaUserShield className="text-blue-600 text-sm" />
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mt-5 mb-3">
            {user.displayName || "User Name"}
          </h2>

          <p className="text-sm text-blue-600 font-medium capitalize bg-blue-50 px-4 py-1 rounded-full border border-blue-100">
            {userRole ==="assist_manager" ? "Assistant Manager" : userRole}
          </p>

          <p className="text-xs text-gray-500 mt-4">
            Last Login:{" "}
            {thisUser?.lastLoginAt?.split(",")[0] ||
              "No login date"}
          </p>

          <p className="text-sm text-gray-500 mt-2 break-all">
            {user.email || "user@gmail.com"}
          </p>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition shadow-md flex items-center justify-center gap-2"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    ) : (
      <button
        onClick={handleLogin}
        className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 py-3 rounded-xl font-medium transition shadow-md flex items-center justify-center gap-3"
      >
        <FcGoogle className="text-2xl" />
        Continue with Google
      </button>
    )}
  </div>
</div>
    </>
  );
};

export default GoogleLogin;