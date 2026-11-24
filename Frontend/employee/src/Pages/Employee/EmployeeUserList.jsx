import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import UserModal from "../../components/UserModal";

const EmployeeUserList = () => {

    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");

    const [departmentFilter, setDepartmentFilter] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");

    const [selectedUser, setSelectedUser] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch users
    useEffect(() => {

        const fetchUsers = async () => {
            setLoading(true);
            setError("");

            try {
                const response = appliedSearch
                    ? await api.get(
                        `/user/search/${encodeURIComponent(appliedSearch)}`
                    )
                    : await api.get("/user/list");

                // Your backend response key is "user", not "users"
                setUsers(response.data.user || []);

            } catch (err) {
                console.error("User API error:", err);

                setError(
                    err.response?.data?.detail ||
                    "Unable to load employee list."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();

    }, [appliedSearch]);

    // Fetch departments
    useEffect(() => {

        const fetchDepartments = async () => {
            try {
                const response = await api.get("/department/list");

                setDepartments(response.data.departments || []);

            } catch (err) {
                console.error("Department API error:", err);
            }
        };

        fetchDepartments();

    }, []);

    // Search submit
    const handleSearch = (e) => {
        e.preventDefault();
        setAppliedSearch(searchTerm.trim());
    };

    // Clear search
    const handleClearSearch = () => {
        setSearchTerm("");
        setAppliedSearch("");
    };

    // Filter and sort users
    const filteredUsers = useMemo(() => {

        let result = users.filter(
            (user) =>
                user.is_delete === false &&
                String(user.role).toLowerCase() === "employee"
        );

        // Department filter
        if (departmentFilter) {
            result = result.filter(
                (user) =>
                    String(user.department_id) === String(departmentFilter)
            );
        }

        // Sort by created date, falling back to user ID
        result.sort((a, b) => {

            const dateA = a.created_at
                ? new Date(a.created_at).getTime()
                : Number(a.user_id);

            const dateB = b.created_at
                ? new Date(b.created_at).getTime()
                : Number(b.user_id);

            return sortOrder === "desc"
                ? dateB - dateA
                : dateA - dateB;
        });

        return result;

    }, [users, departmentFilter, sortOrder]);

    // Find department details
    const getDepartment = (departmentId) => {
        return departments.find(
            (department) =>
                String(department.department_id) === String(departmentId)
        );
    };

    return (
        <div>

            {/* Page Heading */}
            <div className="mb-4">
                <h2 className="fw-bold">Employee List</h2>
                <p className="text-muted">
                    View and search employee information.
                </p>
            </div>

            {/* Search and Filters */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-3">

                    <form onSubmit={handleSearch}>
                        <div className="row g-3">

                            {/* Search */}
                            <div className="col-lg-5">
                                <label className="form-label fw-semibold">
                                    Search Employee
                                </label>

                                <div className="input-group">

                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by name or user ID"
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                    />

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        Search
                                    </button>
                                </div>
                            </div>

                            {/* Department Filter */}
                            <div className="col-lg-3">
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
                                    <option value="">
                                        All Departments
                                    </option>

                                    {departments
                                        .filter(
                                            (department) =>
                                                department.is_active === true &&
                                                department.is_delete === false
                                        )
                                        .map((department) => (
                                            <option
                                                key={department.department_id}
                                                value={department.department_id}
                                            >
                                                {department.department_name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Sorting */}
                            <div className="col-lg-3">
                                <label className="form-label fw-semibold">
                                    Sort By Joined Date
                                </label>

                                <select
                                    className="form-select"
                                    value={sortOrder}
                                    onChange={(e) =>
                                        setSortOrder(e.target.value)
                                    }
                                >
                                    <option value="desc">
                                        Newest First
                                    </option>

                                    <option value="asc">
                                        Oldest First
                                    </option>
                                </select>
                            </div>

                            {/* Clear */}
                            <div className="col-lg-1 d-flex align-items-end">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary w-100"
                                    title="Clear filters"
                                    onClick={() => {
                                        handleClearSearch();
                                        setDepartmentFilter("");
                                        setSortOrder("desc");
                                    }}
                                >
                                   <i class="bi bi-bootstrap-reboot"></i>
                                </button>
                            </div>

                        </div>
                    </form>

                </div>
            </div>

            {/* Employee Count */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">
                    Employees
                </h5>

                <span className="badge bg-primary fs-6">
                    {filteredUsers.length} Employees
                </span>
            </div>

            {/* Loading */}
            {loading && (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                    <p className="text-muted mt-2">
                        Loading employees...
                    </p>
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {/* Employee Cards */}
            {!loading && !error && (
                <div className="row g-4">

                    {filteredUsers.length > 0 ? (

                        filteredUsers.map((user) => {

                            const department = getDepartment(
                                user.department_id
                            );

                            return (
                                <div
                                    className="col-md-6 col-xl-4"
                                    key={user.user_id}
                                >
                                    <div className="card border-0 shadow-sm h-100">

                                        <div className="card-body p-4">

                                            <div className="d-flex align-items-center mb-3">

                                                <div
                                                    className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-3"
                                                    style={{
                                                        width: "55px",
                                                        height: "55px"
                                                    }}
                                                >
                                                    <i class="bi bi-person fs-2"></i>
                                                </div>

                                                <div className="overflow-hidden">
                                                    <h5 className="fw-bold mb-1 text-truncate">
                                                        {user.fullname}
                                                    </h5>

                                                    <small className="text-muted">
                                                        Employee ID: {user.user_id}
                                                    </small>
                                                </div>

                                            </div>

                                            <hr />

                                            <div className="mb-2">
                                                <small className="text-muted">
                                                    Email Address
                                                </small>

                                                <p className="fw-semibold mb-0 text-break">
                                                    {user.email || "Not provided"}
                                                </p>
                                            </div>

                                            <div className="mb-2">
                                                <small className="text-muted">
                                                    Phone Number
                                                </small>

                                                <p className="fw-semibold mb-0">
                                                    {user.phonenumber || "Not provided"}
                                                </p>
                                            </div>

                                            <div className="mb-2">
                                                <small className="text-muted">
                                                    Department
                                                </small>

                                                <p className="fw-semibold mb-0">
                                                    {department?.department_name || "Not assigned"}
                                                </p>
                                            </div>

                                            <div className="mb-3">
                                                <small className="text-muted">
                                                    Status
                                                </small>

                                                <div>
                                                    <span
                                                        className={`badge ${
                                                            user.is_active
                                                                ? "bg-success"
                                                                : "bg-danger"
                                                        }`}
                                                    >
                                                        {user.is_active
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                className="btn btn-outline-primary w-100"
                                                onClick={() =>
                                                    setSelectedUser(user)
                                                }
                                            >
                                                <i className="fa fa-info-circle me-2"></i>
                                                Info
                                            </button>

                                        </div>
                                    </div>
                                </div>
                            );
                        })

                    ) : (
                        <div className="col-12">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center py-5">
                                    <i className="fa fa-users fa-3x text-muted mb-3"></i>

                                    <h5 className="fw-bold">
                                        No Employees Found
                                    </h5>

                                    <p className="text-muted mb-0">
                                        Try changing your search or department filter.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            )}

            {/* User Information Modal */}
            {selectedUser && (
                <UserModal
                    user={selectedUser}
                    department={getDepartment(selectedUser.department_id)}
                    onClose={() => setSelectedUser(null)}
                />
            )}

        </div>
    );
};

export default EmployeeUserList;