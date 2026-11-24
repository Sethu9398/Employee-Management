
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Navbar = () => {

    const { user, logout } = useAuth();

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm fixed-top" style={{ height: "65px" }}>

            <div className="container-fluid px-4">

                
                <Link
                    className="navbar-brand fw-bold"
                    to="/"
                >
                    <i className="bi bi-building me-2"></i>
                    Employee Management
                </Link>

                
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#mainNavbar"
                    aria-controls="mainNavbar"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div
                    className="collapse navbar-collapse"
                    id="mainNavbar"
                >

                    <ul className="navbar-nav ms-auto align-items-lg-center gap-3">

                        {/* User Information */}
                        <li className="nav-item text-white">

                            <div className="d-flex flex-column align-items-lg-end">

                                <span className="fw-semibold">
                                    {user?.fullname}
                                </span>

                                <small className="text-secondary">
                                    {user?.role}
                                </small>

                            </div>

                        </li>

                       
                        <li className="nav-item">

                            <button
                                className="btn btn-danger btn-sm"
                                onClick={logout}
                            >
                                <i className="bi bi-box-arrow-right me-2"></i>
                                Logout
                            </button>

                        </li>

                    </ul>

                </div>

            </div>

        </nav>
    );
};

export default Navbar;
