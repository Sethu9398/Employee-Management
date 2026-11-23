import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../utils/getDashboardPath";

const DashboardRedirect = () => {

    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return <div>Checking authentication...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Navigate
            to={getDashboardPath(user)}
            replace
        />
    );
};

export default DashboardRedirect;