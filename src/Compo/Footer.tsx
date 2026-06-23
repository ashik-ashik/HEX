import { Sparkles } from "lucide-react";
import React from "react";


const Footer: React.FC = () => {






  return (
    <footer className="bg-white/70 backdrop-blur-md border-t shadow-inner pt-10">

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