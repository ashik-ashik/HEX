import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Header from "./Header";
import Footer from "./Footer";
import UpdateManagerKey from "./UpdateManagerKey";
import { Link } from "react-router-dom";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSiBw4kytTvD4nfq03VjB2jHSvvgAiIbSfKsVDnI_BLDUWMLNwG1MIVYOzt-Gr0X43m8mpLawdSOhSG/pub?gid=0&single=true&output=csv";

  interface ManagerStatus {
    managerStatus: boolean
  }

const LoginAsManager: React.FC<ManagerStatus> = ({managerStatus}) => {
  const [inputKey, setInputKey] = useState("");
  const [loading, setLoading] = useState(false);

  const buttonControlar = loading ? true : managerStatus ? true : false;

  const handleLogin = async () => {
    if (!inputKey.trim()) {
      toast.error("Please enter manager key");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Checking manager access...");

    try {
      const res = await fetch(SHEET_CSV_URL);
      const data = await res.text();

      // CSV first cell = manager key
      const sheetKey = data.split(",")[0].trim();

      if (inputKey.trim() === sheetKey) {
        sessionStorage.setItem("authenticManager", "This guy is authentic manager of HEX House");

        toast.success("Access granted ✅", { id: toastId });

        // optional redirect
        setTimeout(() => {
          window.location.href = "/manager"; // change if needed
        }, 1000);
      } else {
        toast.error("Invalid manager key ❌", { id: toastId });
      }
    } catch (error) {
      toast.error("Failed to verify key ❌", { id: toastId });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Header />

    <section className="py-24 backdrop-blur-sm bg-purple-700/70 p-2">
        <div className="min-h-[60vh] max-w-2xl m-auto rounded-sm flex items-center justify-center ">
        <Toaster
            position="top-right"
            containerStyle={{
            position: "fixed",
            top: 100,
            right: 20,
            zIndex: 99,
            }}
        />

            {
                !managerStatus ? <>
                <div className=" p-8 rounded-2xl shadow-lg ">
                    <h2 className="text-2xl font-semibold mb-6 text-center text-white">
                    Manager Login
                    </h2>

                    <input
                    type="password"
                    placeholder="Enter Manager Key"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                    onClick={handleLogin}
                    disabled={buttonControlar }
                    className={`w-full py-2 rounded-lg text-white transition ${managerStatus && "bg-red-200 cursor-not-allowed hover:bg-red-200"} ${
                        loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-orange-600 hover:bg-red-500"
                    }`}
                    >
                    {loading ? "Checking..." : "Login as Manager"}
                    </button>
                    <p className="mt-4 p-4 text-xs backdrop-blur-sm rounded-md bg-white/30 text-gray-800 border border-gray-200">
                      Login with your manager credentials to access the dashboard. 
                      Ensure your key is correct and keep it confidential for security.
                    </p>

                    <div className="mt-10 pt-6 p-2 flex justify-center">
                      <Link to='/' className="text-xs px-6 py-2 text-white bg-yellow-500">Back Home</Link>
                    </div>

                </div>
                </> :<>
                    <UpdateManagerKey managerStatus={managerStatus} />
                </>
            }
        </div>
    </section>

    <Footer />
    </>
  );
};

export default LoginAsManager;