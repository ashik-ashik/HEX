import { BrowserRouter, Route,  Routes } from 'react-router-dom';
import './App.css';
import OverviewHex from './Compo/OverviewHex';
import Dashboard from './Compo/Dashboard';
import UtilitySummary from './Compo/Utility';
import FloatingCalculator from './Compo/FloatingCalculator';
import { useEffect, useState } from 'react';
import SettlementPage from './SettlementPage';
import EntryBazarCosts from './Compo/EntryBazarCosts';
import MealCountEntry from './Compo/MealCountEntry';
import EntryMealDeposit from './Compo/EntryMealDeposit';
import UtilityCostEntry from './Compo/EntryUtilityCosts';
import EntryUtilityDeposit from './Compo/EntryUtilityDeposit';
import NoticePost from './Compo/NoticePost';
import LoginAsManager from './Compo/LoginAsManager';
import ChangeManager from './Compo/NextManagerSelection';
import ManagerDashboard from './Compo/ManagerDashboard';
import AdminRoute from './Compo/AdminRoute';
import Settlement_History from './Compo/Settlement_History';
import AddPersonnel from './Compo/AddPersonnel';
// import MonthlyMealPlans from './Compo/MonthlyMealPlans';
import GoogleLogin from './Compo/GoogleLogin';
import useAuth from './hooks/useAuth';
import PrivateRoute from './Compo/ProvateRoute';
import { Toaster } from 'react-hot-toast';
import HomeInitial from './Compo/HomeInitial';
import EditMealDeposit from './Compo/EditMealDeposit';
import EditLastBazarCost from './Compo/EditBazarCosts';



// ==============================================

const MEAL_DEPOSIT_SHEET = import.meta.env.VITE_MEAL_DEPOSIT_SHEET_READER;
const BAZAR_COSTS_SHEET = import.meta.env.VITE_BAZAR_COSTS_SHEET_READER;
const MEAL_CSV = import.meta.env.VITE_MEAL_COUNTS_SHEET_READER;
const UTILITY_DEPOSIT_SHEET = import.meta.env.VITE_UTILITY_DEPOSIT_SHEET_READER;
const UTILITY_COST_SHEET_URL = import.meta.env.VITE_UTILITY_COSTS_SHEET_READER;

  const NOTICE_URL = import.meta.env.VITE_NOTICE_SHEET_READER;

interface MealRow {
  name: string;
  meals: number[];
  total: number;
}

interface MemberData {
  name: string;
  deposits: number[];
  total: number;
  image?: string;
}

interface BazarItem {
  date: string;
  person: string;
  amount: number;
}

interface Notice {
  title: string;
  content: string;
}


interface AuthContextType {
  userIsLoading: boolean;
  userRole: string;
}
// ==============================================

function App() {
  const [managerThisMonth, setManagerThisMonth] = useState<string>("");;
  const [members, setMembers] = useState<MemberData[]>([]);
  const [grandDeposit, setGrandDeposit] = useState<number>(0);
  const [bazarData, setBazarData] = useState<BazarItem[]>([]);
  const [totalBazar, setTotalBazar] = useState<number>(0);
  const [mealData, setMealData] = useState<MealRow[]>([]);
  const [mealDates, setMealDates] = useState<string[]>([]);
  const [grandTotalMeals, setGrandTotalMeals] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [managerStatus, setManagerStatus] = useState<boolean>(false);
    const {
    userIsLoading,
    userRole,
  } = useAuth() as AuthContextType;

  

type UtilityDeposit = {
  member: string;
  total: number;
};

  const [utilityDeposits, setUtilityDeposits] = useState<UtilityDeposit[]>([]);
  const [utilityCosts, setUtilityCosts] = useState<string[][]>([]);
    const [notices, setNotices] = useState<Notice[]>([]);
  
  const parseCSV = (text: string): string[][] => {
    return text
      .trim()
      .split("\n")
      .map((row) => row.split(",").map((cell) => cell.trim()));
  };

  // ==============================================
  // Utility Summary Data

  useEffect(() => {

    // track manager
    const isManager = sessionStorage.getItem("authenticManager");
    if(isManager === "This guy is authentic manager of HEX House"){
      setManagerStatus(true);
    }else{
      setManagerStatus(false);
    }
    
    const fetchData = async () => {
  try {
    const [depositRes, costRes] = await Promise.all([
      fetch(UTILITY_DEPOSIT_SHEET),
      fetch(UTILITY_COST_SHEET_URL),
    ]);

    if (!depositRes.ok || !costRes.ok) {
      throw new Error("Failed to load data");
    }

    const depositText = await depositRes.text();
    const costText = await costRes.text();

    // ========= SMART CSV PARSER =========
    const parseCSV = (text: string) => {
      return text
        .trim()
        .split("\n")
        .map((row) =>
          row.includes("\t") ? row.split("\t") : row.split(",")
        );
    };

    // ========= PARSE =========
    const depositRaw = parseCSV(depositText);
    const costRaw = parseCSV(costText);

    // ========= FIXED: UTILITY DEPOSIT (HORIZONTAL) =========
    let formattedDeposits: { member: string; total: number }[] = [];

    if (depositRaw.length > 1) {
      const members = depositRaw[0];

      formattedDeposits = members.map((member, colIndex) => {
        let total = 0;

        for (let row = 1; row < depositRaw.length; row++) {
          const cell = depositRaw[row][colIndex];

          if (cell !== undefined && cell !== "") {
            const value = parseFloat(cell);
            if (!isNaN(value)) total += value;
          }
        }

        return {
          member: member.trim(),
          total,
        };
      });
    }

    // ========= SAVE =========
    setUtilityDeposits(formattedDeposits);

    // ⚠️ Utility COST stays unchanged
    setUtilityCosts(costRaw);

  } catch (error) {
    console.error(error);
    setIsError(true);
  } finally {
    setIsLoading(false);
  }
};

    fetchData();
  }, []);

  // Dashboard Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        // Fetch Notice
        fetch(NOTICE_URL)
        .then((res) => res.text())
        .then((text) => {
          const rows = text.split("\n").slice(1);

          const parsed = rows
            .map((row) => row.split(","))
            .filter((row) => row[0])
            .map((row) => ({
              title: row[0]?.trim(),
              content: row[1]?.trim(),
            }));

          setNotices(parsed);
        })

        // ===== DEPOSITS =====
        const depositRes = await fetch(MEAL_DEPOSIT_SHEET);
        const depositText = await depositRes.text();
        const depositRows = parseCSV(depositText);

        if (depositRows.length < 2) return; // Safety check

        const headers = depositRows[0];
        const imageRow = depositRows[1];
        const utilityDepositsRows = depositRows.slice(2);

        const memberData: MemberData[] = headers.map((name, colIndex) => {
          const deposits = utilityDepositsRows
            .map((row) => Number(row[colIndex]))
            .filter((val) => !isNaN(val) && val > 0);
          const total = deposits.reduce((sum, val) => sum + val, 0);
          return { name, deposits, total, image: imageRow[colIndex] || "" };
        });

        setMembers(memberData);
        setGrandDeposit(memberData.reduce((sum, m) => sum + m.total, 0));

        // ===== BAZAR =====
        const bazarRes = await fetch(BAZAR_COSTS_SHEET);
        const bazarText = await bazarRes.text();
        const bazarRows = parseCSV(bazarText);

        const bazarItems: BazarItem[] = bazarRows
          .slice(1)
          .map((row) => ({
            date: row[0] || "",
            person: row[1] || "",
            amount: Number(row[2]) || 0,
          }))
          .filter((item) => !isNaN(item.amount));

        setBazarData(bazarItems);
        setTotalBazar(bazarItems.reduce((sum, item) => sum + item.amount, 0));

        // ===== MEALS Counts ===== 
        const mealRes = await fetch(MEAL_CSV);
        const mealText = await mealRes.text();
        const mealRows = parseCSV(mealText);

        if (mealRows.length < 2) return; // At least header row + 1 date row

        // Extract member names from the first row (Row 1)
        const members = mealRows[0].slice(1); 
        setMealDates(mealRows.slice(1).map((row) => row[0])); // Dates are in Column A

        // Transpose meals so each member has their array of meal counts
        const meals: MealRow[] = members.map((member, colIndex) => {
          const mealValues = mealRows
            .slice(1) // Skip header row
            .map((row) => {
              const val = row[colIndex + 1]; // +1 because column 0 is date
              return isNaN(Number(val)) ? 0 : Number(val);
            });
          return {
            name: member,
            meals: mealValues,
            total: mealValues.reduce((sum, v) => sum + v, 0),
          };
        });

        setMealData(meals);
        setGrandTotalMeals(meals.reduce((sum, m) => sum + m.total, 0));
        
      } catch (error) {
        console.error("Error loading data:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const memberNameList = members.map(member => member.name);

 if(userIsLoading){
    return <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center justify-center space-y-5">
          {/* Spinner */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>

          {/* Brand Title */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Hex Bachelor House
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Loading your dashboard...
            </p>
          </div>
        </div>
      </div>
    </>
  }
  // ======================================================

  return (
    <>
      <BrowserRouter>
      <Toaster position="bottom-right" />
        <Routes>
        {
          userRole !== "manager" &&
          userRole !== "member" &&
          userRole !== "assist_manager" && (
            <Route path="/" element={<HomeInitial />} />
          )
        }


          <Route path="/" element={<PrivateRoute>
            <OverviewHex setManagerThisMonth={setManagerThisMonth} grandDeposit={grandDeposit} totalBazar={totalBazar} utilityDeposits={utilityDeposits}
                utilityCosts={utilityCosts} isLoading={isLoading} notices={notices} />
          </PrivateRoute>} />
          <Route path="/login" element={<GoogleLogin />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard
                members={members}
                bazarData={bazarData}
                mealData={mealData}
                mealDates={mealDates}
                grandTotalMeals={grandTotalMeals}
                grandDeposit={grandDeposit}
                isLoading={isLoading}
                isError={isError}
                totalBazar={totalBazar}
                
              />
              </PrivateRoute>
            }
          />
          <Route
            path="/utility"
            element={<PrivateRoute>
              <UtilitySummary
                utilityDeposits={utilityDeposits}
                utilityCosts={utilityCosts}
                isLoading={isLoading}
                isError={isError}
              />
            </PrivateRoute>
              
            }
          />
          <Route path="/settlement" element={<AdminRoute><SettlementPage
            managerThisMonth={managerThisMonth} 
            members={members}
            mealData={mealData}
            grandDeposit={grandDeposit}
            totalBazar={totalBazar}
            utilityDeposits={utilityDeposits}
            utilityCosts={utilityCosts}
            grandTotalMeals={grandTotalMeals}
            isLoading={isLoading}
          /></AdminRoute>} />
          <Route path="/manager" element={<AdminRoute><ManagerDashboard memberNameList={memberNameList} managerStatus={managerStatus} /></AdminRoute>}></Route>
          <Route path="/bazar-costs" element={<AdminRoute><EntryBazarCosts memberNameList={memberNameList} /></AdminRoute>} />
          <Route path="/meal-entry" element={<AdminRoute><MealCountEntry memberNameList={memberNameList}  /></AdminRoute>} />
          <Route path="/meal-deposit-entry" element={<AdminRoute><EntryMealDeposit memberNameList={memberNameList}  /></AdminRoute>} />
          <Route path="/utility-costs-entry" element={<AdminRoute><UtilityCostEntry /></AdminRoute>} />
          <Route path="/utility-deposit-entry" element={<AdminRoute><EntryUtilityDeposit memberNameList={memberNameList} /></AdminRoute>} />
          <Route path="/postnotice" element={<PrivateRoute><NoticePost /></PrivateRoute>} />
          <Route path="/imanager" element={<LoginAsManager managerStatus={managerStatus} />} />
          <Route path="/addmember" element={<AdminRoute><AddPersonnel /></AdminRoute>} />
          <Route path="/next-manager" element={<AdminRoute><ChangeManager  /></AdminRoute>} />
          <Route path="/edit-meal-deposit" element={<AdminRoute><EditMealDeposit memberNameList={memberNameList} /></AdminRoute>} />
          <Route path="/edit-mbaza-cost" element={<AdminRoute><EditLastBazarCost memberNameList={memberNameList} /></AdminRoute>} />
          <Route path="/history" element={<Settlement_History />} />
        </Routes>
        <FloatingCalculator />
      </BrowserRouter>
    </>
  );
}

export default App;