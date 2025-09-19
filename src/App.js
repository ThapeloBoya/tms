import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import AdminDashboard from "./pages/admin/AdminDashboard";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import DriverDashboard from "./pages/driver/DriverDashboard";

import JobDetails from "./pages/admin/JobDetails";
import NotFoundPage from "./pages/NotFoundPage";

// Role-based route protection component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role)) {
    // Redirect user to their dashboard if role not allowed here
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin" replace />;
      case "customer":
        return <Navigate to="/customer" replace />;
      case "driver":
        return <Navigate to="/driver" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

// Wrapper to pass jobId param to JobDetails component
const JobDetailsWrapper = () => {
  const { jobId } = useParams();
  return <JobDetails jobId={jobId} />;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected dashboards */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver"
            element={
              <ProtectedRoute allowedRoles={["driver"]}>
                <DriverDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected job details route */}
          <Route
            path="/jobs/:jobId"
            element={
              <ProtectedRoute allowedRoles={["admin", "driver", "customer"]}>
                <JobDetailsWrapper />
              </ProtectedRoute>
            }
          />

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
