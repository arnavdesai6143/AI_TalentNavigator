import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    Home,
    BookOpen,
    Target,
    MessageSquare,
    TrendingUp,
    Briefcase,
    Users,
    LayoutDashboard,
    Bot,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { useState } from 'react';
import './Sidebar.css';

const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard', roles: ['employee', 'manager', 'admin'] },
    { path: '/onboarding', icon: Sparkles, label: 'Onboarding', roles: ['employee', 'manager', 'admin'] },
    { path: '/learning', icon: BookOpen, label: 'Learning Hub', roles: ['employee', 'manager', 'admin'] },
    { path: '/career-path', icon: TrendingUp, label: 'Career Path', roles: ['employee', 'manager', 'admin'] },
    { path: '/opportunities', icon: Briefcase, label: 'Opportunities', roles: ['employee', 'manager', 'admin'] },
    { path: '/mentorship', icon: Users, label: 'Mentorship', roles: ['employee', 'manager', 'admin'] },
    { path: '/agents', icon: Bot, label: 'Agent Playground', roles: ['employee', 'manager', 'admin'] },
];

function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();

    const filteredItems = navItems.filter(item =>
        item.roles.includes(user?.role || 'employee')
    );

    const handleLogout = () => {
        logout();
    };

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <Link to="/dashboard" className="sidebar-logo">
                    <div className="logo-icon">
                        <Target className="logo-icon-svg" />
                    </div>
                    {!collapsed && (
                        <span className="logo-text">
                            AI Talent<span className="logo-accent">Navigator</span>
                        </span>
                    )}
                </Link>
                <button
                    className="collapse-btn"
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {filteredItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`nav-item ${isActive ? 'active' : ''}`}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <Icon className="nav-icon" size={20} />
                                    {!collapsed && <span className="nav-label">{item.label}</span>}
                                    {isActive && <div className="active-indicator" />}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <Link
                    to="/settings"
                    className="nav-item"
                    title={collapsed ? 'Settings' : undefined}
                >
                    <Settings className="nav-icon" size={20} />
                    {!collapsed && <span className="nav-label">Settings</span>}
                </Link>
                <button
                    className="nav-item logout-btn"
                    onClick={handleLogout}
                    title={collapsed ? 'Logout' : undefined}
                >
                    <LogOut className="nav-icon" size={20} />
                    {!collapsed && <span className="nav-label">Logout</span>}
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
