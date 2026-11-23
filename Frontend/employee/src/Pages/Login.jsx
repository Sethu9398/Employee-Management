
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {

    const navigate = useNavigate();

    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {

        e.preventDefault();

        try {

            const response = await api.post(
                "/user/login",
                {
                    email,
                    password
                }
            );

            // Store user information
            login({
                user_id: response.data.user_id,
                name:response.data.name,
                email: response.data.email,
                role: response.data.role
            });

            // Navigate to Home
            navigate("/home", { replace: true });

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.detail ||
                "Invalid email or password"
            );

        }
    };

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
