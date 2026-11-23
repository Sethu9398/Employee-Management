import { useState } from "react";
import { Navigate, useLocation, useNavigate, Link } from "react-router-dom";
import { getDashboardPath } from "../utils/getDashboardPath";

import api, { AUTH_ENDPOINTS } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { login, user, isAuthenticated, loading } = useAuth();
//   const redirectTo = location.state?.from?.pathname || "/home";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(AUTH_ENDPOINTS.LOGIN, {
        email,
        password,
      });

      login(response.data);

      navigate(
        location.state?.from?.pathname || getDashboardPath(response.data),
        { replace: true },
      );
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.detail || "Invalid email or password");
    }
  };

  if (!loading && isAuthenticated) {
    return (
        <Navigate
            to={getDashboardPath(user)}
            replace
        />
    );
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

        <br />
        <br />

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <br />
        <br />

        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default Login;
