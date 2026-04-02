import Footer from "./Footer";
import Header from "./Header";
// Type for each deposit item
export type UtilityDeposit = {
  member: string;
  total: number;
};
interface UtilitySummaryProps {
  utilityCosts: string[][];
  isLoading: boolean;
  isError: boolean;
  utilityDeposits: UtilityDeposit[];
}




const UtilitySummary: React.FC<UtilitySummaryProps> = ({ utilityDeposits, utilityCosts, isLoading, isError }) => {


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin h-14 w-14 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-600 font-semibold py-16">
        {"error"}
      </div>
    );
  }

// ===== Utility Deposit Calculation (NEW FORMAT) =====

  const grandDeposit = utilityDeposits.reduce(
    (sum, person) => sum + person.total,
    0
  );

  // ===== Utility Cost Calculation =====
  const costRows = utilityCosts.slice(1);

  const costSummary = costRows
    .filter((row) => row[0])
    .map((row) => {
      const name = row[0];
      const costs = row.slice(1)?.map((v:string) => Number(v) || 0);
      const total = costs.reduce((a:number, b:number) => a + b, 0);
      return { name, total };
    });

  const totalCosts = costSummary.reduce(
    (sum, item) => sum + item.total,
    0
  );

  const utilityBalance = grandDeposit - totalCosts;

  return (
    <>
    <Header />
    <div className=" transparent-bg">
    <div className="max-w-6xl mx-auto px-2 pt-24 space-y-12">
      <h1 className="md:text-2xl text-lg font-bold text-center mb-8 text-gray-800 text-shadow py-12">
        Utility Calculation and Summary
      </h1>
      {/* ===== Summary Cards ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-6">

        <div className="backdrop-blur-sm bg-green-700/10 p-5 rounded-xl shadow hover:shadow-lg transition text-center">
          <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wide">
            Total Deposit
          </h3>
          <p className="text-sm font-bold text-green-800 mt-2">
            ৳ {grandDeposit.toFixed(0)}
          </p>
        </div>

        <div className="backdrop-blur-sm bg-orange-700/10 p-5 rounded-xl shadow hover:shadow-lg transition text-center">
          <h3 className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
            Total Costs
          </h3>
          <p className="text-sm font-bold text-orange-800 mt-2">
            ৳ {totalCosts.toFixed(0)}
          </p>
        </div>

        <div
          className={`col-span-2 backdrop-blur-sm sm:col-span-1 p-5 rounded-xl shadow hover:shadow-lg transition text-center
          ${utilityBalance >= 0 ? "bg-blue-700/10" : "bg-red-700/10"}`}
        >
          <h3 className="text-xs font-semibold uppercase tracking-wide">
            Remaining Cash
          </h3>
          <p
            className={`text-xl font-bold mt-2
            ${utilityBalance >= 0 ? "text-blue-700" : "text-red-700"}`}
          >
            ৳ {utilityBalance.toFixed(0)}
          </p>
        </div>
      </div>

      {/* ===== Utility Deposit Section ===== */}
      <div className="backdrop-blur-sm bg-white-700/10 shadow-xl rounded-2xl px-2 md:px-4">
        <h2 className="text-lg font-bold mb-6 p-4 text-center text-gray-900">
          Utility Deposit
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6">
          {utilityDeposits.map((person, i) => (
            <div
              key={i}
              className="backdrop-blur-sm bg-green-700/10 p-4 rounded-xl text-center shadow hover:shadow-md transition"
            >
              <p className="text-sm text-gray-800 font-mono">{person.member}</p>
              <p className="md:text-lg text-sm font-bold text-green-700 mt-1">
                ৳ {person.total.toFixed(0)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center pb-5 text-sm font-bold text-green-800 pt-4 border-t border-green-700/50">
          Total Deposit: ৳ {grandDeposit.toFixed(2)}
        </div>
      </div>

      {/* ===== Utility Costs Section ===== */}
      <div className="backdrop-blur-sm bg-white-700/10 shadow-xl rounded-2xl p-2">
        <h2 className="text-lg font-bold p-4 text-center mb-6 text-gray-900">
          Utility Costs
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 md:gap-4 gap-2">
          {costSummary.map((item, i) => (
            <div
              key={i}
              className="backdrop-blur-sm bg-red-700/10 p-4 rounded-xl text-center shadow hover:shadow-md transition"
            >
              <p className="text-xs text-gray-600">{item.name}</p>
              <p className="text-sm md:text-lg font-bold text-red-700 mt-1">
                ৳ {item.total.toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-sm font-bold text-red-800 p-4 border-t border-red-700/50">
          Total Costs: ৳ {totalCosts.toFixed(2)}
        </div>
      </div>
          <br />
    </div>
    </div>

    <Footer />
    </>
  );
};

export default UtilitySummary;