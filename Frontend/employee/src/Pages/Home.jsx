import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Home = () => {

    const { user, logout } = useAuth();

    const navigate = useNavigate();

    const handleLogout = () => {

        logout();

        navigate("/login", { replace: true });

    };

    return (
        <div>

            <h1>Home Page</h1>

            <h2>Welcome {user?.fullname}</h2>

            <p>Email: {user?.email}</p>

            <p>Role: {user?.role}</p>

            <button onClick={handleLogout}>
                Logout
            </button>

        </div>
    );
};

export default Home;