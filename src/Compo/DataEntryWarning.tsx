import React from "react";
import { AlertTriangle } from "lucide-react";

interface ManagerStatus{managerStatus:boolean}
const DataEntryWarning:React.FC<ManagerStatus> = ({managerStatus}) => {
  return (
    <div className="flex items-start gap-3 p-4 mb-5 rounded-xl border border-yellow-300 bg-red-50 shadow-sm">
      
      {
        managerStatus ? <>
          {/* Icon */}
          <div className="mt-1 text-orange-600">
            <AlertTriangle size={20} />
          </div>

          {/* Text Content */}
          <div>
            <h3 className="text-sm font-semibold text-orange-700">
              গুরুত্বপূর্ণ সতর্কতা
            </h3>

            <p className="text-xs text-orange-500 mt-1 leading-relaxed">
              অনুগ্রহ করে প্রতিটি তথ্য অত্যন্ত সতর্কতার সাথে প্রদান করুন। 
              এই সিস্টেমে <span className="font-semibold">Edit বা Delete</span> করার কোনো সুযোগ নেই। 
              ভুল তথ্য প্রদান করলে তা সংশোধন করা সম্ভব হবে না।
            </p>

            <p className="text-xs text-orange-500 mt-2 leading-relaxed">
              Please double-check all entries before submission. Once submitted, 
              data cannot be modified or removed.
            </p>
          </div>
        
        </>:<>
         {/* Text Content */}
      <div>
        <h3 className="text-sm font-semibold text-orange-700">
          গুরুত্বপূর্ণ সতর্কতা
        </h3>

        <p className="text-xs text-orange-500 mt-1 leading-relaxed">
          "আপনি ম্যানেজার হিসেবে অনুমোদিত নন।"  
          এই সিস্টেমে শুধুমাত্র অনুমোদিত ম্যানেজাররা ডেটা প্রবেশ করাতে পারবেন।  
          অনুগ্রহ করে ভুল তথ্য প্রদান করে বিভ্রান্তি সৃষ্টি করবেন না!
        </p>

        <p className="text-xs text-orange-500 mt-2 leading-relaxed">
          Only authorized managers are allowed to enter data.  
          Please ensure you are Manager for this month and entry your data.
        </p>
      </div>
        </>
      }

    </div>
  );
};

export default DataEntryWarning;