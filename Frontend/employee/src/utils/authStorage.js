
export const USER_STORAGE_KEY = "user";

export const getStoredUser = () => {
    try {
        const raw = localStorage.getItem(USER_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
       
        localStorage.removeItem(USER_STORAGE_KEY);
        return null;
    }
};

export const setStoredUser = (user) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const clearStoredUser = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
};
