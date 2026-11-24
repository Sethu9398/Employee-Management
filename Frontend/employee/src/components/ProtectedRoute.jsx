import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import AuthLoader from "./AuthLoader";

const ProtectedRoute = () => {

    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <AuthLoader />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
