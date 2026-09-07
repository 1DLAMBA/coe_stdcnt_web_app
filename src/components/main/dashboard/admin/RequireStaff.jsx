import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStaffAuth } from '../../../../Authentication/StaffAuthContext';

const RequireStaff = ({ children, permission }) => {
    const { isAuthenticated, hasPermission } = useStaffAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
    }

    if (permission && !hasPermission(permission)) {
        return <Navigate to="/admin/student-stats" replace />;
    }

    return children;
};

export default RequireStaff;
