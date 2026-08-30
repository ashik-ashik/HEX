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
  ChevronRight,
  Zap,
  Pencil,
} from "lucide-react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";
import useAuth from "../hooks/useAuth";

interface Props {
  managerStatus: boolean;
  memberNameList: string[];
}

interface AuthContextType {
  userRole: string | null;
}

export default function ManagerDashboard({
  memberNameList,
}: Props) {
  const [open, setOpen] = useState(false);

  const { userRole } =
    useAuth() as AuthContextType;

  const location = useLocation();

  const menus = [
    {
      id: "",
      name: "Dashboard",
      icon: LayoutDashboard,
      group: "overview",
    },
    {
      id: "bazar-cost",
      name: "Add Bazar Cost",
      icon: ShoppingCart,
      group: "entry",
    },
    {
      id: "meal-entry",
      name: "Add Meal Entry",
      icon: Utensils,
      group: "entry",
    },
    {
      id: "meal-deposit-entry",
      name: "Add Meal Deposit",
      icon: DollarSign,
      group: "entry",
    },
    {
      id: "utility-deposit-entry",
      name: "Add Utility Deposit",
      icon: Wallet,
      group: "entry",
    },
    {
      id: "utility-costs-entry",
      name: "Add Utility Cost",
      icon: PieChart,
      group: "entry",
    },
    {
      id: "edit-bazar-cost",
      name: "Edit Bazar Cost",
      icon: Pencil,
      group: "edit",
    },
    {
      id: "edit-meal-count-entry",
      name: "Edit Meal Count",
      icon: Pencil,
      group: "edit",
    },
    {
      id: "edit-meal-deposit",
      name: "Edit Meal Deposit",
      icon: Pencil,
      group: "edit",
    },
    {
      id: "edit-utility-deposit",
      name: "Edit Utility Deposit",
      icon: Pencil,
      group: "edit",
    },
    {
      id: "edit-utility-costs",
      name: "Edit Utility Cost",
      icon: Pencil,
      group: "edit",
    },
    {
      id: "add-member",
      name: "Add New Member",
      icon: UserRoundPlus,
      group: "manage",
    },
    {
      id: "next-manager",
      name: "Manage Members",
      icon: UserCog,
      group: "manage",
    },
    {
      id: "setfixedmeal",
      name: "Set Fixed Meal",
      icon: Target,
      group: "manage",
    },
    {
      id: "resetmonth",
      name: "Reset This Month",
      icon: RefreshCcw,
      group: "manage",
    },
  ];

  const groups: {
    key: string;
    label: string;
  }[] = [
    {
      key: "overview",
      label: "Overview",
    },
    {
      key: "entry",
      label: "Data Entry",
    },
    {
      key: "edit",
      label: "Edit Records",
    },
    {
      key: "manage",
      label: "Management",
    },
  ];

  const quickGoMenus = [
    {
      id: "/overview",
      name: "Home",
    },
    {
      id: "/meal-bazar-costs",
      name: "Meals & Bazar Costs",
    },
    {
      id: "/utility",
      name: "Utilities",
    },
    {
      id: "/settlement",
      name: "Settlement",
    },
    {
      id: "/postnotice",
      name: "Post Notice",
    },
  ];

  /*
   * Find the exact menu matching the current route.
   *
   * Dashboard has an empty id, so it must be handled separately.
   *
   * Using `includes("")` would always return true and cause
   * the dashboard to appear active on every page.
   */
  const activeMenu = menus.find((menu) => {
    if (!menu.id) {
      return location.pathname.endsWith(
        "/manager"
      );
    }

    return location.pathname.endsWith(
      `/${menu.id}`
    );
  });

  const isDashboardHome =
    !activeMenu ||
    location.pathname.endsWith("/manager");

  return (
    <section className="min-h-screen bg-slate-100">
      <div className="flex h-screen">

        {/* Mobile Toggle Button */}
        <button
          id="managerDashboardMobileMenuIcon"
          onClick={() => setOpen(!open)}
          className="lg:hidden fixed top-1 right-4 z-[9999] bg-white border border-slate-200 p-2.5 rounded-xl shadow-md transition hover:bg-slate-50"
        >
          {open ? (
            <X size={20} />
          ) : (
            <Menu size={20} />
          )}
        </button>

        {/* Mobile Overlay */}
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
            transform ${
              open
                ? "translate-x-0"
                : "-translate-x-full"
            }
            lg:translate-x-0 transition-transform duration-200 ease-in-out
          `}
        >

          {/* Sidebar Header */}
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                <LayoutDashboard
                  size={18}
                  className="text-white"
                />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Manager Panel
                </h2>

                <p className="text-xs text-slate-400 capitalize">
                  {userRole ?? "Manager"}
                </p>
              </div>

            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">

            {/* Back to Home */}
            <Link
              to="/overview"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition text-xs font-medium"
            >
              <Home size={16} />
              Back to Home
            </Link>

            {/* Grouped Menu Items */}
            {groups.map((group) => {
              const items = menus.filter(
                (menu) =>
                  menu.group === group.key
              );

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
                          end
                          onClick={() =>
                            setOpen(false)
                          }
                          className={({
                            isActive,
                          }) => `
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all
                            ${
                              isActive
                                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            }
                          `}
                        >
                          <Icon size={16} />
                          {menu?.name}
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
              Mess Management System
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">

          {/* Top Bar */}
          <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">

            <div className="flex items-center gap-2">

              {activeMenu &&
              !isDashboardHome ? (
                <>
                  <span className="text-slate-400 text-sm">
                    Manager Panel
                  </span>

                  <ChevronRight
                    size={14}
                    className="text-slate-300"
                  />

                  <span className="text-slate-800 text-sm font-semibold">
                    {activeMenu?.name}
                  </span>
                </>
              ) : (
                <span className="text-slate-800 text-sm font-semibold">
                  Dashboard
                </span>
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

            {isDashboardHome ? (
              <div className="p-2 lg:p-10 space-y-8 max-w-4xl mx-auto">

                {/* Welcome Header */}
                <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 shadow-xl relative overflow-hidden">

                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 80% 20%, #6366f1 0%, transparent 60%)",
                    }}
                  />

                  <div className="relative z-10">

                    <p className="text-slate-300 text-xs font-medium uppercase tracking-widest mb-2">
                      Manager Panel
                    </p>

                    <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
                      Welcome 👋
                    </h1>

                    <p className="text-blue-200 mt-2 text-xs">
                      Select an action from the
                      sidebar to manage your
                      mess.
                    </p>

                  </div>
                </div>

                {/* Quick Access */}
                <div>

                  <div className="flex items-center gap-2 mb-4">
                    <Zap
                      size={16}
                      className="text-orange-500"
                    />

                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">
                      Quick Access
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {quickGoMenus.map(
                      (item) => (
                        <Link
                          key={item.id}
                          to={item.id}
                          className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 shadow-sm"
                        >
                          {item?.name}
                        </Link>
                      )
                    )}
                  </div>

                </div>

                {/* Action Grid */}
                <div>

                  <div className="flex items-center gap-2 mb-4">
                    <LayoutDashboard
                      size={16}
                      className="text-indigo-500"
                    />

                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">
                      All Actions
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {menus
                      .filter(
                        (menu) =>
                          menu.id !==
                          "dashboard"
                      )
                      .map((menu) => {
                        const Icon =
                          menu.icon;

                        return (
                          <NavLink
                            key={menu.id}
                            to={menu.id}
                            end
                            className="flex flex-col items-start gap-2 bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md p-4 rounded-2xl text-left transition-all duration-150 group"
                          >
                            <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                              <Icon
                                size={18}
                                className="text-slate-500 group-hover:text-indigo-600 transition-colors"
                              />
                            </div>

                            <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-700 leading-tight">
                              {menu?.name}
                            </span>
                          </NavLink>
                        );
                      })}
                  </div>

                </div>

              </div>
            ) : (
              <Outlet
                context={{ memberNameList }}
              />
            )}

          </div>
        </main>

      </div>
    </section>
  );
}