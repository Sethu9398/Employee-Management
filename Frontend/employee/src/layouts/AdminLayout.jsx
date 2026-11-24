
import { NavLink, Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";

const AdminLayout = () => {

    const menuItems = [
        {
            name: "Dashboard",
            path: "/admin",
            icon: "bi-speedometer2",
            end: true
        },
        {
            name: "Manage Employees",
            path: "/admin/employees",
            icon: "bi-people"
        },
        {
            name: "Manage Departments",
            path: "/admin/departments",
            icon: "bi-building"
        },
        {
            name: "My Profile",
            path: "/admin/profile",
            icon: "bi-person"
        }
    ];

    return (
        <div className="min-vh-100 bg-light">

            <Navbar />

            <div className="container-fluid "  style={{ paddingTop: "65px" }}>
                <div className="row min-vh-100">

                    <aside
                        className="col-md-3 col-lg-2 bg-white border-end p-3 position-fixed start-0 overflow-auto"
                        style={{
                            top: "65px",
                            height: "calc(100vh - 65px)"
                        }}
                    >

                        <h5 className="fw-bold text-primary mb-4">
                            Admin Panel
                        </h5>

                        <ul className="nav nav-pills flex-column gap-2">

                            {menuItems.map((item) => (

                                <li className="nav-item" key={item.path}>

                                    <NavLink
                                        to={item.path}
                                        end={item.end}
                                        className={({ isActive }) =>
                                            `nav-link d-flex align-items-center gap-2 ${
                                                isActive
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

export default AdminLayout;
