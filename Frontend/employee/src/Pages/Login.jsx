
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import api, { AUTH_ENDPOINTS } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const { login, isAuthenticated, loading } = useAuth();

    const redirectTo = location.state?.from?.pathname || "/home";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {

        e.preventDefault();

        try {

            const response = await api.post(
                AUTH_ENDPOINTS.LOGIN,
                {
                    email,
                    password
                }
            );

            login(response.data);

            navigate(redirectTo, { replace: true });

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.detail ||
                "Invalid email or password"
            );

        }
    };

    if (!loading && isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    return (
        <div>
            <h2>Employee Management Login</h2>

            <form onSubmit={handleLogin}>

                <input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <br /><br />

                <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <br /><br />

                <button type="submit">
                    Login
                </button>

            </form>
        </div>
    );
};

export default Login;
