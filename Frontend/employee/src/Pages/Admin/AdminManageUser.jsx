import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const AdminManageUser = () => {
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [departmentFilter, setDepartmentFilter] = useState("all");

    const [loading, setLoading] = useState(true);
    const [updatingUserId, setUpdatingUserId] = useState(null);

    // Fetch users and departments
    const fetchData = async () => {
        try {
            setLoading(true);

            const [userResponse, departmentResponse] = await Promise.all([
                api.get("/user/list"),
                api.get("/department/list"),
            ]);

            setUsers(userResponse.data.user || []);
            setDepartments(departmentResponse.data.departments || []);

        } catch (err) {
            console.error(err);
            alert("Failed to load users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Department name helper
    const getDepartmentName = (departmentId) => {
        const department = departments.find(
            (dept) => dept.department_id === departmentId
        );

        return department?.department_name || "N/A";
    };

    // Format date
    const formatDate = (dateValue) => {
        if (!dateValue) return "N/A";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) return "N/A";

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // Search and filter users
    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const searchValue = search.toLowerCase().trim();

            const matchesSearch =
                user.fullname?.toLowerCase().includes(searchValue) ||
                user.email?.toLowerCase().includes(searchValue) ||
                String(user.user_id).includes(searchValue);

            const matchesActive =
                activeFilter === "all" ||
                (activeFilter === "active" && user.is_active) ||
                (activeFilter === "inactive" && !user.is_active);

            const matchesDepartment =
                departmentFilter === "all" ||
                String(user.department_id) === departmentFilter;

            return matchesSearch && matchesActive && matchesDepartment;
        });
    }, [users, search, activeFilter, departmentFilter]);

    // Toggle active status
    const handleActiveToggle = async (user) => {
        const newActiveStatus = !user.is_active;

        try {
            setUpdatingUserId(user.user_id);

            const response = await api.patch(
                `/user/active/${user.user_id}/${newActiveStatus}`
            );

            setUsers((prevUsers) =>
                prevUsers.map((item) =>
                    item.user_id === user.user_id
                        ? response.data
                        : item
                )
            );

        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.detail ||
                "Failed to update active status."
            );
        } finally {
            setUpdatingUserId(null);
        }
    };

    // Toggle delete status
    const handleDeleteToggle = async (user) => {
        const newDeleteStatus = !user.is_delete;

        const action = newDeleteStatus ? "delete" : "restore";


        try {
            setUpdatingUserId(user.user_id);

            const response = await api.patch(
                `/user/delete/${user.user_id}/${newDeleteStatus}`
            );

            setUsers((prevUsers) =>
                prevUsers.map((item) =>
                    item.user_id === user.user_id
                        ? response.data
                        : item
                )
            );

        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.detail ||
                "Failed to update delete status."
            );
        } finally {
            setUpdatingUserId(null);
        }
    };

    return (
        <div className="container-fluid py-4">

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Manage Users</h2>
                    <p className="text-muted mb-0">
                        Search, filter and manage employee accounts
                    </p>
                </div>

                <span className="badge bg-primary fs-6">
                    {filteredUsers.length} Users
                </span>
            </div>

            {/* Search and Filters */}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                    <div className="row g-3">

                        {/* Search */}
                        <div className="col-lg-4 col-md-12">
                            <label className="form-label fw-semibold">
                                Search
                            </label>

                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bi bi-search"></i>
                                </span>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Name, email or user ID..."
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        {/* Active Filter */}
                        <div className="col-lg-4 col-md-6">
                            <label className="form-label fw-semibold">
                                Active Status
                            </label>

                            <select
                                className="form-select"
                                value={activeFilter}
                                onChange={(e) =>
                                    setActiveFilter(e.target.value)
                                }
                            >
                                <option value="all">All Users</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Department Filter */}
                        <div className="col-lg-4 col-md-6">
                            <label className="form-label fw-semibold">
                                Department
                            </label>

                            <select
                                className="form-select"
                                value={departmentFilter}
                                onChange={(e) =>
                                    setDepartmentFilter(e.target.value)
                                }
                            >
                                <option value="all">All Departments</option>

                                {departments.map((department) => (
                                    <option
                                        key={department.department_id}
                                        value={String(
                                            department.department_id
                                        )}
                                    >
                                        {department.department_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                    </div>

                    {/* Reset */}
                    <div className="mt-3 text-end">
                        <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => {
                                setSearch("");
                                setActiveFilter("all");
                                setDepartmentFilter("all");
                            }}
                        >
                            <i className="bi bi-arrow-counterclockwise me-1"></i>
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* User Cards */}
            {loading ? (
                <div className="text-center py-5">
                    <div
                        className="spinner-border text-primary"
                        role="status"
                    ></div>

                    <p className="mt-2 text-muted">
                        Loading users...
                    </p>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                        <i className="bi bi-people fs-1 text-muted"></i>

                        <h5 className="mt-3">No users found</h5>

                        <p className="text-muted mb-0">
                            Try changing your search or filters.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="row g-4">

                    {filteredUsers.map((user) => (
                        <div
                            className="col-xl-4 col-lg-6 col-md-6"
                            key={user.user_id}
                        >
                            <div
                                className={`card h-100 shadow-sm ${
                                    user.is_delete
                                        ? "border-danger"
                                        : "border-0"
                                }`}
                            >
                                <div className="card-body">

                                    {/* User Header */}
                                    <div className="d-flex align-items-center mb-3">

                                        <div
                                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold me-3"
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                flexShrink: 0,
                                            }}
                                        >
                                            {user.fullname
                                                ? user.fullname
                                                      .split(" ")
                                                      .map((name) =>
                                                          name[0]
                                                      )
                                                      .join("")
                                                      .substring(0, 2)
                                                      .toUpperCase()
                                                : "U"}
                                        </div>

                                        <div className="flex-grow-1 overflow-hidden">
                                            <h5 className="mb-1 text-truncate">
                                                {user.fullname || "Unnamed User"}
                                            </h5>

                                            <small className="text-muted">
                                                ID: #{user.user_id}
                                            </small>
                                        </div>

                                    </div>

                                    {/* User Details */}
                                    <div className="mb-3">

                                        <div className="mb-2">
                                            <i className="bi bi-envelope me-2 text-primary"></i>

                                            <span className="small">
                                                {user.email}
                                            </span>
                                        </div>

                                        <div className="mb-2">
                                            <i className="bi bi-telephone me-2 text-primary"></i>

                                            <span className="small">
                                                {user.phonenumber || "N/A"}
                                            </span>
                                        </div>

                                        <div className="mb-2">
                                            <i className="bi bi-building me-2 text-primary"></i>

                                            <span className="small">
                                                {getDepartmentName(
                                                    user.department_id
                                                )}
                                            </span>
                                        </div>

                                        <div className="mb-2">
                                            <i className="bi bi-person-badge me-2 text-primary"></i>

                                            <span className="small">
                                                {typeof user.role === "object"
                                                    ? user.role?.value
                                                    : user.role}
                                            </span>
                                        </div>

                                        <div className="mb-2">
                                            <i className="bi bi-calendar3 me-2 text-primary"></i>

                                            <span className="small">
                                                Joined: {formatDate(user.created_at)}
                                            </span>
                                        </div>

                                    </div>

                                    <hr />

                                    {/* Status Controls */}
                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

                                        {/* Active Switch */}
                                        <div>
                                            <label className="form-label small fw-semibold mb-1">
                                                Active Status
                                            </label>

                                            <div className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    role="switch"
                                                    checked={Boolean(
                                                        user.is_active
                                                    )}
                                                    disabled={
                                                        updatingUserId ===
                                                        user.user_id
                                                    }
                                                    onChange={() =>
                                                        handleActiveToggle(user)
                                                    }
                                                />

                                                <label className="form-check-label small">
                                                    {user.is_active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </label>
                                            </div>
                                        </div>

                                        {/* Delete Switch */}
                                        <div>
                                            <label className="form-label small fw-semibold mb-1">
                                                Delete Status
                                            </label>

                                            <div className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    role="switch"
                                                    checked={Boolean(
                                                        user.is_delete
                                                    )}
                                                    disabled={
                                                        updatingUserId ===
                                                        user.user_id
                                                    }
                                                    onChange={() =>
                                                        handleDeleteToggle(user)
                                                    }
                                                />

                                                <label className="form-check-label small">
                                                    {user.is_delete
                                                        ? "Deleted"
                                                        : "Not Deleted"}
                                                </label>
                                            </div>
                                        </div>

                                    </div>

                                    {/* Updating Indicator */}
                                    {/* {updatingUserId === user.user_id && (
                                        <div className="text-center mt-3">
                                            <small className="text-primary">
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Updating...
                                            </small>
                                        </div>
                                    )} */}

                                </div>
                            </div>
                        </div>
                    ))}

                </div>
            )}

        </div>
    );
};

export default AdminManageUser;