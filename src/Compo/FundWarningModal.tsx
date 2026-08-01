import { useEffect, useState } from "react";


interface FundWarningModalProps {
  balance: number;
  isLoading: boolean;
}

const FundWarningModal = ({ balance, isLoading }: FundWarningModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [level, setLevel] = useState<"critical" | "low" | null>(null);



  useEffect(() => {
    if (isLoading) return;

    if (balance < 0) {
        const settingLevelFun = () => {
          setLevel("critical");
          setIsOpen(true);
        }
      settingLevelFun();
    } else if (balance <= 500) {
      const settingLevelFun = () => {
        setLevel("low");
        setIsOpen(true);
      };
      settingLevelFun();
    } else {
      const settingLevelFun = () => {
        setLevel(null);
        setIsOpen(false);
      };
      settingLevelFun();
    }
  }, [balance, isLoading]);

  if (!isOpen || !level) return null;

  const isCritical = level === "critical";

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm ${
        isCritical ? "bg-red-950/70" : "bg-amber-950/60"
      }`}
      
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md rounded-2xl border-2 bg-white p-6 shadow-2xl ${
          isCritical ? "border-red-500" : "border-amber-500"
        }`}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Close warning"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`flex h-16 w-16 items-center justify-center rounded-full ${isCritical ? "bg-red-100" : "bg-amber-100"}`}>
            {isCritical ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374L10.7 4.7c.866-1.5 3.032-1.5 3.898 0l7.005 12.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            )}
          </div>

          <h2 className={`text-xl lg:text-2xl font-bold ${isCritical ? "text-red-700" : "text-amber-700"}`}>
            {isCritical ? "Fund Balance Ran Out" : "Low Fund Warning"}
          </h2>

          <p className="text-gray-800 text-sm text-center">
            {isCritical
              ? "The house fund balance has hit zero or ran out. Bazar costs have exceeded total deposits. Please deposit funds as soon as possible."
              : "The house fund balance is running low. Please deposit funds soon to avoid running out."}
          </p>

          <div className={`w-full rounded-xl px-4 py-3 font-semibold ${isCritical ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
            Current Balance: ৳{balance.toLocaleString()}
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className={`mt-2 w-full rounded-xl py-2.5 font-semibold text-white transition-colors ${
              isCritical ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default FundWarningModal;