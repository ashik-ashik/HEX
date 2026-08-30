import { Link } from "react-router-dom";
import {
  FaUtensils,
  FaUsers,
  FaClipboardList,
  FaChartPie,
  FaArrowRight,
  FaHome,
  FaWifi,
  FaNewspaper,
  FaLock,
  FaTint,
  FaSmile,
  FaCheckCircle,
  FaSmokingBan,
  FaBed,
  FaBath,
  FaMoneyBillWave,
  FaDoorOpen,
} from "react-icons/fa";
import HouseLocation from "./HouseLocation";
import { type User } from "firebase/auth";
import useAuth from "../hooks/useAuth";
import HexaSpecialEvents from "./HexaSpecialEvents";
import Header from "./Header";



const HomeInitial = () => {
  const { user } = useAuth() as { user: User | null; };

  const rooms = [
    {
      name: "West Room",
      seats: 3,
      price: 2100,
      bathroom: "Shared bathroom (with Dining Space)",
      icon: <FaBed />,
      bg: "bg-blue-900/50",
      color: "text-blue-400",
      border: "hover:border-blue-700",
    },
    {
      name: "East Room",
      seats: 2,
      price: 3100,
      bathroom: "Attached bathroom",
      icon: <FaBed />,
      bg: "bg-green-900/50",
      color: "text-green-400",
      border: "hover:border-green-700",
    },
    {
      name: "Dining Space",
      seats: 1,
      price: 1600,
      bathroom: "Shared bathroom (with West Room)",
      icon: <FaUtensils />,
      bg: "bg-yellow-900/50",
      color: "text-yellow-400",
      border: "hover:border-yellow-700",
    },
  ];

  return (
    <div className="bg-black/80 min-h-screen">

      {/* ── Navbar ── */}
      <Header />

      {/* ── Hero Section ── */}
      <section className="pt-28 pb-16 px-2">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">

            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-900/60 text-blue-300 border border-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-5">
                <FaHome />
                Welcome to Hexa Haven
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
                A Comfortable &
                <span className="text-blue-400 pt-2 inline-block"> Secure Bachelor Living Space</span>
              </h1>

              <p className="text-gray-400 text-md md:text-lg leading-relaxed mb-8">
                Hexa Haven is more than just a place to stay — it is a
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
                  <p className="font-medium text-gray-200">Hexa Haven</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium text-sm text-gray-200 leading-relaxed">
                    Kathaltola, 1051/1, East Monipur,
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

      {/* ── Hexa Haven Core Features ── */}
      <section className="pb-16 px-2">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">
              Hexa Haven Core Features
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

      
      {/* ── Rooms & Seat Pricing ── */}
      <section className="pb-20 px-2">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">
              Room Information & Seat Pricing
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Two rooms and a dining space, arranged around a central kitchen —
              transparent seat pricing for every space.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {rooms.map(({ name, seats, price, bathroom, icon, bg, color, border }) => (
              <div
                key={name}
                className={`bg-gray-800/60 rounded-2xl p-6 shadow-md border border-gray-700 ${border} transition-colors flex flex-col`}
              >
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center ${color} text-xl mb-4`}>
                  {icon}
                </div>
                <h3 className="font-semibold text-gray-100 mb-1">{name}</h3>
                <p className="text-sm text-gray-400 mb-4">
                  {seats} {seats > 1 ? "seats" : "seat"} in this room
                </p>

                <div className="mt-auto space-y-3 border-t border-gray-700 pt-4">
                  <div className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-blue-400 flex-shrink-0" />
                    <p className="text-sm text-gray-200">
                      <span className="font-semibold text-blue-400">{price} tk</span> / seat / month
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaBath className="text-cyan-400 flex-shrink-0" />
                    <p className="text-sm text-gray-300">{bathroom}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Shared / Layout note */}
          <div className="bg-gray-800/60 rounded-2xl shadow-md border border-gray-700 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-900/50 flex items-center justify-center text-purple-400 text-xl flex-shrink-0">
              <FaDoorOpen />
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              <span className="font-medium text-gray-100">Layout note: </span>
              The West Room and Dining Space share one common bathroom, while the East Room
              has its own attached bathroom. A shared kitchen sits at the center of the house,
              accessible to all members.
            </p>
          </div>
        </div>
      </section>

      {/* ── Latest Events — portal modal, no wrapper needed ── */}
      <HexaSpecialEvents eventLimit={4} />

      {/* ── Membership Criteria Card ── */}
      <section className="pb-20 px-2">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">
              Conditions to Be a Member
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Hexa House welcomes everyone who shares our values of respect,
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

            {/* No Smoking — a hard restriction, styled separately from the conduct traits above */}
            <div className="border-t border-gray-700 mt-6 pt-6">
              <div className="flex items-start gap-3 bg-red-950/30 border border-red-800/60 rounded-xl p-4">
                <FaSmokingBan className="text-red-400 mt-0.5 flex-shrink-0 text-lg" />
                <div>
                  <p className="font-medium text-gray-100 text-md">No Smoking</p>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Smoking is strictly prohibited anywhere inside the house, including private rooms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ── Core App Features ── */}
      <section className="pb-20 px-2">
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