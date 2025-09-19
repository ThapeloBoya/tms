import React, { useState, useContext } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {useAuth } from "../context/AuthContext";
import '../index.css'
const LoginPage = () => {
 const { user, login } = useAuth();

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) {
    // Redirect logged in user to their dashboard
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin" />;
      case "customer":
        return <Navigate to="/customer" />;
      case "driver":
        return <Navigate to="/driver" />;
      default:
        return <Navigate to="/" />;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await login(username, password);
    if (result.success) {
      // Redirect happens via user state change and Navigate above
    } else {
      setError(result.message || "Login failed");
    }
  };

  return (
<div className="login-container">
  <h2>Login</h2>
  <form onSubmit={handleSubmit}>
    <label>
      Username
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        autoFocus
      />
    </label>

    <label>
      Password
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
    </label>

    {error && <p>{error}</p>}
    <button type="submit">Login</button>
  </form>

  <p>
    Don't have an account? <a href="/register">Register here</a> (Customers only)
  </p>
</div>

  );
};

export default LoginPage;
