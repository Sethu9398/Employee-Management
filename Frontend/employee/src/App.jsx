
import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ROLES } from "./constants/roles";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Unauthorized from "./Pages/Unauthorized";

import AdminDashboard from "./Pages/Admin/AdminDashboard";
import EmployeeDashboard from "./Pages/Employee/EmployeeDashboard";

import AdminLayout from "./layouts/AdminLayout";
import EmployeeLayout from "./layouts/EmployeeLayout";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import DashboardRedirect from "./components/DashboardRedirect";
import EmployeeProfile from "./Pages/Employee/EmployeeProfile";
import EmployeeUserList from "./Pages/Employee/EmployeeUserList";
import AdminManageUser from "./Pages/Admin/AdminManageUser";
import AdminManageDepartment from "./Pages/Admin/AdminManageDepartment";
import AdminProfile from "./Pages/Admin/AdminProfile";

function App() {

    return (
        <AuthProvider>
            <BrowserRouter>

                <Routes>

                    {/* Public Routes */}

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    {/* Protected Routes */}

                    <Route element={<ProtectedRoute />}>

                        {/* Admin Routes */}

                        <Route element={<RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}/>}>

                            <Route path="/admin" element={<AdminLayout />}>

                                <Route
                                    index   element={<AdminDashboard />}/>
                                <Route path="/admin/employees" element={<AdminManageUser />} />

                                <Route path="/admin/departments" element={<AdminManageDepartment />} />

                                <Route path="/admin/profile" element={<AdminProfile/>}/>

                                {/* Add more admin routes here */}

                            </Route>

                        </Route>

                        {/* Employee Routes */}

                        <Route
                            element={
                                <RoleProtectedRoute  allowedRoles={[ROLES.EMPLOYEE]}/>}>

                            <Route
                                path="/employee"
                                element={<EmployeeLayout />}
                            >

                                <Route index element={<EmployeeDashboard />}/>

                                <Route path="/employee/profile" element={<EmployeeProfile />} />
                                <Route path="/employee/userList" element={<EmployeeUserList />} />

                                {/* Add more employee routes here */}

                            </Route>

                        </Route>

                    </Route>

                    {/* Unauthorized */}

                    <Route
                        path="/unauthorized"
                        element={<Unauthorized />}
                    />

                    {/* Default Route */}

                    <Route
                        path="*"
                        element={<DashboardRedirect />}
                    />

                </Routes>

            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;