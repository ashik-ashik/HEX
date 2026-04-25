import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  type User,
  type UserCredential,

} from "firebase/auth";
import toast from "react-hot-toast";

import AuthContext from "./createAuthContext";
import { auth, provider } from "../services/firebase";
import type { JSX } from "react/jsx-runtime";

const POST_USERS_API_URL =
  import.meta.env.VITE_USER_SHEET_WRITE_URL as string;

const LOAD_USERS_URL =
  import.meta.env.VITE_USER_SHEET_READ_URL as string;

/* -------------------------------- */
/* Types */
/* -------------------------------- */

interface UserSheetData {
    type: string;
  name: string;
  email: string;
  role: string;
  photoURL: string;
  uid: string;
  emailVerified: string;
  phoneNumber: string;
  provider: string;
  lastLoginAt: string;
  [key: string]: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface SaveUserResponse {
  success?: boolean;
  message?: string;
}

/* -------------------------------- */
/* Component */
/* -------------------------------- */

const AuthProvider = ({
  children,
}: AuthProviderProps): JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [userIsLoading, setUserIsLoading] =
    useState<boolean>(true);
  const [usersList, setUsersList] = useState<
    UserSheetData[]
  >([]);
const [userRole, setUserRole] = useState<string>("");

  /* -------------------------------- */
  /* Google Login */
  /* -------------------------------- */

  const googleLogin = async (): Promise<UserCredential> => {
    toast.loading("Signing in with Google...", {
      id: "login",
    });

    try {
      const userResult = await signInWithPopup(
        auth,
        provider
      );

      const loggedUser = userResult.user;

      if (!loggedUser) {
        toast.error(
          "Login failed. No user found.",
          { id: "login" }
        );
        throw new Error("No user found");
      }

      const userData: UserSheetData = {
        type: "user",
        name: loggedUser.displayName || "",
        email: loggedUser.email || "",
        role: "",
        photoURL: loggedUser.photoURL || "",
        uid: loggedUser.uid || "",
        emailVerified: String(
          loggedUser.emailVerified || false
        ),
        phoneNumber: loggedUser.phoneNumber || "",
        provider:
          loggedUser.providerData?.[0]?.providerId ||
          "google",
        lastLoginAt: new Date().toLocaleString(),
      };

      const response = await fetch(
        POST_USERS_API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            type: "user",
            name: userData.name,
            role: userData.role,
            email: userData.email,
            photoURL: userData.photoURL,
            uid: userData.uid,
            emailVerified: userData.emailVerified,
            phoneNumber: userData.phoneNumber,
            provider: userData.provider,
            lastLoginAt: userData.lastLoginAt,
          }),
        }
      );

      const data: SaveUserResponse =
        await response.json();

      if (data.success) {
        toast.success(
          data.message || "Login successful",
          {
            id: "login",
          }
        );
      } else {
        toast.error(
          data.message || "Failed to save user",
          {
            id: "login",
          }
        );
      }

      return userResult;
    } catch (error) {
      const err = error as Error;

      console.error("Google Login Error:", err.message);

      toast.error(
        err.message || "Login failed",
        {
          id: "login",
        }
      );

      throw err;
    }
  };

  /* -------------------------------- */
  /* Logout */
  /* -------------------------------- */

  const logout = async (): Promise<void> => {
    await signOut(auth);
  };

  

  /* -------------------------------- */
  /* Load Auth + Users */
  /* -------------------------------- */

  useEffect(() => {
  setUserIsLoading(true);

  const unsubscribe = onAuthStateChanged(
    auth,
    async (currentUser) => {
      setUser(currentUser);

      // No user logged in
      if (!currentUser) {
        setUserRole("");
        setUsersList([]);
        setUserIsLoading(false);
        return;
      }

      try {
        const res = await fetch(LOAD_USERS_URL);
        const data = await res.text();

        if (!data?.trim()) {
          setUsersList([]);
          setUserRole("");
          setUserIsLoading(false);
          return;
        }

        const lines = data.trim().split("\n");

        if (lines.length === 0) {
          setUsersList([]);
          setUserRole("");
          setUserIsLoading(false);
          return;
        }

        const headers = lines[0]
          .split(",")
          .map((header) => header.trim());

        const users: UserSheetData[] = lines
          .slice(1)
          .map((line) => {
            const values = line
              .split(
                /,(?=(?:(?:[^"]*"){2})*[^"]*$)/
              )
              .map((value) =>
                value
                  .trim()
                  .replace(/^"|"$/g, "")
              );

            const userObj =
              {} as UserSheetData;

            headers.forEach(
              (header, index) => {
                userObj[header] =
                  values[index] || "";
              }
            );

            return userObj;
          });

        setUsersList(users);

        // Find current logged-in user role
        const currentUserInfo = users.find(
          (item) =>
            item.email?.toLowerCase() ===
            currentUser.email?.toLowerCase()
        );

        setUserRole(
          currentUserInfo?.role || ""
        );
      } catch (error) {
        console.error(
          "Load Users Error:",
          error
        );

        setUsersList([]);
        setUserRole("");
      } finally {
        setUserIsLoading(false);
      }
    }
  );

  return () => unsubscribe();
}, []);


  /* -------------------------------- */
  /* Context Value */
  /* -------------------------------- */

  const authInfo = {
    user,
    usersList,
    setUsersList,
    userIsLoading,
    googleLogin,
    logout,
    userRole,
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;