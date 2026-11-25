import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const AdminManageDepartment = () => {
    const [departments, setDepartments] = useState([]);

    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [deleteFilter, setDeleteFilter] = useState("all");

    const [loading, setLoading] = useState(true);
    const [updatingDepartmentId, setUpdatingDepartmentId] = useState(null);

    // Create department states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [departmentName, setDepartmentName] = useState("");
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Fetch departments
    const fetchDepartments = async () => {
        try {
            setLoading(true);

            const response = await api.get("/department/list");

            setDepartments(response.data.departments || []);
        } catch (err) {
            console.error(err);
            alert("Failed to load departments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    // Search and filter
    const filteredDepartments = useMemo(() => {
        return departments.filter((department) => {
            const searchValue = search.trim().toLowerCase();

            const matchesSearch =
                department.department_name?.toLowerCase().includes(searchValue) ||
                String(department.department_id).includes(searchValue);

            const matchesActive =
                activeFilter === "all" ||
                (activeFilter === "active" && department.is_active) ||
                (activeFilter === "inactive" && !department.is_active);

            const matchesDelete =
                deleteFilter === "all" ||
                (deleteFilter === "not_deleted" && !department.is_delete) ||
                (deleteFilter === "deleted" && department.is_delete);

            return matchesSearch && matchesActive && matchesDelete;
        });
    }, [departments, search, activeFilter, deleteFilter]);

    // Create department
    const handleCreateDepartment = async (e) => {
        e.preventDefault();

        const trimmedName = departmentName.trim();

        if (!trimmedName) {
            setCreateError("Department name is required.");
            return;
        }

        try {
            setCreating(true);
            setCreateError("");

            const response = await api.post("/department/create", {
                department_name: trimmedName,
            });

            // Add newly created department to the list
            setDepartments((prevDepartments) => [
                response.data,
                ...prevDepartments,
            ]);

             await fetchDepartments();

            setDepartmentName("");
            setShowCreateModal(false);
            setSuccessMessage("Department created successfully!");

        } catch (err) {
            console.error(err);

            setCreateError(
                err.response?.data?.detail ||
                "Failed to create department."
            );
        } finally {
            setCreating(false);
        }
    };

    // Toggle active status
    const handleActiveToggle = async (department) => {
        const newActiveStatus = !department.is_active;

        try {
            setUpdatingDepartmentId(department.department_id);

            const response = await api.patch(
                `/department/${department.department_id}/status`,
                null,
                {
                    params: {
                        is_active: newActiveStatus,
                    },
                }
            );

            setDepartments((prevDepartments) =>
                prevDepartments.map((item) =>
                    item.department_id === department.department_id
                        ? {
                              ...item,
                              ...response.data,
                              is_active: response.data.is_active,
                          }
                        : item
                )
            );
        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.detail ||
                "Failed to update department active status."
            );
        } finally {
            setUpdatingDepartmentId(null);
        }
    };

    // Toggle delete status
    const handleDeleteToggle = async (department) => {
        const newDeleteStatus = !department.is_delete;

        const action = newDeleteStatus ? "delete" : "restore";

        if (!window.confirm(`Are you sure you want to ${action} this department?`)) {
            return;
        }

        try {
            setUpdatingDepartmentId(department.department_id);

            const response = await api.patch(
                `/department/delete/${department.department_id}/${newDeleteStatus}`
            );

            setDepartments((prevDepartments) =>
                prevDepartments.map((item) =>
                    item.department_id === department.department_id
                        ? {
                              ...item,
                              ...response.data,
                          }
                        : item
                )
            );
        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.detail ||
                "Failed to update department delete status."
            );
        } finally {
            setUpdatingDepartmentId(null);
        }
    };

    // Reset filters
    const handleReset = () => {
        setSearch("");
        setActiveFilter("all");
        setDeleteFilter("all");
    };

    // Close modal
    const handleCloseModal = () => {
        if (creating) return;

        setShowCreateModal(false);
        setDepartmentName("");
        setCreateError("");
    };

    return (
        <div className="container-fluid py-4">

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">

                <div>
                    <h2 className="fw-bold mb-1">Manage Departments</h2>

                    <p className="text-muted mb-0">
                        Search and manage department status
                    </p>
                </div>

                <div className="d-flex align-items-center gap-2">

                    <span className="badge bg-primary fs-6">
                        {filteredDepartments.length} Departments
                    </span>

                    {/* Create Button */}
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setCreateError("");
                            setShowCreateModal(true);
                        }}
                    >
                        <i className="bi bi-plus-lg me-2"></i>
                        Create Department
                    </button>

                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div
                    className="alert alert-success alert-dismissible fade show"
                    role="alert"
                >
                    <i className="bi bi-check-circle me-2"></i>
                    {successMessage}

                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setSuccessMessage("")}
                    ></button>
                </div>
            )}

            {/* Search and Filters */}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">

                    <div className="row g-3 align-items-end">

                        {/* Search */}
                        <div className="col-lg-4 col-md-12">
                            <label className="form-label fw-semibold">
                                Search Department
                            </label>

                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bi bi-search"></i>
                                </span>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Department name or ID..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
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
                                <option value="all">All</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Delete Filter */}
                        <div className="col-lg-4 col-md-6">
                            <label className="form-label fw-semibold">
                                Delete Status
                            </label>

                            <select
                                className="form-select"
                                value={deleteFilter}
                                onChange={(e) =>
                                    setDeleteFilter(e.target.value)
                                }
                            >
                                <option value="all">All</option>
                                <option value="not_deleted">Not Deleted</option>
                                <option value="deleted">Deleted</option>
                            </select>
                        </div>

                    </div>

                    {/* Reset */}
                    <div className="text-end mt-3">
                        <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={handleReset}
                        >
                            <i className="bi bi-arrow-counterclockwise me-1"></i>
                            Reset Filters
                        </button>
                    </div>

                </div>
            </div>

            {/* Department List */}
            {loading ? (
                <div className="text-center py-5">
                    <div
                        className="spinner-border text-primary"
                        role="status"
                    ></div>

                    <p className="text-muted mt-2">
                        Loading departments...
                    </p>
                </div>
            ) : filteredDepartments.length === 0 ? (
                <div className="card shadow-sm border-0">
                    <div className="card-body text-center py-5">
                        <i className="bi bi-building fs-1 text-muted"></i>

                        <h5 className="mt-3">
                            No departments found
                        </h5>

                        <p className="text-muted mb-0">
                            Try changing your search or filters.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="d-flex flex-column gap-3">

                    {filteredDepartments.map((department) => (
                        <div
                            className={`card shadow-sm ${
                                department.is_delete
                                    ? "border-danger"
                                    : "border-0"
                            }`}
                            key={department.department_id}
                        >
                            <div className="card-body">

                                <div className="row align-items-center g-3">

                                    {/* Department Details */}
                                    <div className="col-lg-6 col-md-12">
                                        <div className="d-flex align-items-center">

                                            <div
                                                className="bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center me-3"
                                                style={{
                                                    width: "55px",
                                                    height: "55px",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <i className="bi bi-building fs-4"></i>
                                            </div>

                                            <div>
                                                <h5 className="fw-bold mb-1">
                                                    {department.department_name}
                                                </h5>

                                                <small className="text-muted">
                                                    Department ID: #
                                                    {department.department_id}
                                                </small>
                                            </div>

                                        </div>
                                    </div>

                                    {/* Active Status */}
                                    <div className="col-lg-3 col-md-6">
                                        <label className="form-label small fw-semibold mb-1">
                                            Active Status
                                        </label>

                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                role="switch"
                                                checked={Boolean(
                                                    department.is_active
                                                )}
                                                disabled={
                                                    updatingDepartmentId ===
                                                    department.department_id
                                                }
                                                onChange={() =>
                                                    handleActiveToggle(department)
                                                }
                                            />

                                            <label className="form-check-label small">
                                                {department.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </label>
                                        </div>
                                    </div>

                                    {/* Delete Status */}
                                    <div className="col-lg-3 col-md-6">
                                        <label className="form-label small fw-semibold mb-1">
                                            Delete Status
                                        </label>

                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                role="switch"
                                                checked={Boolean(
                                                    department.is_delete
                                                )}
                                                disabled={
                                                    updatingDepartmentId ===
                                                    department.department_id
                                                }
                                                onChange={() =>
                                                    handleDeleteToggle(department)
                                                }
                                            />

                                            <label className="form-check-label small">
                                                {department.is_delete
                                                    ? "Deleted"
                                                    : "Not Deleted"}
                                            </label>
                                        </div>
                                    </div>

                                </div>

                                {/* Deleted Badge */}
                                {department.is_delete && (
                                    <div className="mt-3">
                                        <span className="badge bg-danger">
                                            <i className="bi bi-trash me-1"></i>
                                            Deleted Department
                                        </span>
                                    </div>
                                )}

                                {/* Updating */}
                                {updatingDepartmentId ===
                                    department.department_id && (
                                    <div className="mt-3">
                                        <small className="text-primary">
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Updating department...
                                        </small>
                                    </div>
                                )}

                            </div>
                        </div>
                    ))}

                </div>
            )}

            {/* Create Department Modal */}
            {showCreateModal && (
                <div
                    className="modal fade show"
                    style={{
                        display: "block",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                    }}
                    tabIndex="-1"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">

                            {/* Modal Header */}
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">
                                    <i className="bi bi-building-add text-primary me-2"></i>
                                    Create Department
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    disabled={creating}
                                    onClick={handleCloseModal}
                                ></button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleCreateDepartment}>

                                <div className="modal-body">

                                    <p className="text-muted">
                                        Enter a name to create a new department.
                                    </p>

                                    {/* Error */}
                                    {createError && (
                                        <div className="alert alert-danger py-2">
                                            <i className="bi bi-exclamation-circle me-2"></i>
                                            {createError}
                                        </div>
                                    )}

                                    <label className="form-label fw-semibold">
                                        Department Name
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter department name"
                                        value={departmentName}
                                        onChange={(e) => {
                                            setDepartmentName(e.target.value);
                                            setCreateError("");
                                        }}
                                        maxLength={100}
                                        autoFocus
                                        disabled={creating}
                                    />

                                </div>

                                {/* Modal Footer */}
                                <div className="modal-footer">

                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        disabled={creating}
                                        onClick={handleCloseModal}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={creating}
                                    >
                                        {creating ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-plus-lg me-2"></i>
                                                Create Department
                                            </>
                                        )}
                                    </button>

                                </div>

                            </form>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminManageDepartment;