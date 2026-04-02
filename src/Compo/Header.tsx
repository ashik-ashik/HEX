import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative transition-colors duration-300 ${
      isActive
        ? "text-blue-600 font-semibold"
        : "text-gray-700 hover:text-blue-600"
    }`;

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 
      ${
        scrolled
          ? "backdrop-blur-md bg-white/70 shadow-md py-2"
          : "bg-white py-4"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        
        {/* Logo / Title */}
        <div className="flex flex-col leading-tight">
          <span
            className={`font-bold tracking-wide transition-all duration-300 
            ${scrolled ? "text-sm" : "text-base"}`}
          >
            The Hex House
          </span>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest">
            Meal Manager
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-6 text-xs font-medium">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/dashboard" className={navLinkClass}>
            Dashboard
          </NavLink>

          <NavLink to="/utility" className={navLinkClass}>
            Utility
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;