
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api, { AUTH_ENDPOINTS } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../utils/getDashboardPath";

const Register = () => {

    const navigate = useNavigate();

    const { login } = useAuth();

    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        department_id: "",
        phonenumber: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

  
    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

    };

   
    const handleRegister = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response = await api.post(
                AUTH_ENDPOINTS.REGISTER,
                {
                    fullname: formData.fullname.trim(),
                    email: formData.email.trim(),
                    department_id: Number(formData.department_id),
                    phonenumber: formData.phonenumber.trim() || null,
                    password: formData.password,
                }
            );

    
            login(response.data);

            navigate(
                getDashboardPath(response.data),
                { replace: true }
            );

        } catch (error) {

            console.error("Registration error:", error);

            setError(
                error.response?.data?.detail ||
                "Registration failed. Please try again."
            );

        } finally {

            setLoading(false);

        }
    };

    return (

        <div className="container-fluid min-vh-100 bg-light">

            <div className="row min-vh-100">

                <div className="col-lg-5 d-flex flex-column justify-content-center align-items-center bg-primary text-white p-5">

                    <div className="text-center">

                        <i className="bi bi-building display-1 mb-4"></i>

                        <h1 className="fw-bold mb-3">
                            Employee Management
                        </h1>

                        <h4 className="fw-normal mb-4">
                            Join Our Organization
                        </h4>

                        <p className="lead">
                            Create your employee account and
                            access your personal dashboard,
                            Manage your profile.
                        </p>

                    </div>

                </div>

                <div className="col-lg-7 d-flex justify-content-center align-items-center p-3 p-md-5 vh-100">

                    <div
                        className="card border-0 shadow-lg rounded-4 w-100"
                        style={{ maxWidth: "600px" }}
                    >

                        <div className="card-body p-4 p-md-5">

                            <div className="text-center mb-4">

                                <i className="bi bi-person-plus-fill text-primary display-4"></i>

                                <h2 className="fw-bold mt-3">
                                    Create Account
                                </h2>

                                <p className="text-secondary">
                                    Fill in your details to register
                                </p>

                            </div>


                           

                            {error && (

                                <div
                                    className="alert alert-danger alert-dismissible fade show"
                                    role="alert"
                                >

                                    <i className="bi bi-exclamation-circle me-2"></i>

                                    {error}

                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setError("")}
                                        aria-label="Close"
                                    ></button>

                                </div>

                            )}


                            <form onSubmit={handleRegister}>

                                

                                <div className="mb-3">

                                    <label className="form-label fw-semibold">
                                        Full Name
                                    </label>

                                    <div className="input-group">

                                        <span className="input-group-text bg-light">
                                            <i className="bi bi-person"></i>
                                        </span>

                                        <input
                                            type="text"
                                            className="form-control"
                                            name="fullname"
                                            placeholder="Enter full name"
                                            value={formData.fullname}
                                            onChange={handleChange}
                                            minLength={2}
                                            maxLength={150}
                                            required
                                        />

                                    </div>

                                </div>


                              

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
                                            name="email"
                                            placeholder="Enter email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            maxLength={150}
                                            required
                                        />

                                    </div>

                                </div>


                               

                                <div className="row">

                                    <div className="col-md-6 mb-3">

                                        <label className="form-label fw-semibold">
                                            Department ID
                                        </label>

                                        <div className="input-group">

                                            <span className="input-group-text bg-light">
                                                <i className="bi bi-building"></i>
                                            </span>

                                            <input
                                                type="number"
                                                className="form-control"
                                                name="department_id"
                                                placeholder="Department ID"
                                                value={formData.department_id}
                                                onChange={handleChange}
                                                min="1"
                                                step="1"
                                                required
                                            />

                                        </div>

                                    </div>


                                    <div className="col-md-6 mb-3">

                                        <label className="form-label fw-semibold">
                                            Phone Number
                                        </label>

                                        <div className="input-group">

                                            <span className="input-group-text bg-light">
                                                <i className="bi bi-telephone"></i>
                                            </span>

                                            <input
                                                type="tel"
                                                className="form-control"
                                                name="phonenumber"
                                                placeholder="Phone number"
                                                value={formData.phonenumber}
                                                onChange={handleChange}
                                                maxLength={15}
                                            />

                                        </div>

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
                                            name="password"
                                            placeholder="Create password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            minLength={8}
                                            maxLength={72}
                                            required
                                        />

                                    </div>

                                    <small className="text-secondary">
                                        Password must contain at least 8 characters.
                                    </small>

                                </div>


                            
                                <div className="d-grid">

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg fw-semibold"
                                        disabled={loading}
                                    >

                                        {loading ? (

                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    aria-hidden="true"
                                                ></span>

                                                Registering...

                                            </>

                                        ) : (

                                            <>
                                                <i className="bi bi-person-plus me-2"></i>
                                                Create Account
                                            </>

                                        )}

                                    </button>

                                </div>

                            </form>


                         

                            <div className="text-center mt-4">

                                <p className="text-secondary mb-0">

                                    Already have an account?{" "}

                                    <Link
                                        to="/login"
                                        className="text-primary fw-semibold text-decoration-none"
                                    >
                                        Login here
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

export default Register;
