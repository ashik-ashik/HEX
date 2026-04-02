import React from "react";
import { Link, useLocation } from "react-router-dom";

const Footer: React.FC = () => {
  const location = useLocation();

  // Links data
  const links = [
    { name: "I'm Manager", path: "/imanager" }
  ];

  return (
    <footer className="bg-gray-100/80 backdrop-blur-md py-4 shadow-inner ">
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row sm:justify-between items-center">
        {/* Footer Heading */}
        <div className="mb-2 sm:mb-0 text-xs font-semibold text-gray-700">
          Important Links:
        </div>

        {/* Links Grid */}
        <div className="flex flex-wrap justify-center sm:justify-end gap-1 text-xs">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-2 py-1 rounded-md transition-colors ${
                location.pathname === link.path
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-indigo-100 hover:text-indigo-700"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Optional small copyright */}
      <div className="mt-2 text-center text-gray-400 text-[10px]">
        &copy; {new Date().getFullYear()} The Hex Bachelors House. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;