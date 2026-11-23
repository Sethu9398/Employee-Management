import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Login from "./Pages/Login";
import Home from "./Pages/Home";
import Admin from "./Pages/Admin";
import Employee from "./Pages/Employee";
import Unauthorized from "./Pages/Unauthorized";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

function App() {
  const user = JSON.parse(sessionStorage.getItem("user") || "null");
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}

          <Route path="/login" element={<Login />} />

          {/* Normal Protected Route */}

          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
          </Route>

          {/* Admin Protected Route */}

          <Route element={<RoleProtectedRoute allowedRoles={[user?.role]} />}>
            <Route path="/admin" element={<Admin />} />
          </Route>

          {/* Employee Protected Route */}

          <Route element={<RoleProtectedRoute allowedRoles={[user?.role]} />}>
            <Route path="/employee" element={<Employee />} />
          </Route>

          {/* Unauthorized Route */}

          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Default Route */}

          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
