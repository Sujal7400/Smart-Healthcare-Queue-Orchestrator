import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import StaffDashboard from "./pages/StaffDashboard";
import { useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff-dashboard"
        element={
          <ProtectedRoute allowedRoles={["staff", "doctor", "admin"]}>
            <StaffDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;