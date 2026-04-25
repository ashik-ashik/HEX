import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

interface Props {
  children: React.ReactNode;
}

interface AuthContextType {
  userRole: string | null;
}

const AdminRoute: React.FC<Props> = ({ children }) => {
    const {userRole} = useAuth() as AuthContextType;

  if (userRole === "manager") {
    return <>{children}</>;
  }
  return <Navigate to="/login" replace />;

};

export default AdminRoute;