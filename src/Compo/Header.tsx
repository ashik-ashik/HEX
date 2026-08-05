import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  LayoutDashboard,
  Wrench,
  LogIn,
  Gauge,
  History,
  LucideCalculator,
  UserCheck,
  UserCircle2,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import DeveloperProfileModal from "./DeveloperProfileModal";

interface AuthContextType {
  userRole: string | null;
}

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [devProfileOpen, setDevProfileOpen] = useState(false);
  const { userRole } = useAuth() as AuthContextType;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isManagerLevel = userRole === "manager" || userRole === "assist_manager";
  const isMember = userRole === "member";
  const isLoggedIn = isManagerLevel || isMember;

  // Core nav links, shown only to logged-in roles (manager/assist_manager/member)
  const navLinks = [
    { name: "Home", path: "/overview", icon: Home },
    { name: "Meal & Bazar", path: "/meal-bazar-costs", icon: LayoutDashboard },
    { name: "Utility", path: "/utility", icon: Wrench },
    // { name: "My Account", path: "/member-profile", icon: UserCircle2 },
  ];

  // Links visible to everyone, logged in or not
  const publicLinks = [{ name: "History", path: "/history", icon: History }];

  // Extra links only for manager-level roles (manager + assist_manager share access)
  const managerLinks = [
    { name: "Settlement", path: "/settlement", icon: LucideCalculator },
    { name: "Manager Panel", path: "/manager", icon: Gauge },
  ];

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 transition-colors duration-300 ${
      isActive
        ? "text-blue-600 font-semibold"
        : "text-gray-700 hover:text-blue-600"
    }`;

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 
        ${
          scrolled
            ? "backdrop-blur-md bg-white/70 shadow-md py-2"
            : "bg-white py-4"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <div className="flex flex-col leading-tight">
              <span
                className={`font-bold tracking-wide transition-all duration-300 
                ${scrolled ? "text-sm" : "text-base"}`}
              >
                The Hexa House
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                Meal Manager
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium">
            {isLoggedIn &&
              navLinks.map((link, index) => (
                <NavLink
                  key={index}
                  to={link.path}
                  end={link.path === "/"}
                  className={navLinkClass}
                >
                  {link.name}
                </NavLink>
              ))}

            {publicLinks.map((link, index) => (
              <NavLink
                key={`public-${index}`}
                to={link.path}
                end={link.path === "/"}
                className={navLinkClass}
              >
                {link.name}
              </NavLink>
            ))}

            {isManagerLevel &&
              managerLinks.map((link, index) => (
                <NavLink
                  key={`manager-${index}`}
                  to={link.path}
                  className={navLinkClass}
                >
                  {link.name}
                </NavLink>
              ))}

            {isLoggedIn ? (
              <NavLink to="/member-profile" className={navLinkClass}>
                 My Account
              </NavLink>
            ) : (
              <>
                <NavLink to="/" end className={navLinkClass}>
                  <Home size={16} />
                </NavLink>
                <NavLink to="/login" className={navLinkClass}>
                  <LogIn size={16} />
                </NavLink>
              </>
            )}

            {/* Developer profile — visible to all users, logged in or not */}
            <button
              type="button"
              onClick={() => setDevProfileOpen(true)}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors duration-300"
              aria-label="View developer profile"
            >
              <UserCircle2 size={16} />
            </button>
          </nav>

          {/* Mobile Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden
          ${mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
          bg-white shadow-md`}
        >
          <nav className="flex flex-col px-6 py-4 gap-4 text-sm font-medium">
            {isLoggedIn &&
              navLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={index}
                    to={link.path}
                    end={link.path === "/"}
                    className={navLinkClass}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon size={14} />
                    {link.name}
                  </NavLink>
                );
              })}

            {publicLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={`public-mobile-${index}`}
                  to={link.path}
                  end={link.path === "/"}
                  className={navLinkClass}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={14} />
                  {link.name}
                </NavLink>
              );
            })}

            {isManagerLevel &&
              managerLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={`manager-mobile-${index}`}
                    to={link.path}
                    className={navLinkClass}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon size={14} />
                    {link.name}
                  </NavLink>
                );
              })}

            {isLoggedIn ? (
              <NavLink
                to="/member-profile"
                className={navLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                <UserCheck size={12} />
                My Account
              </NavLink>
            ) : (
              <>
                <NavLink
                  to="/"
                  end
                  className={navLinkClass}
                  onClick={() => setMobileOpen(false)}
                >
                  <Home size={16} />
                  Home
                </NavLink>
                <NavLink
                  to="/login"
                  className={navLinkClass}
                  onClick={() => setMobileOpen(false)}
                >
                  <LogIn size={16} />
                  Login
                </NavLink>
              </>
            )}

            {/* Developer profile — visible to all users, logged in or not */}
            <button
              type="button"
              onClick={() => {
                setDevProfileOpen(true);
                setMobileOpen(false);
              }}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors duration-300 text-left"
            >
              <UserCircle2 size={14} />
              Developer Profile
            </button>
          </nav>
        </div>
      </header>

      <DeveloperProfileModal
        isOpen={devProfileOpen}
        onClose={() => setDevProfileOpen(false)}
      />
    </>
  );
};

export default Header;