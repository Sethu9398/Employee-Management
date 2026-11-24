
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";

import api, { AUTH_ENDPOINTS } from "../services/api";
import {
    USER_STORAGE_KEY,
    clearStoredUser,
    getStoredUser,
    setStoredUser
} from "../utils/authStorage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

    const [user, setUserState] = useState(getStoredUser);
    const [loading, setLoading] = useState(true);

    const setUser = useCallback((nextUser) => {
        setUserState(nextUser);

        if (nextUser) {
            setStoredUser(nextUser);
        } else {
            clearStoredUser();
        }
    }, []);

    useEffect(() => {

        let isMounted = true;

        const checkAuth = async () => {

            try {

                const response = await api.get(AUTH_ENDPOINTS.ME);

                if (isMounted) setUser(response.data);

            } catch {

                if (isMounted) setUser(null);

            } finally {

                if (isMounted) setLoading(false);

            }
        };

        checkAuth();

        return () => {
            isMounted = false;
        };

    }, [setUser]);

    useEffect(() => {

        const handleStorage = (event) => {
            if (event.key === USER_STORAGE_KEY) {
                setUserState(getStoredUser());
            }
        };

        window.addEventListener("storage", handleStorage);

        return () => window.removeEventListener("storage", handleStorage);

    }, []);

    const login = useCallback((userData) => {
        setUser(userData);
    }, [setUser]);

    const logout = useCallback(async () => {

        try {
            await api.post(AUTH_ENDPOINTS.LOGOUT);
        } catch (error) {
            console.error("Logout error:", error);
        }

        setUser(null);

        window.location.replace("/login");
    }, [setUser]);

    const hasRole = useCallback(
        (roles = []) => !!user && roles.includes(user.role),
        [user]
    );

    const value = useMemo(() => ({
        user,
        setUser,
        login,
        logout,
        loading,
        hasRole,
        isAuthenticated: !!user
    }), [user, setUser, login, logout, loading, hasRole]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
};
