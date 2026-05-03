import { useState } from "react";
import {
  LayoutDashboard,
  Home,
  UserCog,
  DollarSign,
  Wallet,
  Utensils,
  Menu,
  X,
  PieChart,
  ShoppingCart,
  Target,
  RefreshCcw,
  UserRoundPlus,
  BadgeDollarSignIcon,
  ChevronRight,
  AlertTriangle,
  Zap,
} from "lucide-react";
import EntryBazarCosts from "./EntryBazarCosts";
import MealCountEntry from "./MealCountEntry";
import EntryMealDeposit from "./EntryMealDeposit";
import ChangeManager from "./NextManagerSelection";
import EntryUtilityDeposit from "./EntryUtilityDeposit";
import UtilityCostEntry from "./EntryUtilityCosts";
import { Link } from "react-router-dom";
import SetFixedMeal from "./SetFixedMeal";
import ResetMonth from "./ResetThisMonth";
import AddPersonnel from "./AddPersonnel";
import useAuth from "../hooks/useAuth";
import EditMealDeposit from "./EditMealDeposit";
import EditLastBazarCost from "./EditBazarCosts";
import { BiPieChartAlt2 } from "react-icons/bi";

interface Props {
  managerStatus: boolean;
  memberNameList: string[];
}
interface AuthContextType {
  userRole: string | null;
}

export default function ManagerDashboard({ memberNameList }: Props) {
  const [active, setActive] = useState("dashboard");
  const [open, setOpen] = useState(false);
  const { userRole } = useAuth() as AuthContextType;

  const menus = [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard, group: "overview" },
    { id: "bazar-cost", name: "Bazar Cost", icon: ShoppingCart, group: "entry" },
    { id: "meal-entry", name: "Meal Entry", icon: Utensils, group: "entry" },
    { id: "meal-deposit-entry", name: "Meal Deposit", icon: DollarSign, group: "entry" },
    { id: "utility-deposit-entry", name: "Utility Deposit", icon: Wallet, group: "entry" },
    { id: "utility-costs-entry", name: "Utility Cost", icon: PieChart, group: "entry" },
    { id: "edit-meal-deposit", name: "Edit Meal Deposit", icon: BadgeDollarSignIcon, group: "edit" },
    { id: "edit-mbaza-cost", name: "Edit Bazar Cost", icon: BiPieChartAlt2, group: "edit" },
    { id: "add-member", name: "Add Member", icon: UserRoundPlus, group: "manage" },
    { id: "next-manager", name: "Change Member Role", icon: UserCog, group: "manage" },
    { id: "setfixedmeal", name: "Set Fixed Meal", icon: Target, group: "manage" },
    { id: "resetmonth", name: "Reset Month", icon: RefreshCcw, group: "manage" },
  ];

  const groups: { key: string; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "entry", label: "Data Entry" },
    { key: "edit", label: "Edit Records" },
    { key: "manage", label: "Management" },
  ];

  const quickGoMenus = [
    { id: "/", name: "Home" },
    { id: "/dashboard", name: "Dashboard" },
    { id: "/utility", name: "Utility" },
    { id: "/settlement", name: "Settlement" },
    { id: "/postnotice", name: "Post Notice" },
  ];

  const activeMenu = menus.find((m) => m.id === active);

  const renderPage = () => {
    switch (active) {
      case "bazar-cost":
        return <EntryBazarCosts memberNameList={memberNameList} />;
      case "meal-entry":
        return <MealCountEntry memberNameList={memberNameList} />;
      case "meal-deposit-entry":
        return <EntryMealDeposit memberNameList={memberNameList} />;
      case "utility-deposit-entry":
        return <EntryUtilityDeposit memberNameList={memberNameList} />;
      case "utility-costs-entry":
        return <UtilityCostEntry />;
      case "edit-meal-deposit":
        return <EditMealDeposit memberNameList={memberNameList} />;
      case "edit-mbaza-cost":
        return <EditLastBazarCost memberNameList={memberNameList} />;
      case "add-member":
        return <AddPersonnel />;
      case "next-manager":
        return <ChangeManager />;
      case "setfixedmeal":
        return <SetFixedMeal />;
      case "resetmonth":
        return <ResetMonth />;
      default:
        return (
          <div className="p-6 lg:p-10 space-y-8 max-w-4xl mx-auto">
            {/* Welcome Header */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white p-8 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #6366f1 0%, transparent 60%)" }} />
              <div className="relative z-10">
                <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mb-2">Manager Panel</p>
                <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">Welcome back 👋</h1>
                <p className="text-slate-300 mt-2 text-base">
                  Select an action from the sidebar to manage your mess operations.
                </p>
              </div>
            </div>

            {/* Caution Card */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="font-bold text-amber-900 text-base mb-1">Important Notice</h2>
                  <p className="text-amber-800 text-sm leading-relaxed">
                    This is a <strong>virtual storage system</strong>. It helps manage data efficiently but{" "}
                    <strong>can experience downtime or data loss</strong>. Do not rely on it exclusively — always
                    keep a personal backup of critical information.
                  </p>
                  <ul className="mt-3 space-y-1.5 text-amber-800 text-sm">
                    {[
                      "Double-check any critical entries before saving.",
                      "Maintain backup notes outside the system.",
                      "Use this as a helper, not your sole record keeper.",
                    ].map((tip) => (
                      <li key={tip} className="flex items-start gap-2">
                        <ChevronRight size={14} className="mt-0.5 flex-shrink-0 text-amber-500" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Access */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap size={16} className="text-orange-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">Quick Access</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickGoMenus.map((item) => (
                  <Link
                    key={item.id}
                    to={item.id}
                    className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 shadow-sm"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Action Grid */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <LayoutDashboard size={16} className="text-indigo-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">All Actions</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {menus.filter((m) => m.id !== "dashboard").map((menu) => {
                  const Icon = menu.icon;
                  return (
                    <button
                      key={menu.id}
                      onClick={() => setActive(menu.id)}
                      className="flex flex-col items-start gap-2 bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md p-4 rounded-2xl text-left transition-all duration-150 group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                        <Icon size={18} className="text-slate-500 group-hover:text-indigo-600 transition-colors" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-700 leading-tight">
                        {menu.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <section className="min-h-screen bg-slate-100">
      <div className="flex h-screen">
        {/* Mobile Toggle Button */}
        <button
          id="managerDashboardMobileMenuIcon"
          onClick={() => setOpen(!open)}
          className="lg:hidden fixed top-4 right-4 z-[9999] bg-white border border-slate-200 p-2.5 rounded-xl shadow-md transition hover:bg-slate-50"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Overlay for mobile */}
        {open && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static z-40
            w-64 h-full bg-white border-r border-slate-200 flex flex-col
            transform ${open ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 transition-transform duration-200 ease-in-out
          `}
        >
          {/* Sidebar Header */}
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                <LayoutDashboard size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Manager Panel</h2>
                <p className="text-xs text-slate-400 capitalize">{userRole ?? "manager"}</p>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
            {/* Back Home */}
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition text-xs font-medium"
            >
              <Home size={16} />
              Back to Home
            </Link>

            {/* Grouped menu items */}
            {groups.map((group) => {
              const items = menus.filter((m) => m.group === group.key);
              if (!items.length) return null;
              return (
                <div key={group.key}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-1.5">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {items.map((menu) => {
                      const Icon = menu.icon;
                      const isActive = active === menu.id;
                      return (
                        <button
                          key={menu.id}
                          onClick={() => {
                            setActive(menu.id);
                            setOpen(false);
                          }}
                          className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all
                            ${isActive
                              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            }
                          `}
                        >
                          <Icon size={16} />
                          {menu.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-100">
            <div className="bg-slate-50 rounded-xl px-4 py-3 text-xs text-slate-400 text-center">
              Mess Management System
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              {activeMenu && (
                <>
                  <span className="text-slate-400 text-sm">Manager Panel</span>
                  <ChevronRight size={14} className="text-slate-300" />
                  <span className="text-slate-800 text-sm font-semibold">{activeMenu.name}</span>
                </>
              )}
              {!activeMenu && (
                <span className="text-slate-800 text-sm font-semibold">Dashboard</span>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg capitalize">
                {userRole ?? "Manager"}
              </span>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto bg-slate-50">
            {renderPage()}
          </div>
        </main>
      </div>
    </section>
  );
}