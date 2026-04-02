import { useState } from "react";
import {
    LayoutDashboard,
  Home,
  Users,
  DollarSign,
  Wallet,
  Utensils,
  LogOut,
  Menu,
  X,
  PieChart,
  Key,
  ShoppingCart,
  Target,
  RefreshCcw,
} from "lucide-react";
import EntryBazarCosts from "./EntryBazarCosts";
import MealCountEntry from "./MealCountEntry";
import EntryMealDeposit from "./EntryMealDeposit";
import ChangeManager from "./NextManagerSelection";
import EntryUtilityDeposit from "./EntryUtilityDeposit";
import LoginAsManager from "./LoginAsManager";
import UtilityCostEntry from "./EntryUtilityCosts";
import { Link } from "react-router-dom";
import SetFixedMeal from "./SetFixedMeal";
import ResetMonth from "./ResetThisMonth";

interface Props {
  managerStatus: boolean;
}

export default function ManagerDashboard({ managerStatus }: Props) {
  const [active, setActive] = useState("dashboard");
  const [open, setOpen] = useState(false);

  const menus = [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
    { id: "bazar-cost", name: "Bazar Cost", icon: ShoppingCart },
    { id: "meal-entry", name: "Meal Entry", icon: Utensils },
    { id: "meal-deposit-entry", name: "Meal Deposit", icon: DollarSign },
    { id: "utility-deposit-entry", name: "Utility Deposit", icon: Wallet },
    { id: "utility-costs-entry", name: "Utility Cost", icon: PieChart },
    { id: "next-manager", name: "Make Manager", icon: Users },
    { id: "imanager", name: "PassKey", icon: Key },
    { id: "setfixedmeal", name: "Set Fixed Meal", icon: Target },
    { id: "resetmonth", name: "Reset Month", icon: RefreshCcw },
  ];

  const quickGoMenus = [
    {id:'/', name:'Home'},
    {id:'/dashboard', name:'Dashboard'},
    {id:'/utility', name:'Utility'},
    {id:'/settlement', name:'Settlement'},
    {id:'/postnotice', name:'Post Notice'},    
  ]

  const renderPage = () => {
    switch (active) {
      case "bazar-cost":
        return <EntryBazarCosts managerStatus={managerStatus} />;
      case "meal-entry":
        return <MealCountEntry managerStatus={managerStatus} />;
      case "meal-deposit-entry":
        return <EntryMealDeposit managerStatus={managerStatus} />;
      case "utility-deposit-entry":
        return <EntryUtilityDeposit managerStatus={managerStatus} />;
      case "utility-costs-entry":
        return <UtilityCostEntry managerStatus={managerStatus} />;
      case "imanager":
        return <LoginAsManager managerStatus={managerStatus} />;
      case "next-manager":
        return <ChangeManager managerStatus={managerStatus} />;
      case "setfixedmeal":
        return <SetFixedMeal managerStatus={managerStatus} />;
      case "resetmonth":
        return <ResetMonth  />;
      
      default:
        return (
          <div className="lg:p-8 p-2">
            {/* Header */}
            <div className="mb-6 p-4 backdrop-blur-md">
                <h1 className="text-3xl font-extrabold text-gray-800">
                Manager Dashboard
                </h1>
                <p className="text-gray-600 mt-2">
                Welcome Manager 👋. Select an action from the sidebar to begin.
                </p>
            </div>

            {/* Caution Card */}
            <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 border-l-4 border-yellow-500 lg:p-6 p-4 rounded-lg shadow-md flex flex-col gap-3">
                <div className="flex items-center gap-3">
                <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                >
                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01M5.07 19h13.86C20.18 19 21 18.18 21 17.07V6.93C21 5.82 20.18 5 19.07 5H5.07C3.96 5 3.14 5.82 3.14 6.93v10.14C3.14 18.18 3.96 19 5.07 19z"
                    />
                </svg>
                <h2 className="text-lg font-semibold text-yellow-800">Important Notice</h2>
                </div>
                <p className="text-yellow-900">
                ⚠️ This is a <strong>virtual storage system</strong> built with technology. 
                It helps us manage data efficiently, but it <strong>can crash at any time</strong>. 
                As a result, we <strong>can lose data</strong>. Do not fully depend on this system. 
                Always note your important information in your personal notepad or secure storage.
                </p>
                <ul className="list-disc list-inside text-yellow-900 ml-2">
                <li>Double-check any critical entries.</li>
                <li>Keep backup notes outside the system.</li>
                <li>Use this system as a helper, not a sole keeper.</li>
                </ul>
            </div>
            
            <div className="mt-6 text-center">
              <h3 className="text-center mb-4 font-bold inline-block bg-orange-500 text-white px-4 py-2 rounded-md mx-auto">
                  Quick Go 👇👇

                </h3>
              <div className="flex items-center justify-center gap-1">
                {
                  quickGoMenus.length !==0 ? <>
                  {quickGoMenus.map((item) => <Link to={item?.id} className="bg-indigo-500 text-white px-4 py-2 rounded-md text-xs">
                    {item.name}
                  </Link>)}
                  </>:<>
                  <p className="text-gray-500 text-sm">No quick access available. Please select an action from the sidebar.</p>
                  </>
                }
              </div>
            </div>
          </div>
        );
    }
  };

  const logOutofManager = () => {
    sessionStorage.setItem("authenticManager",'Fake People');
    // optional redirect
        setTimeout(() => {
          window.location.href = "/"; // change if needed
        }, 1000);
  }

  return (
    <>
    <section className=" bg-gray-100/40 backdrop-blur-sm">
        <div className="flex h-screen ">
        {/* Mobile Menu Button */}
        <button id="managerDashboardMobileMenuIcon"
            onClick={() => setOpen(!open)}
            className="lg:hidden fixed top-3 right-4 z-99999 bg-white p-2 rounded-lg shadow"
        >
            {open ? <X /> : <Menu />}
        </button>

        {/* Sidebar */}
        <div
            className={`
            fixed lg:static z-40
            w-64 h-full bg-white shadow-lg flex flex-col
            transform ${open ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 transition duration-200
            `}
        >
            <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Manager Panel</h2>
            </div>

            {/* Scrollable Menu Items */}
            <div className="p-4 space-y-2 flex-1 overflow-y-auto">
                <Link to="/"
                    className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition
                     text-black text-xs
                    `}
                >
                    <Home size={18} />
                    Back Home
                </Link>
            {menus.map((menu) => {
                const Icon = menu.icon;
                return (
                <button
                    key={menu.id}
                    onClick={() => {
                    setActive(menu.id);
                    setOpen(false);
                    }}
                    className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-xs
                    ${active === menu.id ? "bg-blue-500 text-white" : "hover:bg-gray-100"}
                    `}
                >
                    <Icon size={18} />
                    {menu.name}
                </button>
                );
            })}
            </div>

            <div className="p-4">
            <button onClick={logOutofManager} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-500">
                <LogOut size={18} />
                Logout
            </button>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
            <div className="bg-white shadow p-4">
            <h1 className="text-lg font-semibold capitalize">
                {active.replace(/-/g, " ")}
            </h1>
            </div>
            <div className="">{renderPage()}</div>
        </div>
        </div>    
    </section>
    </>
  );
}
