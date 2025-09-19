import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../index.css";

const RegisterPage = () => {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(""); // new field
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");

  if (user) {
    // Redirect logged-in user based on role
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

  if (!name.trim()) {
    setError("Name is required");
    return;
  }

  // Password strength regex
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordRegex.test(password)) {
    setError(
      "Password must be at least 8 characters, include uppercase, lowercase, number, and special character."
    );
    return;
  }

  if (password !== passwordConfirm) {
    setError("Passwords do not match");
    return;
  }

  const result = await register({ name, username, password });
  if (result?.success) {
    navigate("/customer");
  } else {
    setError(result?.message || "Registration failed");
  }
};


  return (
    <div className="register-container">
      <h2>Register (Customers Only)</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <label>
          Full Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
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
  <small>
    Must be 8+ chars, include uppercase, lowercase, number & special char
  </small>
</label>

        <label>
          Confirm Password
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="register-button">Register</button>
      </form>

      <p className="login-link">
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
};

export default RegisterPage;
