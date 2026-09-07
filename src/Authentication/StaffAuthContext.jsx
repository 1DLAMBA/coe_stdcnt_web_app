import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import staffApi, { STAFF_TOKEN_KEY, STAFF_USER_KEY } from '../services/staffApi';

const StaffAuthContext = createContext(null);

const readStoredUser = () => {
    try {
        const raw = localStorage.getItem(STAFF_USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const StaffAuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem(STAFF_TOKEN_KEY));
    const [staffUser, setStaffUser] = useState(readStoredUser);

    const persist = useCallback((nextToken, nextUser) => {
        if (nextToken) {
            localStorage.setItem(STAFF_TOKEN_KEY, nextToken);
        } else {
            localStorage.removeItem(STAFF_TOKEN_KEY);
        }
        if (nextUser) {
            localStorage.setItem(STAFF_USER_KEY, JSON.stringify(nextUser));
        } else {
            localStorage.removeItem(STAFF_USER_KEY);
        }
        setToken(nextToken);
        setStaffUser(nextUser);
    }, []);

    const login = useCallback(async (email, password) => {
        const response = await staffApi.post('/staff/login', { email, password });
        persist(response.data.token, response.data.user);
        return response.data.user;
    }, [persist]);

    const logout = useCallback(async () => {
        try {
            if (token) {
                await staffApi.post('/staff/logout');
            }
        } catch {
            // Token may already be invalid.
        }
        persist(null, null);
    }, [persist, token]);

    const hasPermission = useCallback((permission) => {
        return Boolean(staffUser?.permissions?.includes(permission));
    }, [staffUser]);

    const homePath = staffUser ? '/admin' : '/admin/login';

    const value = useMemo(() => ({
        token,
        staffUser,
        isAuthenticated: Boolean(token),
        login,
        logout,
        hasPermission,
        homePath,
        isCoordinator: staffUser?.role === 'centre_coordinator',
        studyCentre: staffUser?.study_centre || '',
    }), [token, staffUser, login, logout, hasPermission, homePath]);

    return (
        <StaffAuthContext.Provider value={value}>
            {children}
        </StaffAuthContext.Provider>
    );
};

export const useStaffAuth = () => {
    const ctx = useContext(StaffAuthContext);
    if (!ctx) {
        throw new Error('useStaffAuth must be used within StaffAuthProvider');
    }
    return ctx;
};
