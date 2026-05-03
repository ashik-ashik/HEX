import { Link } from "react-router-dom";
import {
  FaUtensils,
  FaUsers,
  FaClipboardList,
  FaChartPie,
  FaArrowRight,
  FaHome,
  FaSignInAlt,
  FaUserCircle,
  FaWifi,
  FaNewspaper,
  FaLock,
  FaTint,
  FaSmile,
  FaCheckCircle,
} from "react-icons/fa";
import HouseLocation from "./HouseLocation";
import { type User } from "firebase/auth";
import useAuth from "../hooks/useAuth";
import HexSpecialEvents from "./HexSpecialEvents";

const HomeInitial = () => {
  const { user } = useAuth() as { user: User | null };
  return (
    <div className="bg-black/80 min-h-screen">

      {/* ── Navbar ── */}
      <nav className="flex items-center justify-end px-6 py-4 shadow-md bg-gray-900 border-b border-gray-700 gap-x-4">
        <Link
          to="/"
          className="text-sm font-semibold font-mono text-gray-300 hover:text-green-400 transition-colors"
        >
          Home
        </Link>
        <Link
          to="/history"
          className="text-sm font-semibold font-mono text-gray-300 hover:text-green-400 transition-colors"
        >
          History
        </Link>
        <div>
          {user ? (
            <Link to="/login" title="Login">
              <FaUserCircle className="text-xl text-gray-300 hover:text-green-400 transition-colors" />
            </Link>
          ) : (
            <Link to="/login" title="Login">
              <FaSignInAlt className="text-xl text-gray-300 hover:text-green-400 transition-colors" />
            </Link>
          )}
        </div>
      </nav>

      {/* ── Hero Section ── */}
      {/* ── Hero Section ── */}
<section className="pt-28 pb-16 px-4">
  <div className="max-w-6xl mx-auto">
    <div className="grid md:grid-cols-2 gap-10 items-center">

      {/* Left Content */}
      <div>
        <div className="inline-flex items-center gap-2 bg-blue-900/60 text-blue-300 border border-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-5">
          <FaHome />
          Welcome to Hex Bachelor House
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
          A Comfortable &
          <span className="text-blue-400 pt-2 inline-block"> Secure Bachelor Living Space</span>
        </h1>

        <p className="text-gray-400 text-md md:text-lg leading-relaxed mb-8">
          Hex Bachelor House is more than just a place to stay — it is a
          peaceful, organized, and friendly home for students bachelors. Located in Mirpur, Dhaka, it offers a comfortable living
          environment with modern facilities, quality meals, strong security,
          and a supportive community where members can focus on study, work,
          and personal growth.
        </p>

        <div className="flex flex-wrap gap-4">
          {!user && (
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition"
            >
              Login with Google
              <FaArrowRight />
            </Link>
          )}
          <div className="bg-gray-800 border border-gray-600 px-6 py-3 rounded-xl text-gray-300 font-medium">
            Member & Manager Access Only
          </div>
        </div>
      </div>

      {/* Right Card */}
      <div className="bg-gray-800/60 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-700 p-8">
        <h3 className="text-xl font-semibold text-white mb-5">
          House Information
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">House Name</p>
            <p className="font-medium text-gray-200">Hex Bachelor House</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Address</p>
            <p className="font-medium text-sm text-gray-200 leading-relaxed">
              Kathaltola, 1051/1, Monipur,
              <br />
              Mirpur-2, Dhaka
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Environment</p>
            <p className="font-medium text-gray-200 text-sm">
              Peaceful • Clean • Friendly • Well-Managed
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Security</p>
            <p className="font-medium text-blue-400">
              Safe & Protected Living Space
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* ── Hex Bachelor House Core Features ── */}
      <section className="pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">
              Hex Bachelor House Core Features
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Everything you need for a comfortable, connected, and secure
              bachelor living experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800/60 rounded-2xl p-6 shadow-md border border-gray-700 hover:border-cyan-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-cyan-900/50 flex items-center justify-center text-cyan-400 text-xl mb-4">
                <FaTint />
              </div>
              <h3 className="font-semibold text-gray-100 mb-2">Electric Water Filter</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Clean and purified drinking water available for all members at all times.
              </p>
            </div>

            <div className="bg-gray-800/60 rounded-2xl p-6 shadow-md border border-gray-700 hover:border-yellow-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-yellow-900/50 flex items-center justify-center text-yellow-400 text-xl mb-4">
                <FaNewspaper />
              </div>
              <h3 className="font-semibold text-gray-100 mb-2">Regular Newspaper</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Daily newspaper delivered to the house to keep members up to date.
              </p>
            </div>

            <div className="bg-gray-800/60 rounded-2xl p-6 shadow-md border border-gray-700 hover:border-indigo-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-900/50 flex items-center justify-center text-indigo-400 text-xl mb-4">
                <FaWifi />
              </div>
              <h3 className="font-semibold text-gray-100 mb-2">WiFi</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                High-speed internet connectivity available throughout the entire house.
              </p>
            </div>

            <div className="bg-gray-800/60 rounded-2xl p-6 shadow-md border border-gray-700 hover:border-green-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-green-900/50 flex items-center justify-center text-green-400 text-xl mb-4">
                <FaUtensils />
              </div>
              <h3 className="font-semibold text-gray-100 mb-2">Meal System</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Helping hand makes meals regularly for members for lunch, dinner, and breakfast.
              </p>
            </div>

            <div className="bg-gray-800/60 rounded-2xl p-6 shadow-md border border-gray-700 hover:border-pink-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-pink-900/50 flex items-center justify-center text-pink-400 text-xl mb-4">
                <FaSmile />
              </div>
              <h3 className="font-semibold text-gray-100 mb-2">Friendly Environment</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                A warm, welcoming, and respectful atmosphere maintained by all house members.
              </p>
            </div>

            <div className="bg-gray-800/60 rounded-2xl p-6 shadow-md border border-gray-700 hover:border-red-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-red-900/50 flex items-center justify-center text-red-400 text-xl mb-4">
                <FaLock />
              </div>
              <h3 className="font-semibold text-gray-100 mb-2">Biometric Security</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Fingerprint-based secure access ensures only authorized members can enter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Latest Events — portal modal, no wrapper needed ── */}
      
      {/* Events */}
      <HexSpecialEvents />

      {/* ── Membership Criteria Card ── */}
      <section className="pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">
              Conditions to Be a Member
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Hex House welcomes everyone who shares our values of respect,
              cooperation, and community.
            </p>
          </div>

          <div className="bg-gray-800/60 rounded-2xl shadow-md border-2 border-blue-800 p-8 mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-900/60 flex items-center justify-center text-blue-400 text-lg">
                <FaHome />
              </div>
              <div>
                <h3 className="font-semibold text-gray-100">Member Conduct Requirements</h3>
                <p className="text-sm text-gray-300">All residents must meet these standards</p>
              </div>
              <span className="ml-auto text-xs font-medium bg-blue-900/60 text-blue-300 border border-blue-700 px-3 py-1 rounded-full">
                Required
              </span>
            </div>

            <div className="border-t border-gray-700 pt-6 grid sm:grid-cols-2 gap-4">
              {[
                { label: "Polite",          desc: "Respectful and courteous in all interactions with fellow members." },
                { label: "Collaborative",   desc: "Willing to work together and share responsibilities in the house." },
                { label: "Cooperative",     desc: "Supportive of house rules and collective household decisions." },
                { label: "Friendly Minded", desc: "Approachable and kind, contributing to a positive atmosphere." },
              ].map(({ label, desc }) => (
                <div key={label} className="flex items-start gap-3">
                  <FaCheckCircle className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-100 text-md">{label}</p>
                    <p className="text-sm text-gray-300 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Core App Features ── */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Core App Features</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Designed to simplify bachelor house management with clarity, automation,
              and better coordination between members.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <FaUtensils />,      bgIcon: "bg-blue-900/50",   iconColor: "text-blue-400",   border: "hover:border-blue-700",   title: "Meal Planning",   desc: "Manage lunch and dinner plans efficiently for the whole month." },
              { icon: <FaUsers />,         bgIcon: "bg-green-900/50",  iconColor: "text-green-400",  border: "hover:border-green-700",  title: "Member Control",  desc: "Role-based access for members and managers with secure control." },
              { icon: <FaClipboardList />, bgIcon: "bg-yellow-900/50", iconColor: "text-yellow-400", border: "hover:border-yellow-700", title: "Daily Tracking",  desc: "Track meals, attendance, and monthly records with accuracy." },
              { icon: <FaChartPie />,      bgIcon: "bg-purple-900/50", iconColor: "text-purple-400", border: "hover:border-purple-700", title: "Monthly Summary", desc: "View reports, calculations, and complete house summaries easily." },
            ].map(({ icon, bgIcon, iconColor, border, title, desc }) => (
              <div key={title} className={`bg-gray-800/60 rounded-2xl p-6 shadow-md border border-gray-700 ${border} transition-colors`}>
                <div className={`w-12 h-12 rounded-xl ${bgIcon} flex items-center justify-center ${iconColor} text-xl mb-4`}>
                  {icon}
                </div>
                <h3 className="font-semibold text-gray-100 mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <HouseLocation />
      </section>
    </div>
  );
};

export default HomeInitial;