import { useEffect, useState, type JSX, type ReactNode } from "react";
import AppDataContext from "./CreateAppDataContext";
import type { MealCountResponse, UsersList } from "../services/DataTypes";
import useAuth from "../hooks/useAuth";

interface AppDataProviderProps {
  children: ReactNode;
}

interface MealEntry {
  date: string;
  meals: Record<string, number>;
}

export interface IndividualMealTotal {
  name: string;
  userID: string;
  totalmeal: number;
}

export interface Notice {
  title: string;
  content: string;
  date: string;
  postedBy: string;
}

export interface NoticeResponse {
  status: "success" | "error";
  message: string;
  data: Notice[];
}

export interface HexaEvent {
  date: string;
  eventName: string;
  eventDescription: string;
  eventPhoto: string;
}



const HOUSEDATAREADERAPIROOT = import.meta.env.VITE_HEXA_HOUSE_DATA_READER;

const AppDataProvider = ({
  children,
}: AppDataProviderProps): JSX.Element => {
  const { usersList } = useAuth() as { usersList: UsersList };

  const [hexaDataLoader, setHexaDataLoader] = useState<boolean>(false);

  const [readMealCount, setReadMealCount] =
    useState<MealCountResponse>();

  const [bazarCosts, setbazarCosts] =
    useState<MealCountResponse>();

  const [notices, setNotices] = useState<NoticeResponse>();
const [hexaEvents, setHexaEvents] = useState<HexaEvent[]>([]);    

  // Individual total meal
  const [individualMealTotals, setIndividualMealTotals] = useState<
    IndividualMealTotal[]
  >([]);

  // Count individual total meal
  const countIndivudualTotalMeal = (
    mealData: MealEntry[]
  ): IndividualMealTotal[] => {
    const mealTotals: Record<string, number> = {};

    // Calculate total meal for each userID
    mealData.forEach((entry) => {
      Object.entries(entry.meals || {}).forEach(([userID, meal]) => {
        mealTotals[userID] =
          (mealTotals[userID] || 0) + Number(meal || 0);
      });
    });

    // Match mealData userID with email before @
    const result: IndividualMealTotal[] = Object.entries(
      mealTotals
    ).map(([userID, totalmeal]) => {
      const matchedUser = usersList?.find((user) => {
        const emailUsername = user.email
          ?.split("@")[0]
          .toLowerCase();

        return emailUsername === userID.toLowerCase();
      });

      return {
        name: matchedUser?.name || userID,
        userID,
        totalmeal,
      };
    });

    return result;
  };

  useEffect(() => {
    const fetchMealCount = async () => {
      try {
        setHexaDataLoader(true);

        // =========================
        // Meal Count
        // =========================
        const responseMealCount = await fetch(
          HOUSEDATAREADERAPIROOT + "?type=mealCount"
        );

        const dataMealCount = await responseMealCount.json();

        setReadMealCount(dataMealCount);

        // Calculate individual meal totals
        if (Array.isArray(dataMealCount?.data)) {
          const totals = countIndivudualTotalMeal(
            dataMealCount.data
          );

          setIndividualMealTotals(totals || []);
        }

        // =========================
        // Bazar Costs
        // =========================
        const responseBazarCosts = await fetch(
          HOUSEDATAREADERAPIROOT + "?type=bazarCosts"
        );

        const dataBazarCosts = await responseBazarCosts.json();

        setbazarCosts(dataBazarCosts  || {});



        // +++++++++++++++++++++++
        // Notice
        // +++++++++++++++++++++++
        const responseNotices = await fetch(
          HOUSEDATAREADERAPIROOT + "?type=notices"
        );

        if (!responseNotices.ok) {
          throw new Error(
            `Failed to load notices: ${responseNotices.status}`
          );
        }

        const dataNotices = await responseNotices.json();


        if (dataNotices.status === "success") {
          const notices = dataNotices || [];

          setNotices(notices);

          // If using state:
          // setNotices(notices);

        } else {
          console.error(
            "Failed to load notices:",
            dataNotices.message
          );
        }



        // Load Hexa Events
          const responseHexaEvents = await fetch(
            HOUSEDATAREADERAPIROOT + "?type=events"
          );

         

          const dataHexaEvents = await responseHexaEvents.json();

          setHexaEvents(dataHexaEvents || {});
          if (dataHexaEvents.status === "success") {

            // Example:
            // setHexaEvents(dataHexaEvents.data);
          } else {
            console.error(
              "Failed to load Hexa Events:",
              dataHexaEvents.message
            );
          }

      } catch (error) {
        console.error("Error fetching meal count:", error);
      } finally {
        setHexaDataLoader(false);
      }
    };

    fetchMealCount();
  }, [usersList]);

  const allAppData = {
    hexaDataLoader,

    readMealCount,
    setReadMealCount,

    bazarCosts,
    setbazarCosts,

    individualMealTotals,

    notices,
    hexaEvents,
  };

  return (
    <AppDataContext.Provider value={allAppData}>
      {children}
    </AppDataContext.Provider>
  );
};

export default AppDataProvider;