import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
    User,
    Bell,
    Lock,
    Palette,
    Target,
    Mail,
    Eye,
    EyeOff,
    Save,
    Camera,
    Check,
    Moon,
    Sun,
    Monitor,
    ChevronRight,
    AlertCircle,
    Settings as SettingsIcon,
    Info
} from 'lucide-react';
import { ROLE_SKILL_REQUIREMENTS } from '../data/courseData';
import { formatJobTitle } from '../utils/formatters';
import './Settings.css';

function Settings() {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [showPassword, setShowPassword] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const fileInputRef = useRef(null);

    // Check if user is a demo user (cannot edit)
    const isDemoUser = user?.email?.includes('demo-') ||
        user?.email === 'john.doe@company.com' ||
        user?.email === 'sarah.lead@company.com' ||
        user?.email === 'admin@company.com';

    // Form states
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        title: user?.title || '',
        department: user?.department || '',
        bio: user?.bio || ''
    });

    const [notifications, setNotifications] = useState({
        emailNotifications: user?.notifications?.emailNotifications ?? true,
        learningReminders: user?.notifications?.learningReminders ?? true,
        feedbackAlerts: user?.notifications?.feedbackAlerts ?? true,
        mentorshipUpdates: user?.notifications?.mentorshipUpdates ?? true,
        weeklyDigest: user?.notifications?.weeklyDigest ?? true,
        achievementAlerts: user?.notifications?.achievementAlerts ?? true
    });

    const [appearance, setAppearance] = useState({
        theme: user?.appearance?.theme || localStorage.getItem('theme') || 'light',
        compactMode: user?.appearance?.compactMode ?? false,
        animationsEnabled: user?.appearance?.animationsEnabled ?? true
    });

    const [careerPrefs, setCareerPrefs] = useState({
        careerGoal: user?.targetRole || user?.careerGoal || '',
        targetTimeline: user?.careerPrefs?.targetTimeline || '1-2 years',
        learningStyle: user?.careerPrefs?.learningStyle || 'mixed',
        weeklyLearningHours: user?.careerPrefs?.weeklyLearningHours || 5
    });

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Apply theme on mount and when it changes
    useEffect(() => {
        applyTheme(appearance.theme);
    }, [appearance.theme]);

    const applyTheme = (theme) => {
        const root = document.documentElement;
        let effectiveTheme = theme;

        if (theme === 'system') {
            effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        if (effectiveTheme === 'dark') {
            root.setAttribute('data-theme', 'dark');
        } else {
            root.removeAttribute('data-theme');
        }

        localStorage.setItem('theme', theme);
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'password', label: 'Change Password', icon: Lock },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'career', label: 'Career Preferences', icon: Target }
    ];

    const handleSave = async (section) => {
        if (isDemoUser) return;

        setSaveStatus('saving');

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        // Update user context based on section
        if (section === 'profile') {
            updateUser(profileData);
        } else if (section === 'career') {
            updateUser({
                targetRole: careerPrefs.careerGoal,
                careerGoal: careerPrefs.careerGoal,
                careerPrefs: {
                    targetTimeline: careerPrefs.targetTimeline,
                    learningStyle: careerPrefs.learningStyle,
                    weeklyLearningHours: careerPrefs.weeklyLearningHours
                }
            });
        } else if (section === 'notifications') {
            updateUser({ notifications });
        } else if (section === 'appearance') {
            updateUser({ appearance });
        }

        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 2000);
    };

    const handlePasswordChange = async () => {
        if (isDemoUser) return;

        setPasswordError('');
        setPasswordSuccess('');

        // Validation
        if (!passwords.currentPassword) {
            setPasswordError('Please enter your current password');
            return;
        }
        if (passwords.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters');
            return;
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        setSaveStatus('saving');
        await new Promise(resolve => setTimeout(resolve, 800));

        // Update password (in real app, this would be an API call)
        updateUser({ passwordUpdated: new Date().toISOString() });

        setPasswordSuccess('Password changed successfully!');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setSaveStatus('saved');
        setTimeout(() => {
            setSaveStatus(null);
            setPasswordSuccess('');
        }, 3000);
    };

    const handleProfileChange = (e) => {
        if (isDemoUser) return;
        setProfileData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleNotificationChange = (key) => {
        if (isDemoUser) return;
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleAppearanceChange = (key, value) => {
        setAppearance(prev => ({
            ...prev,
            [key]: value !== undefined ? value : !prev[key]
        }));

        // Immediately apply theme changes
        if (key === 'theme') {
            applyTheme(value);
        }
    };

    const handleCareerChange = (key, value) => {
        if (isDemoUser) return;
        setCareerPrefs(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleAvatarClick = () => {
        if (isDemoUser) return;
        fileInputRef.current?.click();
    };

    const handleAvatarChange = (e) => {
        if (isDemoUser) return;
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Image must be less than 2MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                updateUser({ avatar: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-container">
                {/* Header */}
                <motion.div
                    className="settings-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1>
                        <SettingsIcon className="header-icon" />
                        Settings
                    </h1>
                    <p>Manage your account settings and preferences</p>
                </motion.div>

                {/* Demo User Banner */}
                {isDemoUser && (
                    <motion.div
                        className="demo-banner"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Info size={20} />
                        <div>
                            <strong>Demo Account</strong>
                            <p>You're using a demo account. Settings are view-only. Create your own account to customize settings.</p>
                        </div>
                    </motion.div>
                )}

                <div className="settings-content">
                    {/* Sidebar Navigation */}
                    <motion.nav
                        className="settings-nav glass-card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <Icon size={20} />
                                    <span>{tab.label}</span>
                                    <ChevronRight size={16} className="tab-arrow" />
                                </button>
                            );
                        })}
                    </motion.nav>

                    {/* Main Content */}
                    <motion.div
                        className="settings-main glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="settings-section">
                                <div className="section-header">
                                    <h2>Profile Information</h2>
                                    <p>Update your personal details and profile picture</p>
                                </div>

                                <div className="profile-avatar-section">
                                    <div className="avatar-preview">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt="Profile" />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {profileData.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <button
                                            className="avatar-upload-btn"
                                            onClick={handleAvatarClick}
                                            disabled={isDemoUser}
                                            title={isDemoUser ? "Demo users cannot change avatar" : "Upload new photo"}
                                        >
                                            <Camera size={16} />
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleAvatarChange}
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                    <div className="avatar-info">
                                        <span className="avatar-name">{profileData.name}</span>
                                        <span className="avatar-role">{profileData.title}</span>
                                    </div>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={profileData.name}
                                            onChange={handleProfileChange}
                                            className="form-input"
                                            disabled={isDemoUser}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <div className="input-with-icon">
                                            <Mail size={18} />
                                            <input
                                                type="email"
                                                name="email"
                                                value={profileData.email}
                                                onChange={handleProfileChange}
                                                className="form-input"
                                                disabled={isDemoUser}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Job Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={profileData.title}
                                            onChange={handleProfileChange}
                                            className="form-input"
                                            onBlur={(e) => {
                                                if (isDemoUser) return;
                                                setProfileData(prev => ({
                                                    ...prev,
                                                    title: formatJobTitle(e.target.value)
                                                }));
                                            }}
                                            disabled={isDemoUser}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Department</label>
                                        <input
                                            type="text"
                                            name="department"
                                            value={profileData.department}
                                            onChange={handleProfileChange}
                                            className="form-input"
                                            disabled={isDemoUser}
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Bio</label>
                                        <textarea
                                            name="bio"
                                            value={profileData.bio}
                                            onChange={handleProfileChange}
                                            className="form-textarea"
                                            rows={4}
                                            placeholder="Tell us a bit about yourself..."
                                            disabled={isDemoUser}
                                        />
                                    </div>
                                </div>

                                <div className="section-actions">
                                    <button
                                        className="btn btn-primary save-btn"
                                        onClick={() => handleSave('profile')}
                                        disabled={saveStatus === 'saving' || isDemoUser}
                                    >
                                        {saveStatus === 'saving' ? (
                                            <>Saving...</>
                                        ) : saveStatus === 'saved' ? (
                                            <><Check size={18} /> Saved</>
                                        ) : (
                                            <><Save size={18} /> Save Changes</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className="settings-section">
                                <div className="section-header">
                                    <h2>Notification Preferences</h2>
                                    <p>Choose how you want to be notified</p>
                                </div>

                                <div className="toggle-list">
                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <span className="toggle-label">Email Notifications</span>
                                            <span className="toggle-description">Receive notifications via email</span>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={notifications.emailNotifications}
                                                onChange={() => handleNotificationChange('emailNotifications')}
                                                disabled={isDemoUser}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <span className="toggle-label">Learning Reminders</span>
                                            <span className="toggle-description">Daily reminders to continue your courses</span>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={notifications.learningReminders}
                                                onChange={() => handleNotificationChange('learningReminders')}
                                                disabled={isDemoUser}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <span className="toggle-label">Feedback Alerts</span>
                                            <span className="toggle-description">Get notified when you receive feedback</span>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={notifications.feedbackAlerts}
                                                onChange={() => handleNotificationChange('feedbackAlerts')}
                                                disabled={isDemoUser}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <span className="toggle-label">Mentorship Updates</span>
                                            <span className="toggle-description">Updates about your mentorship connections</span>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={notifications.mentorshipUpdates}
                                                onChange={() => handleNotificationChange('mentorshipUpdates')}
                                                disabled={isDemoUser}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <span className="toggle-label">Weekly Digest</span>
                                            <span className="toggle-description">Weekly summary of your progress</span>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={notifications.weeklyDigest}
                                                onChange={() => handleNotificationChange('weeklyDigest')}
                                                disabled={isDemoUser}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <span className="toggle-label">Achievement Alerts</span>
                                            <span className="toggle-description">Celebrate when you reach milestones</span>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={notifications.achievementAlerts}
                                                onChange={() => handleNotificationChange('achievementAlerts')}
                                                disabled={isDemoUser}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>

                                <div className="section-actions">
                                    <button
                                        className="btn btn-primary save-btn"
                                        onClick={() => handleSave('notifications')}
                                        disabled={isDemoUser}
                                    >
                                        <Save size={18} /> Save Preferences
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Change Password Tab (formerly Privacy & Security) */}
                        {activeTab === 'password' && (
                            <div className="settings-section">
                                <div className="section-header">
                                    <h2>Change Password</h2>
                                    <p>Update your account password</p>
                                </div>

                                {passwordError && (
                                    <div className="password-error">
                                        <AlertCircle size={16} />
                                        {passwordError}
                                    </div>
                                )}

                                {passwordSuccess && (
                                    <div className="password-success">
                                        <Check size={16} />
                                        {passwordSuccess}
                                    </div>
                                )}

                                <div className="password-form">
                                    <div className="form-group">
                                        <label>Current Password</label>
                                        <div className="input-with-icon password-input">
                                            <Lock size={18} />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={passwords.currentPassword}
                                                onChange={(e) => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
                                                className="form-input"
                                                placeholder="Enter current password"
                                                disabled={isDemoUser}
                                            />
                                            <button
                                                className="password-toggle"
                                                onClick={() => setShowPassword(!showPassword)}
                                                type="button"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>New Password</label>
                                        <div className="input-with-icon password-input">
                                            <Lock size={18} />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={passwords.newPassword}
                                                onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                                                className="form-input"
                                                placeholder="Enter new password (min 6 characters)"
                                                disabled={isDemoUser}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Confirm New Password</label>
                                        <div className="input-with-icon password-input">
                                            <Lock size={18} />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={passwords.confirmPassword}
                                                onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                className="form-input"
                                                placeholder="Confirm new password"
                                                disabled={isDemoUser}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="section-actions">
                                    <button
                                        className="btn btn-primary save-btn"
                                        onClick={handlePasswordChange}
                                        disabled={isDemoUser || saveStatus === 'saving'}
                                    >
                                        {saveStatus === 'saving' ? (
                                            <>Updating...</>
                                        ) : (
                                            <><Save size={18} /> Update Password</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Appearance Tab */}
                        {activeTab === 'appearance' && (
                            <div className="settings-section">
                                <div className="section-header">
                                    <h2>Appearance</h2>
                                    <p>Customize how the app looks and feels</p>
                                </div>

                                <div className="subsection">
                                    <h3>Theme</h3>
                                    <div className="theme-options">
                                        <button
                                            className={`theme-option ${appearance.theme === 'light' ? 'selected' : ''}`}
                                            onClick={() => handleAppearanceChange('theme', 'light')}
                                        >
                                            <div className="theme-preview light-preview">
                                                <Sun size={24} />
                                            </div>
                                            <span>Light</span>
                                        </button>
                                        <button
                                            className={`theme-option ${appearance.theme === 'dark' ? 'selected' : ''}`}
                                            onClick={() => handleAppearanceChange('theme', 'dark')}
                                        >
                                            <div className="theme-preview dark-preview">
                                                <Moon size={24} />
                                            </div>
                                            <span>Dark</span>
                                        </button>
                                        <button
                                            className={`theme-option ${appearance.theme === 'system' ? 'selected' : ''}`}
                                            onClick={() => handleAppearanceChange('theme', 'system')}
                                        >
                                            <div className="theme-preview system-preview">
                                                <Monitor size={24} />
                                            </div>
                                            <span>System</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="subsection">
                                    <h3>Display Options</h3>
                                    <div className="toggle-list">
                                        <div className="toggle-item">
                                            <div className="toggle-info">
                                                <span className="toggle-label">Compact Mode</span>
                                                <span className="toggle-description">Reduce spacing for more content</span>
                                            </div>
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={appearance.compactMode}
                                                    onChange={() => handleAppearanceChange('compactMode')}
                                                />
                                                <span className="toggle-slider"></span>
                                            </label>
                                        </div>
                                        <div className="toggle-item">
                                            <div className="toggle-info">
                                                <span className="toggle-label">Animations</span>
                                                <span className="toggle-description">Enable smooth transitions and effects</span>
                                            </div>
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={appearance.animationsEnabled}
                                                    onChange={() => handleAppearanceChange('animationsEnabled')}
                                                />
                                                <span className="toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="section-actions">
                                    <button
                                        className="btn btn-primary save-btn"
                                        onClick={() => handleSave('appearance')}
                                    >
                                        <Save size={18} /> Apply Changes
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Career Preferences Tab */}
                        {activeTab === 'career' && (
                            <div className="settings-section">
                                <div className="section-header">
                                    <h2>Career Preferences</h2>
                                    <p>Help us personalize your career development journey</p>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label>Career Goal</label>
                                        <select
                                            value={careerPrefs.careerGoal}
                                            onChange={(e) => handleCareerChange('careerGoal', e.target.value)}
                                            className="form-select"
                                            disabled={isDemoUser}
                                        >
                                            <option value="">Select a target role...</option>
                                            {Object.keys(ROLE_SKILL_REQUIREMENTS).map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Target Timeline</label>
                                        <select
                                            value={careerPrefs.targetTimeline}
                                            onChange={(e) => handleCareerChange('targetTimeline', e.target.value)}
                                            className="form-select"
                                            disabled={isDemoUser}
                                        >
                                            <option value="6 months">6 months</option>
                                            <option value="1 year">1 year</option>
                                            <option value="1-2 years">1-2 years</option>
                                            <option value="2-3 years">2-3 years</option>
                                            <option value="3+ years">3+ years</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Preferred Learning Style</label>
                                        <select
                                            value={careerPrefs.learningStyle}
                                            onChange={(e) => handleCareerChange('learningStyle', e.target.value)}
                                            className="form-select"
                                            disabled={isDemoUser}
                                        >
                                            <option value="video">Video Courses</option>
                                            <option value="reading">Reading & Documentation</option>
                                            <option value="hands-on">Hands-on Projects</option>
                                            <option value="mixed">Mixed Approach</option>
                                        </select>
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Weekly Learning Hours: {careerPrefs.weeklyLearningHours} hours</label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="20"
                                            value={careerPrefs.weeklyLearningHours}
                                            onChange={(e) => handleCareerChange('weeklyLearningHours', parseInt(e.target.value))}
                                            className="form-range"
                                            disabled={isDemoUser}
                                        />
                                        <div className="range-labels">
                                            <span>1 hr/week</span>
                                            <span>10 hrs/week</span>
                                            <span>20 hrs/week</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="ai-suggestion-box">
                                    <div className="suggestion-header">
                                        <AlertCircle size={20} />
                                        <span>AI Recommendation</span>
                                    </div>
                                    <p>
                                        Based on your goal to become a <strong>{careerPrefs.careerGoal || 'Senior Engineer'}</strong>,
                                        we recommend dedicating at least <strong>5-7 hours per week</strong> to learning for optimal progress
                                        within your <strong>{careerPrefs.targetTimeline}</strong> timeline.
                                    </p>
                                </div>

                                <div className="section-actions">
                                    <button
                                        className="btn btn-primary save-btn"
                                        onClick={() => handleSave('career')}
                                        disabled={isDemoUser}
                                    >
                                        <Save size={18} /> Save Preferences
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default Settings;
