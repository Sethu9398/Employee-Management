import { useEffect, useState } from "react";
import api from "../../services/api";

const EmployeeProfile = () => {

    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchEmployeeProfile = async () => {
            try {
                const response = await api.get("/user/me");
                setEmployee(response.data);
            } catch (err) {
                setError(
                    err.response?.data?.detail ||
                    "Failed to load employee profile."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeeProfile();
    }, []);

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2">Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger">
                {error}
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="alert alert-warning">
                Employee details not found.
            </div>
        );
    }

    return (
        <div>
            {/* Page Heading */}
            <div className="mb-4">
                <h2 className="fw-bold">My Profile</h2>
                <p className="text-muted">
                    View your personal and employment information.
                </p>
            </div>

            {/* Profile Header */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                    <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-4 me-3">
                            <i className="bi bi-person-fill fs-1 text-primary"></i>
                        </div>

                        <div>
                            <h4 className="fw-bold mb-1">
                                {employee.fullname}
                            </h4>

                            <p className="text-muted mb-2">
                                {employee.email}
                            </p>

                            <span className="badge bg-primary">
                                {employee.role}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Personal Information */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white py-3">
                    <h5 className="fw-bold mb-0">
                        Personal Information
                    </h5>
                </div>

                <div className="card-body p-4">
                    <div className="row g-4">

                        <div className="col-md-6">
                            <label className="text-muted small">
                                Full Name
                            </label>
                            <p className="fw-semibold mb-0">
                                {employee.fullname || "Not provided"}
                            </p>
                        </div>

                        <div className="col-md-6">
                            <label className="text-muted small">
                                Email Address
                            </label>
                            <p className="fw-semibold mb-0">
                                {employee.email || "Not provided"}
                            </p>
                        </div>

                        <div className="col-md-6">
                            <label className="text-muted small">
                                Phone Number
                            </label>
                            <p className="fw-semibold mb-0">
                                {employee.phonenumber || "Not provided"}
                            </p>
                        </div>

                        <div className="col-md-6">
                            <label className="text-muted small">
                                User ID
                            </label>
                            <p className="fw-semibold mb-0">
                                {employee.user_id}
                            </p>
                        </div>

                    </div>
                </div>
            </div>

            {/* Employment Information */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3">
                    <h5 className="fw-bold mb-0">
                        Employment Information
                    </h5>
                </div>

                <div className="card-body p-4">
                    <div className="row g-4">

                        <div className="col-md-6">
                            <label className="text-muted small">
                                Role
                            </label>
                            <p className="fw-semibold mb-0">
                                {employee.role || "Not assigned"}
                            </p>
                        </div>

                        <div className="col-md-6">
                            <label className="text-muted small">
                                Department ID
                            </label>
                            <p className="fw-semibold mb-0">
                                {employee.department_id ?? "Not assigned"}
                            </p>
                        </div>

                        <div className="col-md-6">
                            <label className="text-muted small">
                                Account Status
                            </label>
                            <p className="mb-0">
                                <span className={`badge ${employee.is_active ? "bg-success" : "bg-danger"}`}>
                                    {employee.is_active ? "Active" : "Inactive"}
                                </span>
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfile;