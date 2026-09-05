import React, { useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Button, ConfigProvider, Drawer } from 'antd';
import {
    HomeOutlined,
    TeamOutlined,
    FileExcelOutlined,
    UserAddOutlined,
    AuditOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    BarChartOutlined,
    SafetyCertificateOutlined,
    MenuOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import logo from '../../../../assets/logo2.png';
import { useStaffAuth } from '../../../../Authentication/StaffAuthContext';
import { navLabel, visibleNavItems } from './staffNav';
import './Admin_Panel.css';

const ICONS = {
    home: <HomeOutlined />,
    team: <TeamOutlined />,
    excel: <FileExcelOutlined />,
    userAdd: <UserAddOutlined />,
    audit: <AuditOutlined />,
    file: <FileTextOutlined />,
    check: <CheckCircleOutlined />,
    chart: <BarChartOutlined />,
    safety: <SafetyCertificateOutlined />,
};

const theme = {
    token: {
        colorPrimary: '#028f64',
        borderRadius: 8,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
    },
};

const Admin_Panel = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { staffUser, logout, hasPermission, isCoordinator, studyCentre } = useStaffAuth();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const items = visibleNavItems(hasPermission, isCoordinator);

    const routeLogOut = async () => {
        await logout();
        navigate('/admin/login');
    };

    const roleLabel = isCoordinator
        ? `${studyCentre || 'Centre'} coordinator`
        : (staffUser?.role || 'staff').replace(/_/g, ' ');

    const isActive = (item) => (
        item.path === '/admin'
            ? location.pathname === '/admin'
            : location.pathname.startsWith(item.path)
    );

    const go = (path) => {
        setDrawerOpen(false);
        navigate(path);
    };

    return (
        <ConfigProvider theme={theme}>
            <div className="staff-shell" data-testid="staff-shell">
                <header className="staff-header">
                    <div className="staff-header-brand">
                        <Button
                            className="staff-menu-btn"
                            icon={<MenuOutlined />}
                            onClick={() => setDrawerOpen(true)}
                            aria-label="Open menu"
                        />
                        <img src={logo} alt="College logo" />
                        <h1>College of Education — Staff</h1>
                    </div>
                    <div className="staff-header-meta">
                        <span className="staff-role-chip" data-testid="staff-role">
                            {staffUser?.name} · {roleLabel}
                        </span>
                        <Button
                            icon={<LogoutOutlined />}
                            onClick={routeLogOut}
                            data-testid="staff-logout"
                        >
                            Log out
                        </Button>
                    </div>
                </header>
                <nav className="staff-nav staff-nav-desktop" aria-label="Staff sections" data-testid="staff-nav">
                    {items.map((item) => {
                        const active = isActive(item);
                        return (
                            <Button
                                key={item.key}
                                type={active ? 'primary' : 'default'}
                                icon={ICONS[item.icon]}
                                className="staff-nav-btn"
                                data-testid={`staff-nav-${item.key}`}
                                onClick={() => navigate(item.path)}
                            >
                                {navLabel(item, isCoordinator)}
                            </Button>
                        );
                    })}
                </nav>
                <Drawer
                    title={`${staffUser?.name || 'Staff'} · ${roleLabel}`}
                    placement="left"
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    width={280}
                >
                    {items.map((item) => (
                        <button
                            type="button"
                            key={item.key}
                            className={`staff-drawer-item${isActive(item) ? ' active' : ''}`}
                            onClick={() => go(item.path)}
                        >
                            {ICONS[item.icon]}
                            {navLabel(item, isCoordinator)}
                        </button>
                    ))}
                    <Button
                        className="staff-drawer-logout"
                        icon={<LogoutOutlined />}
                        onClick={routeLogOut}
                        danger
                    >
                        Log out
                    </Button>
                </Drawer>
                <main className="staff-body">
                    <Outlet />
                </main>
            </div>
        </ConfigProvider>
    );
};

export default Admin_Panel;
