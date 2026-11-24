
import { useState } from "react";

import {
    Navigate,
    useLocation,
    useNavigate,
    Link
} from "react-router-dom";

import { getDashboardPath } from "../utils/getDashboardPath";

import api, { AUTH_ENDPOINTS } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const { login, user, isAuthenticated, loading } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {

        e.preventDefault();

        try {

            const response = await api.post(
                AUTH_ENDPOINTS.LOGIN,
                {
                    email,
                    password,
                }
            );

            login(response.data);

            navigate(
                location.state?.from?.pathname ||
                getDashboardPath(response.data),
                { replace: true }
            );

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.detail ||
                "Invalid email or password"
            );

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

        <div className="container-fluid min-vh-100 bg-light">

            <div className="row min-vh-100">

                <div className="col-lg-6 d-flex flex-column justify-content-center align-items-center bg-primary text-white p-5">

                    <div className="text-center">

                        <i className="bi bi-building display-1 mb-4"></i>

                        <h1 className="fw-bold mb-3">
                            Employee Management
                        </h1>

                        <h4 className="fw-normal mb-4">
                            Welcome to Our Portal
                        </h4>

                        <p className="lead">
                            Manage employees, departments,
                            attendance and leave requests
                            efficiently through one platform.
                        </p>

                    </div>

                </div>


                

                <div className="col-lg-6 d-flex justify-content-center align-items-center p-4 p-md-5">

                    <div className="card border-0 shadow-lg rounded-4 w-100"
                        style={{ maxWidth: "450px" }}>

                        <div className="card-body p-4 p-md-5">

                            <div className="text-center mb-4">

                                <i className="bi bi-person-circle text-primary display-4"></i>

                                <h2 className="fw-bold mt-3">
                                    Login
                                </h2>

                                <p className="text-secondary">
                                    Enter your credentials to continue
                                </p>

                            </div>


                            <form onSubmit={handleLogin}>

                                

                                <div className="mb-3">

                                    <label className="form-label fw-semibold">
                                        Email Address
                                    </label>

                                    <div className="input-group">

                                        <span className="input-group-text bg-light">
                                            <i className="bi bi-envelope"></i>
                                        </span>

                                        <input
                                            type="email"
                                            className="form-control"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            required
                                        />

                                    </div>

                                </div>


                               

                                <div className="mb-4">

                                    <label className="form-label fw-semibold">
                                        Password
                                    </label>

                                    <div className="input-group">

                                        <span className="input-group-text bg-light">
                                            <i className="bi bi-lock"></i>
                                        </span>

                                        <input
                                            type="password"
                                            className="form-control"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            required
                                        />

                                    </div>

                                </div>


                              

                                <div className="d-grid">

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg fw-semibold"
                                    >
                                        <i className="bi bi-box-arrow-in-right me-2"></i>
                                        Login
                                    </button>

                                </div>

                            </form>


                        

                            <div className="text-center mt-4">

                                <p className="text-secondary mb-0">
                                    Don't have an account?{" "}

                                    <Link
                                        to="/register"
                                        className="text-primary fw-semibold text-decoration-none"
                                    >
                                        Register here
                                    </Link>

                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );
};

export default Login;
