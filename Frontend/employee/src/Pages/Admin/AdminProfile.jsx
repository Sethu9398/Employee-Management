import { useEffect, useState } from "react";
import api from "../../services/api";

const AdminProfile = () => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAdminProfile = async () => {
        try {
            const response = await api.get("/user/me");
            setAdmin(response.data);
        } catch (err) {
            console.error(err);
            alert("Failed to load admin profile.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminProfile();
    }, []);

    const formatDate = (dateValue) => {
        if (!dateValue) return "Not available";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) return "Not available";

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary"></div>
                <p className="text-muted mt-2">Loading profile...</p>
            </div>
        );
    }

    if (!admin) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger">
                    Unable to load admin profile.
                </div>
            </div>
        );
    }

    const initials = admin.fullname
        ? admin.fullname
              .split(" ")
              .map((word) => word[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()
        : "A";

    return (
        <div className="container-fluid py-4">

            {/* Page Header */}
            <div className="mb-4">
                <h2 className="fw-bold mb-1">Admin Profile</h2>
                <p className="text-muted mb-0">
                    View your administrator account information
                </p>
            </div>

            {/* Profile Card */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">

                    <div className="row align-items-center g-4">

                        {/* Profile Avatar */}
                        <div className="col-auto">
                            <div
                                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                                style={{
                                    width: "100px",
                                    height: "100px",
                                    fontSize: "2rem",
                                }}
                            >
                                {initials}
                            </div>
                        </div>

                        {/* Profile Heading */}
                        <div className="col">
                            <h3 className="fw-bold mb-1">
                                {admin.fullname || "Administrator"}
                            </h3>

                            <p className="text-muted mb-2">
                                {admin.email}
                            </p>

                            <span className="badge bg-primary">
                                <i className="bi bi-shield-check me-1"></i>
                                Administrator
                            </span>

                            <span
                                className={`badge ms-2 ${
                                    admin.is_active
                                        ? "bg-success"
                                        : "bg-secondary"
                                }`}
                            >
                                {admin.is_active ? "Active" : "Inactive"}
                            </span>
                        </div>

                    </div>

                </div>
            </div>

            {/* Profile Details */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3">
                    <h5 className="fw-bold mb-0">
                        <i className="bi bi-person-lines-fill text-primary me-2"></i>
                        Personal Information
                    </h5>
                </div>

                <div className="card-body p-4">
                    <div className="row g-4">

                        {/* User ID */}
                        <div className="col-lg-6 col-md-6">
                            <label className="text-muted small mb-1">
                                User ID
                            </label>

                            <div className="fw-semibold">
                                #{admin.user_id}
                            </div>
                        </div>

                        {/* Full Name */}
                        <div className="col-lg-6 col-md-6">
                            <label className="text-muted small mb-1">
                                Full Name
                            </label>

                            <div className="fw-semibold">
                                {admin.fullname || "Not available"}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="col-lg-6 col-md-6">
                            <label className="text-muted small mb-1">
                                Email Address
                            </label>

                            <div className="fw-semibold">
                                <i className="bi bi-envelope text-primary me-2"></i>
                                {admin.email || "Not available"}
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="col-lg-6 col-md-6">
                            <label className="text-muted small mb-1">
                                Phone Number
                            </label>

                            <div className="fw-semibold">
                                <i className="bi bi-telephone text-primary me-2"></i>
                                {admin.phonenumber || "Not available"}
                            </div>
                        </div>

                        {/* Role */}
                        <div className="col-lg-6 col-md-6">
                            <label className="text-muted small mb-1">
                                Role
                            </label>

                            <div className="fw-semibold">
                                <i className="bi bi-shield-lock text-primary me-2"></i>
                                {typeof admin.role === "object"
                                    ? admin.role?.value
                                    : admin.role || "Admin"}
                            </div>
                        </div>

                        {/* Department */}
                        <div className="col-lg-6 col-md-6">
                            <label className="text-muted small mb-1">
                                Department
                            </label>

                            <div className="fw-semibold">
                                <i className="bi bi-building text-primary me-2"></i>
                                {admin.department_id
                                    ? `Department ID: ${admin.department_id}`
                                    : "No department assigned"}
                            </div>
                        </div>

                        {/* Created Date */}
                        <div className="col-lg-6 col-md-6">
                            <label className="text-muted small mb-1">
                                Account Created
                            </label>

                            <div className="fw-semibold">
                                <i className="bi bi-calendar3 text-primary me-2"></i>
                                {formatDate(admin.created_at)}
                            </div>
                        </div>

                        {/* Account Status */}
                        <div className="col-lg-6 col-md-6">
                            <label className="text-muted small mb-1">
                                Account Status
                            </label>

                            <div>
                                <span
                                    className={`badge ${
                                        admin.is_active
                                            ? "bg-success"
                                            : "bg-danger"
                                    }`}>
                                        
                                    {admin.is_active
                                        ? "Account Active"
                                        : "Account Inactive"}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminProfile;