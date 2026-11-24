import { useEffect, useState } from "react";
import api from "../../services/api";

const EmployeeDashboard = () => {

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

    // Active and non-deleted users
    const activeUsers = users.filter(
        (user) => user.is_active === true && user.is_delete === false
    );

    // Active and non-deleted departments
    const activeDepartments = departments.filter(
        (department) =>
            department.is_active === true &&
            department.is_delete === false
    );

    // Latest joined user (assuming higher user_id means newer user)
    const latestUser = [...activeUsers].sort(
        (a, b) => b.user_id - a.user_id
    )[0];

    // Find latest user's department
    const latestDepartment = latestUser
        ? departments.find(
            (department) =>
                department.department_id === latestUser.department_id
        )
        : null;

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2">Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    return (
        <div>
            {/* Dashboard Heading */}
            <div className="mb-4">
                <h2 className="fw-bold">Employee Dashboard</h2>
                <p className="text-muted">
                    Welcome to your Employee Portal.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="row g-4 mb-4">

                {/* Users Card */}
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-2">
                                        Active Users
                                    </p>

                                    <h2 className="fw-bold mb-0">
                                        {activeUsers.length}
                                    </h2>
                                </div>

                                <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                                    <i className="bi bi-people-fill fs-2 text-primary"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Departments Card */}
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-2">
                                        Active Departments
                                    </p>

                                    <h2 className="fw-bold mb-0">
                                        {activeDepartments.length}
                                    </h2>
                                </div>

                                <div className="bg-success bg-opacity-10 rounded-3 p-3">
                                    <i className="bi bi-building fs-2 text-success"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Latest Joined User */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3">
                    <h5 className="fw-bold mb-0">
                        <i className="bi bi-person-plus-fill text-primary me-2"></i>
                        Last Joined User
                    </h5>
                </div>

                <div className="card-body p-4">

                    {latestUser ? (
                        <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 rounded-circle px-3 py-2 me-3">
                                <i className="bi bi-person-fill fs-3 text-primary"></i>
                            </div>

                            <div>
                                <h5 className="fw-bold mb-1">
                                    {latestUser.fullname}
                                </h5>

                                <p className="text-muted mb-0">
                                    Department:{" "}
                                    <span className="fw-semibold text-dark">
                                        {latestDepartment?.department_name || "Not Assigned"}
                                    </span>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted mb-0">
                            No active users found.
                        </p>
                    )}

                </div>
            </div>

        </div>
    );
};

export default EmployeeDashboard;