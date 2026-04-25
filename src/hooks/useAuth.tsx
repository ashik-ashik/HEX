import { useContext } from "react";
import AuthContext from "../context/createAuthContext";

const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};

export default useAuth;