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
  Zap,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { BiPieChartAlt2 } from "react-icons/bi";

interface Props {
  managerStatus: boolean;
  memberNameList: string[];
}
interface AuthContextType {
  userRole: string | null;
}

export default function ManagerDashboard({ memberNameList }: Props) {
  const [open, setOpen] = useState(false);
  const { userRole } = useAuth() as AuthContextType;
  const location = useLocation();

  const menus = [
    { id: "", name: "ড্যাশবোর্ড", icon: LayoutDashboard, group: "overview" },
    { id: "bazar-cost", name: "এড বাজার খরচ", icon: ShoppingCart, group: "entry" },
    { id: "meal-entry", name: "মিল এড করুন", icon: Utensils, group: "entry" },
    { id: "meal-deposit-entry", name: "খাবার মিলে জমা দিন", icon: DollarSign, group: "entry" },
    { id: "utility-deposit-entry", name: "ইউটিলিটি জমা দিন", icon: Wallet, group: "entry" },
    { id: "utility-costs-entry", name: "ইউটিলিটি খরচ যোগ করুন", icon: PieChart, group: "entry" },
    { id: "edit-meal-deposit", name: "খাবার মিলে জমা এডিট", icon: BadgeDollarSignIcon, group: "edit" },
    { id: "edit-bazar-cost", name: "বাজার খরচ এডিট করুন", icon: BiPieChartAlt2, group: "edit" },
    { id: "add-member", name: "নতুন সদস্য যোগ করুন", icon: UserRoundPlus, group: "manage" },
    { id: "next-manager", name: "ম্যানেজার পরিবর্তন", icon: UserCog, group: "manage" },
    { id: "setfixedmeal", name: "ফিক্সড মিল সেট করুন", icon: Target, group: "manage" },
    { id: "resetmonth", name: "এই মাস রিসেট করুন", icon: RefreshCcw, group: "manage" },
  ];

  const groups: { key: string; label: string }[] = [
    { key: "overview", label: "ওভারভিউ" },
    { key: "entry", label: "ডেটা এন্ট্রি" },
    { key: "edit", label: "রেকর্ড এডিট" },
    { key: "manage", label: "ব্যবস্থাপনা" },
  ];

  const quickGoMenus = [
    { id: "/overview", name: "হোম" },
    { id: "/dashboard", name: "ড্যাশবোর্ড" },
    { id: "/utility", name: "ইউটিলিটি" },
    { id: "/settlement", name: "সেটেলমেন্ট" },
    { id: "/postnotice", name: "নোটিশ পোস্ট" },
  ];

  // Find which menu matches the current path (matches the last path segment)
  const activeMenu = menus.find((m) => location.pathname.includes(m.id));

  const isDashboardHome =
    !activeMenu || location.pathname.endsWith("/dashboard") || location.pathname.endsWith("/manager");

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
                <h2 className="text-sm font-bold text-slate-800">ম্যানেজার প্যানেল</h2>
                <p className="text-xs text-slate-400 capitalize">{userRole ?? "ম্যানেজার"}</p>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
            {/* Back Home */}
            <Link
              to="/overview"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition text-xs font-medium"
            >
              <Home size={16} />
              হোমে ফিরে যান
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
                      return (
                        <NavLink
                          key={menu.id}
                          to={menu.id}
                          onClick={() => setOpen(false)}
                          className={({ isActive }) => `
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all
                            ${isActive
                              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            }
                          `}
                        >
                          <Icon size={16} />
                          {menu.name}
                        </NavLink>
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
              মেস ব্যবস্থাপনা সিস্টেম
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              {activeMenu && !isDashboardHome ? (
                <>
                  <span className="text-slate-400 text-sm">ম্যানেজার প্যানেল</span>
                  <ChevronRight size={14} className="text-slate-300" />
                  <span className="text-slate-800 text-sm font-semibold">{activeMenu.name}</span>
                </>
              ) : (
                <span className="text-slate-800 text-sm font-semibold">ড্যাশবোর্ড</span>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg capitalize">
                {userRole ?? "ম্যানেজার"}
              </span>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto bg-slate-50">
            {isDashboardHome ? (
              <div className="p-2 lg:p-10 space-y-8 max-w-4xl mx-auto">
                {/* Welcome Header */}
                <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 shadow-xl relative overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #6366f1 0%, transparent 60%)" }}
                  />
                  <div className="relative z-10">
                    <p className="text-slate-300 text-xs font-medium uppercase tracking-widest mb-2">
                      ম্যানেজার প্যানেল
                    </p>
                    <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">স্বাগতম 👋</h1>
                    <p className="text-blue-200 mt-2 text-xs">
                      আপনার মেস পরিচালনার জন্য সাইডবার থেকে একটি অ্যাকশন নির্বাচন করুন।
                    </p>
                  </div>
                </div>

                {/* Quick Access */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Zap size={16} className="text-orange-500" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">কুইক অ্যাক্সেস</h3>
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
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">সকল অ্যাকশন</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {menus.filter((m) => m.id !== "dashboard").map((menu) => {
                      const Icon = menu.icon;
                      return (
                        <NavLink
                          key={menu.id}
                          to={menu.id}
                          className="flex flex-col items-start gap-2 bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md p-4 rounded-2xl text-left transition-all duration-150 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                            <Icon size={18} className="text-slate-500 group-hover:text-indigo-600 transition-colors" />
                          </div>
                          <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-700 leading-tight">
                            {menu.name}
                          </span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <Outlet context={{ memberNameList }} />
            )}
          </div>
        </main>
      </div>
    </section>
  );
}