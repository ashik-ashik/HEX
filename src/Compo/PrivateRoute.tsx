import React from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<Props> = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem("authenticManager");

  if (isAuthenticated === "This guy is authentic manager of HEX House") {
    return <>{children}</>;
  }
  return <Navigate to="/imanager" replace />;

};

export default PrivateRoute;