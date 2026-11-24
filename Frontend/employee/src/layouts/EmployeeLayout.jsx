
import { NavLink, Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";

const EmployeeLayout = () => {

    const menuItems = [
        {
            name: "Dashboard",
            path: "/employee",
            icon: "bi-speedometer2",
            end: true
        },
        {
            name: "My Profile",
            path: "/employee/profile",
            icon: "bi-person"
        },
        {
            name: "User List",
            path: "/employee/userList",
            icon: "bi bi-list"
        }
    ];

    return (
        <div className="min-vh-100 bg-light">

            <Navbar />

            <div className="container-fluid" style={{ paddingTop: "65px" }}>
                <div className="row min-vh-100">

                    <aside
                        className="col-md-3 col-lg-2 bg-white border-end p-3 position-fixed start-0 overflow-auto"
                        style={{
                            top: "65px",
                            height: "calc(100vh - 65px)"
                        }}
                    >

                        <h5 className="fw-bold text-primary mb-4">
                            Employee Panel
                        </h5>

                        <ul className="nav nav-pills flex-column gap-2">

                            {menuItems.map((item) => (

                                <li className="nav-item" key={item.path}>

                                    <NavLink
                                        to={item.path}
                                        end={item.end}
                                        className={({ isActive }) =>
                                            `nav-link d-flex align-items-center gap-2 ${isActive
                                                ? "active"
                                                : "text-dark"
                                            }`
                                        }
                                    >

                                        <i className={`bi ${item.icon}`}></i>

                                        {item.name}

                                    </NavLink>

                                </li>

                            ))}

                        </ul>

                    </aside>

                    <main className="col-md-9 offset-md-3 col-lg-10 offset-lg-2 p-4">

                        <Outlet />

                    </main>

                </div>
            </div>

        </div>
    );
};

export default EmployeeLayout;
