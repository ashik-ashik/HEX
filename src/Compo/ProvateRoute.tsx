import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

interface Props {
  children: React.ReactNode;
}

interface AuthContextType {
  userRole: string | null;
  userIsLoading: boolean;
}

const PrivateRoute: React.FC<Props> = ({ children }) => {
    const {userRole, userIsLoading} = useAuth() as AuthContextType;

    if(userIsLoading){
        return 'loading....'
    }

  if (userRole === "member" || userRole === 'manager') {
    return <>{children}</>;
  }
  return <Navigate to="/login" replace />;

};

export default PrivateRoute;