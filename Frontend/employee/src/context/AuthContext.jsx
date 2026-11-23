import {
    createContext,
    useContext,
    useState
} from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(() => {
        const storedUser = sessionStorage.getItem("user");

        return storedUser
            ? JSON.parse(storedUser)
            : null;
    });

    // Login
    const login = (userData) => {

        setUser(userData);

        sessionStorage.setItem(
            "user",
            JSON.stringify(userData)
        );
    };

    // Logout
    const logout = () => {

        setUser(null);

        sessionStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isAuthenticated: !!user
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);