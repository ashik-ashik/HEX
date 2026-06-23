import HexSpecialEvents from "./HexSpecialEvents";


const AllEvents = () => {
  return (
    <div className="min-h-screen backdrop-blur-md ">
        <div className="text-center bg-black/40 py-24">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100">
            All Events
          </h1>
          <p className="text-gray-200 mt-3 text-lg">
            Explore all events of Hex Bachelor House in one place
          </p>
        </div>
      <div className="max-w-7xl mx-auto">

        {/* 🔷 Header */}
        <HexSpecialEvents eventLimit = {1000} />
      </div>
    </div>
  );
};

export default AllEvents;