// src/components/Dashboard.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();

  if (!user) return <p>Please login</p>;

  return (
    <div>
      <h1>Welcome, {user.username}!</h1>
      <p>Your role is: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;
