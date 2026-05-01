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
} from "react-icons/fa";
import HouseLocation from "./HouseLocation";
import {
  type User,

} from "firebase/auth";
import useAuth from "../hooks/useAuth";

const HomeInitial = () => {
  const { user } = useAuth() as { user: User | null };
  return (
    <div className="min-h-screen bg-white/70 backdrop-blur-sm from-blue-50 via-white to-indigo-50">
      <nav className="flex items-center justify-end px-6 py-4 shadow-md bg-white gap-x-4">
      {/* Logo / Home */}
      <Link
        to="/"
        className="text-sm font-semibold font-mono text-gray-600 hover:text-green-700"
      >
        Home
      </Link>
      <Link
        to="/history"
        className="text-sm font-semibold font-mono text-gray-600 hover:text-green-700"
      >
        Histry
      </Link>

      {/* Right Side */}
      <div>
        {user ? <Link to="/login" title="Login">
          <FaUserCircle className="text-xl text-gray-700 hover:text-green-600" />
        </Link> 
        : 
          <Link to="/login" title="Login">
            <FaSignInAlt className="text-xl text-gray-700 hover:text-green-600" />
          </Link>
        }
      </div>
    </nav>
      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-5">
                <FaHome />
                Welcome to Hex Bachelor House
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-gray-800 leading-tight mb-6">
                Smart Meal & Member
                <span className="text-blue-600 pt-2 inline-block"> Management System</span>
              </h1>

              <p className="text-gray-600 text-md md:text-lg leading-relaxed mb-8">
                A complete bachelor house management platform for handling
                daily meals, member coordination, monthly planning, and smooth
                household operations — all in one place.
              </p>

              <div className="flex flex-wrap gap-4">
                {
                  !user && 
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition"
                >
                  Login with Google
                  <FaArrowRight />
                </Link>
                }

                <div className="bg-white border border-gray-200 px-6 py-3 rounded-xl text-gray-600 font-medium">
                  Member & Manager Access Only
                </div>
              </div>
            </div>

            {/* Right Card */}
            <div className="bg-white/20 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-5">
                House Information
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">House Name</p>
                  <p className="font-medium text-gray-700">
                    Hex Bachelor House
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium text-gray-700 leading-relaxed">
                    Kathaltola, 1051/1, Monipur,
                    <br />
                    Mirpur-2, Dhaka
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">System Purpose</p>
                  <p className="font-medium text-gray-700">
                    Meal Planning • Member Management • Monthly Reports
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Access Type</p>
                  <p className="font-medium text-blue-600">
                    Protected Member Dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Core Features
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Designed to simplify bachelor house management with clarity,
              automation, and better coordination between members.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-white/50 rounded-2xl p-6 shadow-md border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-xl mb-4">
                <FaUtensils />
              </div>

              <h3 className="font-semibold text-gray-800 mb-2">
                Meal Planning
              </h3>

              <p className="text-sm text-gray-500 leading-relaxed">
                Manage lunch and dinner plans efficiently for the whole month.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white/50 rounded-2xl p-6 shadow-md border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 text-xl mb-4">
                <FaUsers />
              </div>

              <h3 className="font-semibold text-gray-800 mb-2">
                Member Control
              </h3>

              <p className="text-sm text-gray-500 leading-relaxed">
                Role-based access for members and managers with secure control.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white/50 rounded-2xl p-6 shadow-md border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600 text-xl mb-4">
                <FaClipboardList />
              </div>

              <h3 className="font-semibold text-gray-800 mb-2">
                Daily Tracking
              </h3>

              <p className="text-sm text-gray-500 leading-relaxed">
                Track meals, attendance, and monthly records with accuracy.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white/50 rounded-2xl p-6 shadow-md border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 text-xl mb-4">
                <FaChartPie />
              </div>

              <h3 className="font-semibold text-gray-800 mb-2">
                Monthly Summary
              </h3>

              <p className="text-sm text-gray-500 leading-relaxed">
                View reports, calculations, and complete house summaries easily.
              </p>
            </div>
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