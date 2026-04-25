import { FaMapMarkerAlt, FaDirections, FaHome } from "react-icons/fa";

const HouseLocation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-24 px-4 pb-16">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FaHome />
            House Location
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Find Hex Bachelor House Easily
          </h1>

          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Use the live Google Map below to locate our house easily and get
            direct navigation support to reach us without hassle.
          </p>
        </div>

        {/* Main Card */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                <FaMapMarkerAlt />
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  House Address
                </h2>
                <p className="text-sm text-gray-500">
                  Exact location details
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Full Address
                </p>
                <p className="text-gray-700 font-medium leading-relaxed">
                  Kathaltola, 1051/1, Monipur,
                  <br />
                  Mirpur-2, Dhaka
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Nearby Landmark
                </p>
                <p className="text-gray-700 font-medium">
                  Monipur School Area, Mirpur-2
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Access Support
                </p>
                <p className="text-gray-700 font-medium">
                  Google Maps Navigation Available
                </p>
              </div>
            </div>

            {/* Direction Button */}
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=23.802789,90.367445"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition shadow-md"
            >
              <FaDirections />
              Get Directions
            </a>
          </div>

          {/* Right Map */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 overflow-hidden">
            <div className="rounded-2xl overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3663.1181826568245!2d90.3674453191201!3d23.80278900080012!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sbd!4v1777132332238!5m2!1sen!2sbd"
                width="100%"
                height="500"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Hex Bachelor House Location"
                className="rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseLocation;