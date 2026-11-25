import { useEffect, useState } from "react";
import api from "../../services/api";

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [userResponse, departmentResponse] = await Promise.all([
                    api.get("/user/list"),
                    api.get("/department/list")
                ]);

                setUsers(userResponse.data.user || []);
                setDepartments(departmentResponse.data.departments || []);

            } catch (err) {
                console.error("Dashboard error:", err);

                setError(
                    err.response?.data?.detail ||
                    "Failed to load dashboard data."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Get latest user (all users included)
    const latestUser = [...users].sort(
        (a, b) => b.user_id - a.user_id
    )[0];

    // Get latest department (all departments included)
    const latestDepartment = [...departments].sort(
        (a, b) => b.department_id - a.department_id
    )[0];

    const formatDate = (dateValue) => {
        if (!dateValue) return "Not available";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "Not available";
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>

                <p className="text-muted mt-2">
                    Loading admin dashboard...
                </p>
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

    return (
        <div>

            {/* Dashboard Heading */}
            <div className="mb-4">
                <h2 className="fw-bold">
                    Admin Dashboard
                </h2>

                <p className="text-muted">
                    Welcome to the Admin Panel.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="row g-4 mb-4">

                {/* Total Users */}
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-4">

                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-2">
                                        Total Users
                                    </p>

                                    <h2 className="fw-bold mb-0">
                                        {users.length}
                                    </h2>
                                </div>

                                <div className="rounded-3 bg-primary bg-opacity-10 p-3">
                                    <i className="bi bi-people fs-2 text-primary"></i>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Total Departments */}
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-4">

                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-2">
                                        Total Departments
                                    </p>

                                    <h2 className="fw-bold mb-0">
                                        {departments.length}
                                    </h2>
                                </div>

                                <div className="rounded-3 bg-success bg-opacity-10 p-3">
                                    <i className="bi bi-building fs-2 text-success"></i>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>

            {/* Latest User */}
            <div className="card border-0 shadow-sm mb-4">

                <div className="card-header bg-white py-3">
                    <h5 className="fw-bold mb-0">
                        <i className="bi bi-person-plus text-primary me-2"></i>
                        Latest Registered User
                    </h5>
                </div>

                <div className="card-body p-4">

                    {latestUser ? (

                        <div className="row g-4 align-items-center">

                            <div className="col-md-2 text-center">
                                <div
                                    className="rounded-circle bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center"
                                    style={{
                                        width: "70px",
                                        height: "70px"
                                    }}
                                >
                                    <i className="bi bi-person fs-2"></i>
                                </div>
                            </div>

                            <div className="col-md-10">
                                <div className="row g-3">

                                    <div className="col-md-4">
                                        <label className="text-muted small">
                                            User ID
                                        </label>

                                        <p className="fw-semibold mb-0">
                                            {latestUser.user_id}
                                        </p>
                                    </div>

                                    <div className="col-md-4">
                                        <label className="text-muted small">
                                            Full Name
                                        </label>

                                        <p className="fw-semibold mb-0">
                                            {latestUser.fullname}
                                        </p>
                                    </div>

                                    <div className="col-md-4">
                                        <label className="text-muted small">
                                            Email
                                        </label>

                                        <p className="fw-semibold mb-0 text-break">
                                            {latestUser.email}
                                        </p>
                                    </div>

                                    <div className="col-md-4">
                                        <label className="text-muted small">
                                            Phone Number
                                        </label>

                                        <p className="fw-semibold mb-0">
                                            {latestUser.phonenumber || "Not provided"}
                                        </p>
                                    </div>

                                    <div className="col-md-4">
                                        <label className="text-muted small">
                                            Department
                                        </label>

                                        <p className="fw-semibold mb-0">
                                            {departments.find(
                                                (department) =>
                                                    department.department_id ===
                                                    latestUser.department_id
                                            )?.department_name || "Not assigned"}
                                        </p>
                                    </div>

                                    <div className="col-md-4">
                                        <label className="text-muted small">
                                            Role
                                        </label>

                                        <p className="fw-semibold mb-0">
                                            {latestUser.role}
                                        </p>
                                    </div>

                                    <div className="col-md-4">
                                        <label className="text-muted small">
                                            Account Status
                                        </label>

                                        <p className="mb-0">
                                            <span className={`badge ${
                                                latestUser.is_active
                                                    ? "bg-success"
                                                    : "bg-danger"
                                            }`}>
                                                {latestUser.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="col-md-4">
                                        <label className="text-muted small">
                                            Joined Date
                                        </label>

                                        <p className="fw-semibold mb-0">
                                            {formatDate(latestUser.created_at)}
                                        </p>
                                    </div>

                                    <div className="col-md-4">
                                        <label className="text-muted small">
                                            Deleted Status
                                        </label>

                                        <p className="mb-0">
                                            <span className={`badge ${
                                                latestUser.is_delete
                                                    ? "bg-danger"
                                                    : "bg-success"
                                            }`}>
                                                {latestUser.is_delete
                                                    ? "Deleted"
                                                    : "Not Deleted"}
                                            </span>
                                        </p>
                                    </div>

                                </div>
                            </div>

                        </div>

                    ) : (
                        <p className="text-muted mb-0">
                            No users found.
                        </p>
                    )}

                </div>
            </div>

            {/* Latest Department */}
            <div className="card border-0 shadow-sm">

                <div className="card-header bg-white py-3">
                    <h5 className="fw-bold mb-0">
                        <i className="bi bi-building-add text-success me-2"></i>
                        Latest Created Department
                    </h5>
                </div>

                <div className="card-body p-4">

                    {latestDepartment ? (

                        <div className="row g-4 align-items-center">

                            <div className="col-md-2 text-center">
                                <div
                                    className="rounded-circle bg-success bg-opacity-10 text-success d-inline-flex align-items-center justify-content-center"
                                    style={{
                                        width: "70px",
                                        height: "70px"
                                    }}
                                >
                                    <i className="bi bi-building fs-2"></i>
                                </div>
                            </div>

                            <div className="col-md-10">
                                <div className="row g-3">

                                    <div className="col-md-4">
                                        <label className="text-muted small">
                                            Department ID
                                        </label>

                                        <p className="fw-semibold mb-0">
                                            {latestDepartment.department_id}
                                        </p>
                                    </div>

                                    <div className="col-md-4">
                                        <label className="text-muted small">
                                            Department Name
                                        </label>

                                        <p className="fw-semibold mb-0">
                                            {latestDepartment.department_name}
                                        </p>
                                    </div>

                                    <div className="col-md-4">
                                        <label className="text-muted small">
                                            Status
                                        </label>

                                        <p className="mb-0">
                                            <span className={`badge ${
                                                latestDepartment.is_active
                                                    ? "bg-success"
                                                    : "bg-danger"
                                            }`}>
                                                {latestDepartment.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="col-md-4">
                                        <label className="text-muted small">
                                            Deleted Status
                                        </label>

                                        <p className="mb-0">
                                            <span className={`badge ${
                                                latestDepartment.is_delete
                                                    ? "bg-danger"
                                                    : "bg-success"
                                            }`}>
                                                {latestDepartment.is_delete
                                                    ? "Deleted"
                                                    : "Not Deleted"}
                                            </span>
                                        </p>
                                    </div>

                                </div>
                            </div>

                        </div>

                    ) : (
                        <p className="text-muted mb-0">
                            No departments found.
                        </p>
                    )}

                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;