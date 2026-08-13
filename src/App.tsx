import { BrowserRouter, Route,  Routes } from 'react-router-dom';
import './App.css';
import OverviewHexa from './Compo/OverviewHexa';
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
// import { Toaster } from 'react-hot-toast';
import HomeInitial from './Compo/HomeInitial';
import EditMealDeposit from './Compo/EditMealDeposit';
import EditLastBazarCost from './Compo/EditBazarCosts';
import AllEvents from './Compo/AllEvents';
import PageNotFound from './Compo/PageNotFound';
import FundWarningModal from './Compo/FundWarningModal';
import SetFixedMeal from './Compo/SetFixedMeal';
import ResetMonth from './Compo/ResetThisMonth';
import MemberProfile from './Compo/MemberProfile';
import UpdateProfilePage from './Compo/UpdateMemberProfile';
import UpdateProfilePopUp from './Compo/UpdateProfilePopUp';
import AllMembers from './Compo/AllMembers';
import EditUtilityDeposit from './Compo/EditUtilityDeposit';
import EditUtilityCosts from './Compo/EditUtilityCosts';
import HexaHouseLoader from './Compo/HexaHouseLoader';
import useAppData from './hooks/useAppData';



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
  houseMembers: { name: string; role: string; email: string; phoneNumber: string }[];
  user: { name: string; email: string; role: string; phoneNumber: string };
}
// ==============================================

function App() {
  const [managerThisMonth, setManagerThisMonth] = useState<string>("");
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
    houseMembers,
    userRole,
    user
  } = useAuth() as AuthContextType;

  const {hexaDataLoader} = useAppData() as {hexaDataLoader: boolean};

  const currentMember = houseMembers.find(member => member.email === user.email);

  if (currentMember?.phoneNumber === "" || !currentMember?.phoneNumber) {
    <UpdateProfilePopUp />
  }

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
    if(isManager === "This guy is authentic manager of Hexa House"){
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
    const costRaw = parseCSV(costText).map((row) => row.slice(1));

    // ========= FIXED: UTILITY DEPOSIT (HORIZONTAL) =========
    let formattedDeposits: { member: string; total: number }[] = [];

    if (depositRaw.length > 1) {
      // Skip the 1st column because it contains the tracking ID
      const members = depositRaw[0].slice(1);

      formattedDeposits = members.map((member, index) => {
        const colIndex = index + 1; // Actual column index in depositRaw
        let total = 0;

        for (let row = 1; row < depositRaw.length; row++) {
          const cell = depositRaw[row][colIndex];

          if (cell !== undefined && cell !== "") {
            const value = parseFloat(cell);
            if (!isNaN(value)) {
              total += value;
            }
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

        if (depositRows.length < 1) return; // Safety check

        const headers = depositRows[0];
        const mealDepositsRows = depositRows.slice(1);
        

        const memberData: MemberData[] = headers.map((name, colIndex) => {
          const deposits = mealDepositsRows
            .map((row) => Number(row[colIndex]))
            .filter((val) => !isNaN(val) && val > 0);
            const total = deposits.reduce((sum, val) => sum + val, 0);
            return { name, deposits, total };
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
            trackingID: row[0] || "",
            date: row[1] || "",
            person: row[2] || "",
            amount: Number(row[3]) || 0,
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

  const memberNameList = houseMembers.map(member => member.name);


 if(userIsLoading ){
    return <>
      <HexaHouseLoader />
    </>
  }
 if(hexaDataLoader){
    return <>
      <HexaHouseLoader />
    </>
  }
  // ======================================================

  return (
    <>
      <BrowserRouter>
      {/* <Toaster position="bottom-right" /> */}
        <Routes>
            <Route path="/" element={<HomeInitial />} />
           <Route path="/overview" element={<PrivateRoute>
            <OverviewHexa setManagerThisMonth={setManagerThisMonth} grandDeposit={grandDeposit} totalBazar={totalBazar} utilityDeposits={utilityDeposits}
                utilityCosts={utilityCosts} isLoading={isLoading} notices={notices} members={members} />
          </PrivateRoute>} />
          <Route path="/login" element={<GoogleLogin />} />
          <Route
            path="/member-profile"
            element={<PrivateRoute>
              <MemberProfile
                members={members}
                bazarData={bazarData}
                mealData={mealData}
                // mealDates={mealDates}
                grandTotalMeals={grandTotalMeals}
                grandDeposit={grandDeposit}
                isLoading={isLoading}
                utilityDeposits={utilityDeposits}
                isError={isError}
                totalBazar={totalBazar}
                
              />
            </PrivateRoute>
            }
          />
          <Route
            path="/meal-bazar-costs"
            element={
              <PrivateRoute>
                <Dashboard
                members={members}
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
          <Route path="/manager" element={<AdminRoute><ManagerDashboard memberNameList={memberNameList} managerStatus={managerStatus} /></AdminRoute>}>
            <Route path="bazar-cost" element={<AdminRoute><EntryBazarCosts memberNameList={memberNameList} /></AdminRoute>} />
            <Route path="meal-entry" element={<AdminRoute><MealCountEntry /></AdminRoute>} />
            <Route path="meal-deposit-entry" element={<AdminRoute><EntryMealDeposit /></AdminRoute>} />
            <Route path="utility-costs-entry" element={<AdminRoute><UtilityCostEntry /></AdminRoute>} />
            <Route path="utility-deposit-entry" element={<AdminRoute><EntryUtilityDeposit /></AdminRoute>} />
            <Route path="imanager" element={<LoginAsManager managerStatus={managerStatus} />} />
            <Route path="add-member" element={<AdminRoute><AddPersonnel /></AdminRoute>} />
            <Route path="next-manager" element={<AdminRoute><ChangeManager  /></AdminRoute>} />
            <Route path="setfixedmeal" element={<AdminRoute><SetFixedMeal  /></AdminRoute>} />
            <Route path="resetmonth" element={<AdminRoute><ResetMonth  /></AdminRoute>} />
            <Route path="edit-meal-deposit" element={<AdminRoute><EditMealDeposit /></AdminRoute>} />
            <Route path="edit-bazar-cost" element={<AdminRoute><EditLastBazarCost /></AdminRoute>} />
            <Route path="edit-utility-deposit" element={<AdminRoute><EditUtilityDeposit /></AdminRoute>} />
            <Route path="edit-utility-costs" element={<AdminRoute><EditUtilityCosts /></AdminRoute>} />
          </Route>
          <Route path="/postnotice" element={<PrivateRoute><NoticePost /></PrivateRoute>} />
          <Route path="/history" element={<Settlement_History />} />
          <Route path="/edit-profile" element={<PrivateRoute><UpdateProfilePage /></PrivateRoute>} />
          <Route path="/all-members" element={<PrivateRoute><AllMembers /></PrivateRoute>} />
          <Route path="/events" element={<AllEvents />} />
          <Route path="/*" element={<PageNotFound />} />
        </Routes>
        {
        userRole === "manager" || userRole === "assist_manager" || userRole === "member" ?(
        !currentMember?.phoneNumber || currentMember?.phoneNumber === '' ? <UpdateProfilePopUp /> : null): null}
        {
          userRole === "manager" || userRole === "assist_manager" || userRole === "member" ? <FundWarningModal balance={grandDeposit - totalBazar} isLoading={isLoading} /> : null
        }
          
          

        <FloatingCalculator />
      </BrowserRouter>
    </>
  );
}

export default App;