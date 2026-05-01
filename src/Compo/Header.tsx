import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
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
  HomeIcon,
} from "lucide-react";
import useAuth from "../hooks/useAuth";


interface AuthContextType {
  userRole: string | null;
}

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const {userRole} = useAuth() as AuthContextType;
  
  useEffect(() => {
    const tracManagerStatus = () => {
     

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }

  tracManagerStatus();
    
  }, []);

  // ✅ Navigation Array
  const navLinks =  [
    {name: "Home", path: "/", icon: Home},
    {name: "Dashboard", path: "/dashboard", icon: LayoutDashboard},
    {name: "Utility", path: "/utility", icon: Wrench},
    {name: "History", path: "/history", icon: History},
  ];

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 transition-colors duration-300 ${
      isActive
        ? "text-blue-600 font-semibold"
        : "text-gray-700 hover:text-blue-600"
    }`;

    console.log(userRole)
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

        {/* Logo */}
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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium">
          {userRole === "manager" && navLinks.map((link, index) => {
            return (
              <NavLink
                key={index}
                to={link.path}
                end={link.path === "/"}
                className={navLinkClass}
              >
                
                {link.name}
              </NavLink>
            );
          })}
          {userRole === "member"&& navLinks.map((link, index) => {
            return (
              <NavLink
                key={index}
                to={link.path}
                end={link.path === "/"}
                className={navLinkClass}
              >
                
                {link.name}
              </NavLink>
            );
          })}
          {userRole === "assist_manager"&& navLinks.map((link, index) => {
            return (
              <NavLink
                key={index}
                to={link.path}
                end={link.path === "/"}
                className={navLinkClass}
              >
                
                {link.name}
              </NavLink>
            );
          })}
          {
            userRole ==='manager' || userRole === "assist_manager" ? (<>
              <NavLink to="/settlement" className={navLinkClass}>
                Settlement
              </NavLink>
              <NavLink to="/manager" className={navLinkClass}>
                Manager Panel
              </NavLink>
              <NavLink to="/login" className={navLinkClass}>
                <UserCheck size={12} />
                
              </NavLink>
              </>
            ) : userRole ?(
              <NavLink to="/login" className={navLinkClass}>
                <UserCheck size={12} />
                
              </NavLink>
            ):
             userRole !== "member" ? userRole !== "manager" &&(
              <>
              <NavLink to="/" className={navLinkClass}>
                <HomeIcon size={16} />
                
              </NavLink>
              <NavLink to="/login" className={navLinkClass}>
                <LogIn size={16} />
                
              </NavLink>
              </>
            
            ):<></>

            
          }
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
        ${mobileOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}
        bg-white shadow-md`}
      >
        <nav className="flex flex-col px-6 py-4 gap-4 text-sm font-medium">
          {userRole ==='member' && navLinks.map((link, index) => {
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
          {userRole ==='manager' && navLinks.map((link, index) => {
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
          {
            userRole ==='manager' || userRole === "assist_manager" ? (<>
              <NavLink to="/settlement" className={navLinkClass}>
                <LucideCalculator size={14} />
                Settlement
              </NavLink>
              <NavLink to="/manager" className={navLinkClass}>
                <Gauge size={14} />
                Manager Panel
              </NavLink>
              <NavLink to="/login" className={navLinkClass}>
                <UserCheck size={12} />
              </NavLink>
              </>
            ) : userRole !=='member' ? userRole !== "manager" &&(
              <>
              <NavLink to="/" className={navLinkClass}>
                <Home size={16} />
                
              </NavLink>
              <NavLink to="/login" className={navLinkClass}>
                <LogIn size={16} />
                
              </NavLink>
              </>
            
            ):<>{
              <NavLink to="/login" className={navLinkClass}>
                <UserCheck size={12} />
                  Profile
              </NavLink>
            }</>
          }
        </nav>
      </div>
    </header>
  );
};

export default Header;