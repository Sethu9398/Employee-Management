import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const RoleProtectedRoute = ({ allowedRoles }) => {

    const { user, isAuthenticated } = useAuth();

    // Authentication check
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Authorization check
    if (!allowedRoles.includes(user?.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default RoleProtectedRoute;