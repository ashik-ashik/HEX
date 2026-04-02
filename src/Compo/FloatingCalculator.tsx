import { useState } from "react";

const FloatingCalculator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expression, setExpression] = useState("");

  const handleClick = (value: string) => {
    if (value === "C") {
      setExpression("");
      return;
    }

    if (value === "DEL") {
      setExpression((prev) => prev.slice(0, -1));
      return;
    }

    if (value === "=") {
      try {
        // eslint-disable-next-line react-hooks/unsupported-syntax
        const result = eval(expression);
        setExpression(result.toString());
      } catch {
        setExpression("Error");
      }
      return;
    }

    setExpression((prev) => prev + value);
  };

  const buttons = [
    "7", "8", "9", "/",
    "4", "5", "6", "*",
    "1", "2", "3", "-",
    "0", ".", "%", "+",
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 left-5 z-40 bg-blue-600 hover:bg-blue-700 text-white w-8 h-8 rounded-full shadow-lg flex items-center justify-center transition-all duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform duration-300 ${
            isOpen ? "rotate-45" : "rotate-0"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {/* plus icon that rotates */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v18m9-9H3"
          />
        </svg>
      </button>

      {/* Calculator Panel */}
      {isOpen && (
        <div className="fixed bottom-20 left-5 z-40 bg-white/30 backdrop-blur-sm w-64 rounded-2xl shadow-2xl p-4 animate-scaleUp">
          
          {/* Display */}
          <div className="bg-gray-50/60 rounded-lg p-2 mb-3 text-right text-sm font-semibold break-all border border-gray-200 backdrop-blur-sm shadow-[inset_0_3px_6px_rgba(0,0,0,0.2),inset_0_-2px_3px_rgba(255,255,255,0.7)]">
            {expression || "0"}
          </div>

          {/* Top Row (Delete + Clear) */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={() => handleClick("DEL")}
              className="bg-orange-500/80 hover:bg-orange-600 uppercase text-white rounded-lg py-2 text-xs font-medium"
            >
              Del
            </button>

            <button
              onClick={() => handleClick("C")}
              className="bg-red-500/80 hover:bg-red-600 text-white rounded-lg py-2 text-xs"
            >
              Clear
            </button>
          </div>

          {/* Number Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {buttons.map((btn) => (
              <button
                key={btn}
                onClick={() => handleClick(btn)}
                className="bg-gray-50/80 hover:bg-gray-300 rounded-lg py-2 text-sm font-medium"
              >
                {btn}
              </button>
            ))}

            <button
              onClick={() => handleClick("=")}
              className="col-span-4 bg-blue-600/80 hover:bg-blue-700 text-white rounded-lg py-2 text-sm"
            >
              =
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingCalculator;