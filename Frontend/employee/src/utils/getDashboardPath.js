import { ROLES } from "../constants/roles";

export const getDashboardPath = (user) => {

    if (user?.role === ROLES.ADMIN) {
        return "/admin";
    }

    if (user?.role === ROLES.EMPLOYEE) {
        return "/employee";
    }

    return "/unauthorized";
};