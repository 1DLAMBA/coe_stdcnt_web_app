export const STAFF_NAV_ITEMS = [
    {
        key: 'home',
        path: '/admin',
        label: 'Home',
        permission: null,
        icon: 'home',
    },
    {
        key: 'students',
        path: '/admin/student-stats',
        coordinatorLabel: 'My students',
        label: 'All students',
        permission: 'students.view',
        icon: 'team',
    },
    {
        key: 'graduation',
        path: '/admin/graduation-list',
        label: 'Graduation list',
        permission: 'graduation.view',
        icon: 'excel',
    },
    {
        key: 'add-students',
        path: '/admin/add-students',
        label: 'Add a student',
        permission: 'students.manage',
        icon: 'userAdd',
    },
    {
        key: 'clearance',
        path: '/admin/clearance',
        coordinatorLabel: 'Centre clearance',
        label: 'Approve clearance',
        permission: 'clearance.view',
        icon: 'audit',
    },
    {
        key: 'applications',
        path: '/admin/view-applications',
        label: 'New applications',
        permission: 'applications.view',
        icon: 'file',
    },
    {
        key: 'approved',
        path: '/admin/view-approved',
        label: 'Admitted students',
        permission: 'applications.view',
        icon: 'check',
    },
    {
        key: 'reports',
        path: '/admin/reports',
        label: 'Reports',
        permission: 'stats.view',
        icon: 'chart',
    },
    {
        key: 'staff',
        path: '/admin/staff',
        label: 'Staff logins',
        permission: 'staff.manage',
        icon: 'safety',
    },
    {
        key: 'payments',
        path: '/admin/payments',
        label: 'Payments',
        permission: 'payments.view',
        icon: 'wallet',
    },
    {
        key: 'audit',
        path: '/admin/audit-log',
        label: 'Audit log',
        permission: 'audit.view',
        icon: 'history',
    },
];

export function navLabel(item, isCoordinator) {
    return isCoordinator && item.coordinatorLabel ? item.coordinatorLabel : item.label;
}

export function visibleNavItems(hasPermission, isCoordinator) {
    return STAFF_NAV_ITEMS.filter((item) => {
        if (item.key === 'reports' && isCoordinator) {
            return false;
        }
        if (!item.permission) {
            return true;
        }
        return hasPermission(item.permission);
    });
}
