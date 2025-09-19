import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DriverRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user || user.role !== "driver") {
    // Not logged in or not a driver, redirect to login page
    return <Navigate to="/login" replace />;
  }

  return children; // User is driver, render the child components
};

export default DriverRoute;
