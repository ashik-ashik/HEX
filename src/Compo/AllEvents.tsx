import Footer from "./Footer";
import Header from "./Header";
import HexaSpecialEvents from "./HexaSpecialEvents";


const AllEvents = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen backdrop-blur-md ">
          <div className="text-center bg-black/40 py-24">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-100">
              All Events
            </h1>
            <p className="text-gray-200 mt-3 text-lg">
              Explore all events of Hexa Haven in one place
            </p>
          </div>
        <div className="max-w-7xl mx-auto">

          {/* 🔷 Header */}
          <HexaSpecialEvents eventLimit = {1000} />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AllEvents;