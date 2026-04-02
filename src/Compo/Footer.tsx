import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  LogIn,
  LayoutDashboard,
  Sparkles
} from "lucide-react";

const Footer: React.FC = () => {
  const location = useLocation();
  const [managerStatus, setManagerStatus] = useState(false);

  useEffect(() => {
    const tracManagerStatus = () => {
      const isManager =
      sessionStorage.getItem("authenticManager") ===
      "This guy is authentic manager of HEX House";

    setManagerStatus(isManager);
    };
    tracManagerStatus();
  }, []);

  // Dynamic Links
  const links = [
    
    managerStatus
      ? {
          name: "Manager Dashboard",
          path: "/dashboard",
          icon: LayoutDashboard
        }
      : {
          name: "I'm Manager",
          path: "/imanager",
          icon: LogIn
        }
  ];

  return (
    <footer className="bg-white/70 backdrop-blur-md border-t shadow-inner mt-10">

      <div className="max-w-6xl mx-auto px-4 py-4">

        {/* Top Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">

          {/* Branding */}
          <div >
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Sparkles size={16} className="text-indigo-500" />
              The Hex House Meal Manager
            </div>
              <p className="text-xs text-gray-500 mt-2">
                Smart monthly meal management system for modern bachelor living
              </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-2 text-xs">
            {links.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link
                  key={index}
                  to={link.path}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all
                  ${
                    location.pathname === link.path
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-indigo-100 hover:text-indigo-700"
                  }`}
                >
                  <Icon size={14} />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Manager Status */}
          <div className="flex items-center gap-1 text-[11px] text-gray-500">
            <ShieldCheck
              size={14}
              className={managerStatus ? "text-green-500" : "text-gray-400"}
            />
            {managerStatus ? "Manager Mode" : "Member Mode"}
          </div>

        </div>

        {/* Bottom Section */}
        <div className="mt-3 pt-3 border-t text-center text-[11px] text-gray-400">
          © {new Date().getFullYear()} The Hex Bachelors House • Built with care
        </div>

      </div>

    </footer>
  );
};

export default Footer;