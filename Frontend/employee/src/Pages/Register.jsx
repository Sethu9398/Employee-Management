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

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Register employee
  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post(AUTH_ENDPOINTS.REGISTER, {
        fullname: formData.fullname.trim(),
        email: formData.email.trim(),
        department_id: Number(formData.department_id),
        phonenumber: formData.phonenumber.trim() || null,
        password: formData.password,
      });

      // Backend has already set authentication cookies
      // Update AuthContext and localStorage
      login(response.data);

      navigate(getDashboardPath(response.data), { replace: true });
    } catch (error) {
      console.error("Registration error:", error);

      setError(
        error.response?.data?.detail ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Employee Registration</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleRegister}>
        {/* Fullname */}
        <div>
          <label>Full Name</label>

          <input
            type="text"
            name="fullname"
            placeholder="Enter full name"
            value={formData.fullname}
            onChange={handleChange}
            minLength={2}
            maxLength={150}
            required
          />
        </div>

        <br />

        {/* Email */}
        <div>
          <label>Email</label>

          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            maxLength={150}
            required
          />
        </div>

        <br />

        {/* Department ID */}
        <div>
          <label>Department ID</label>

          <input
            type="number"
            name="department_id"
            placeholder="Enter department ID"
            value={formData.department_id}
            onChange={handleChange}
            min="1"
            step="1"
            required
          />
        </div>

        <br />

        {/* Phone Number */}
        <div>
          <label>Phone Number</label>

          <input
            type="tel"
            name="phonenumber"
            placeholder="Enter phone number"
            value={formData.phonenumber}
            onChange={handleChange}
            maxLength={15}
          />
        </div>

        <br />

        {/* Password */}
        <div>
          <label>Password</label>

          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            minLength={8}
            maxLength={72}
            required
          />
        </div>

        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default Register;
