import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    // Not logged in or not an admin, redirect to login page
    return <Navigate to="/login" replace />;
  }

  return children; // User is admin, render the child components
};

export default AdminRoute;
