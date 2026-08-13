

export interface User {
  email: string;
  role: "viewer" | "member" | "manager" | "assist_manager";
  name: string;
  photoURL: string;
  uid: string;
  emailVerified: boolean;
  phoneNumber: string;
  provider: string;
  lastLoginAt: string;
  room: string;
}

export type UsersList = User[];


export interface MealCountMeals {
  [memberName: string]: number;
}

export interface MealCountData {
  date: string;
  meals: MealCountMeals;
}

export interface MealCountResponse {
  success: boolean;
  type: "mealCount";
  data: MealCountData[];
}

export interface BazarCost {
  trackingID: string;
  date: string;
  name: string;
  amount: string;
}

export interface BazarCostResponse {
  success: boolean;
  type: "bazar";
  data: BazarCost[];
}