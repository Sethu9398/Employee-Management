const UserModal = ({ user, department, onClose }) => {
    if (!user) return null;

    const formatDate = (dateValue) => {
    if (!dateValue) return "Not available";

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
};

    return (
        <>
            <div
                className="modal fade show d-block"
                tabIndex="-1"
                role="dialog"
                aria-modal="true"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow">

                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title">
                                Employee Information
                            </h5>

                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                onClick={onClose}
                            ></button>
                        </div>

                        <div className="modal-body p-4">

                            <div className="text-center mb-4">
                                <div
                                    className="rounded-circle bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center mb-3"
                                    style={{ width: "80px", height: "80px" }}
                                >
                                    <i class="bi bi-person fs-2"></i>
                                </div>

                                <h5 className="fw-bold mb-1">
                                    {user.fullname}
                                </h5>

                                <span className="badge bg-primary">
                                    {user.role}
                                </span>
                            </div>

                            <hr />

                            <div className="row g-3">

                                <div className="col-6">
                                    <label className="text-muted small">
                                        User ID
                                    </label>
                                    <p className="fw-semibold mb-0">
                                        {formatDate(user.created_at)}
                                    </p>
                                </div>

                                <div className="col-6">
                                    <label className="text-muted small">
                                        Full Name
                                    </label>
                                    <p className="fw-semibold mb-0">
                                        {user.fullname || "Not provided"}
                                    </p>
                                </div>

                                <div className="col-12">
                                    <label className="text-muted small">
                                        Email Address
                                    </label>
                                    <p className="fw-semibold mb-0">
                                        {user.email || "Not provided"}
                                    </p>
                                </div>

                                <div className="col-6">
                                    <label className="text-muted small">
                                        Phone Number
                                    </label>
                                    <p className="fw-semibold mb-0">
                                        {user.phonenumber || "Not provided"}
                                    </p>
                                </div>

                                <div className="col-6">
                                    <label className="text-muted small">
                                        Department
                                    </label>
                                    <p className="fw-semibold mb-0">
                                        {department?.department_name || "Not assigned"}
                                    </p>
                                </div>

                                <div className="col-6">
                                    <label className="text-muted small">
                                        Account Status
                                    </label>
                                    <p className="mb-0">
                                        <span className={`badge ${user.is_active ? "bg-success" : "bg-danger"}`}>
                                            {user.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </p>
                                </div>

                                <div className="col-6">
                                    <label className="text-muted small">
                                        Joined Date
                                    </label>
                                    <p className="fw-semibold mb-0">
                                        {user.created_at
                                            ? new Date(user.created_at).toLocaleDateString()
                                            : "Not available"}
                                    </p>
                                </div>

                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            <div className="modal-backdrop fade show"></div>
        </>
    );
};

export default UserModal;