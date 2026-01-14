import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, User, LogOut, Trash2 } from 'lucide-react';
import './Navbar.css';

function Navbar() {
    const { user, logout, deleteAccount } = useAuth();
    const searchInputRef = useRef(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // Handle ⌘K / Ctrl+K keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Check for ⌘K (Mac) or Ctrl+K (Windows/Linux)
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }

            // Close search on Escape
            if (e.key === 'Escape') {
                searchInputRef.current?.blur();
                setShowDropdown(false);
            }
        };

        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                await deleteAccount();
                navigate('/login');
            } catch (error) {
                console.error('Failed to delete account:', error);
                alert('Failed to delete account. Please try again.');
            }
        }
    };

    return (
        <header className="navbar">
            <div className="navbar-left">
                <div className="search-container">
                    <Search className="search-icon" size={18} />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search courses, mentors, projects..."
                        className="search-input"
                    />
                    <span className="search-shortcut">⌘K</span>
                </div>
            </div>

            <div className="navbar-right">
                <div
                    className={`user-menu ${showDropdown ? 'active' : ''}`}
                    onClick={() => setShowDropdown(!showDropdown)}
                    ref={dropdownRef}
                >
                    <div className="user-avatar">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} />
                        ) : (
                            <span>{getInitials(user?.name)}</span>
                        )}
                    </div>
                    <div className="user-info">
                        <span className="user-name">{user?.name || 'User'}</span>
                        <span className="user-role">{user?.title || 'Employee'}</span>
                    </div>
                    <ChevronDown size={16} className={`dropdown-icon ${showDropdown ? 'rotate' : ''}`} />

                    {/* Standard Dropdown Menu */}
                    {showDropdown && (
                        <div className="dropdown-menu">
                            <div className="dropdown-header">
                                <span className="dropdown-name">{user?.name}</span>
                                <span className="dropdown-email">{user?.email}</span>
                            </div>
                            <div className="dropdown-divider" />
                            <div className="dropdown-item" onClick={(e) => { e.stopPropagation(); navigate('/settings'); setShowDropdown(false); }}>
                                <User size={16} />
                                <span>My Profile</span>
                            </div>
                            <div className="dropdown-item delete-account" onClick={(e) => { e.stopPropagation(); handleDeleteAccount(); }}>
                                <Trash2 size={16} />
                                <span>Delete Account</span>
                            </div>
                            <div className="dropdown-divider" />
                            <div className="dropdown-item logout" onClick={(e) => { e.stopPropagation(); handleLogout(); }}>
                                <LogOut size={16} />
                                <span>Log Out</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Navbar;
