import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    BookOpen,
    Clock,
    Star,
    Play,
    CheckCircle2,
    Target,
    TrendingUp,
    Sparkles,
    Filter,
    ChevronRight,
    Award,
    Zap,
    ArrowRight,
    Check,
    X
} from 'lucide-react';
import { getUserCourses, enrollInCourse, initializeUserData, getUserStats } from '../services/userDataService';
import { ROLE_SKILL_REQUIREMENTS, getRecommendedCourses, COURSE_CATALOG } from '../data/courseData';
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from 'recharts';
import './Learning.css';

const learningPath = [
    { id: 1, title: 'System Design Fundamentals', status: 'completed', type: 'course' },
    { id: 2, title: 'Advanced System Design', status: 'current', type: 'course' },
    { id: 3, title: 'Design a URL Shortener', status: 'upcoming', type: 'project' },
    { id: 4, title: 'Distributed Systems', status: 'upcoming', type: 'course' },
    { id: 5, title: 'System Design Interview Prep', status: 'upcoming', type: 'course' }
];

function Learning() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('recommended');
    const [selectedPath, setSelectedPath] = useState('system-design');
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [toast, setToast] = useState(null);
    const [stats, setStats] = useState({
        coursesCompleted: 0,
        learningHours: 0,
        currentStreak: 0
    });
    const [inProgressCourses, setInProgressCourses] = useState([]);
    const [completedCoursesList, setCompletedCoursesList] = useState([]);
    const [showCompletedModal, setShowCompletedModal] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [levelFilter, setLevelFilter] = useState('All');

    // Get user's current skills and target role
    const userCurrentSkills = user?.currentSkills || {};
    const userTargetRole = user?.targetRole;
    const targetRoleRequirements = userTargetRole ? (ROLE_SKILL_REQUIREMENTS[userTargetRole]?.skills || {}) : {};

    // Calculate dynamic skill gaps
    const skillGaps = useMemo(() => {
        const gaps = {};
        Object.entries(targetRoleRequirements).forEach(([skill, required]) => {
            const current = userCurrentSkills[skill] || 0;
            if (required > current) {
                gaps[skill] = required - current;
            }
        });
        return gaps;
    }, [userCurrentSkills, targetRoleRequirements]);

    // Generate dynamic skills data for radar chart
    const skillsData = useMemo(() => {
        return Object.entries(targetRoleRequirements).map(([skill, required]) => ({
            skill,
            current: userCurrentSkills[skill] || 0,
            required
        }));
    }, [userCurrentSkills, targetRoleRequirements]);

    // AI Recommended Courses
    const recommendedCourses = useMemo(() => {
        const enrolledIds = inProgressCourses.map(c => c.id);
        return getRecommendedCourses(skillGaps, enrolledIds, targetRoleRequirements); // Limit handled in component if needed
    }, [skillGaps, inProgressCourses, targetRoleRequirements]);

    // Get filtered courses for All Courses tab
    const filteredCourses = useMemo(() => {
        return COURSE_CATALOG.filter(course => {
            const matchesCategory = categoryFilter === 'All' || course.category === categoryFilter;
            const matchesLevel = levelFilter === 'All' || course.level === levelFilter;
            return matchesCategory && matchesLevel;
        });
    }, [categoryFilter, levelFilter]);

    // Load enrolled courses and stats from localStorage
    useEffect(() => {
        if (user?.id) {
            initializeUserData(user.id);
            const userData = getUserCourses(user.id);
            setEnrolledCourses(userData.enrolled.map(c => c.id));

            // Load in-progress courses with formatted lastAccessed
            const inProgress = (userData.inProgress || []).map(course => ({
                ...course,
                lastAccessed: course.lastAccessedAt ? formatTimeAgo(course.lastAccessedAt) :
                    course.startedAt ? formatTimeAgo(course.startedAt) : 'Recently'
            }));
            setInProgressCourses(inProgress);

            // Load completed courses
            const completed = (userData.completed || []).map(course => ({
                ...course,
                completedFormatted: course.completedAt ? new Date(course.completedAt).toLocaleDateString() : 'Recently'
            }));
            setCompletedCoursesList(completed);

            const userStats = getUserStats(user.id);
            setStats({
                coursesCompleted: userStats.coursesCompleted || 0,
                learningHours: userStats.learningHours || 0,
                currentStreak: userStats.currentStreak || 0
            });
        }
    }, [user?.id]);

    // Helper to format time ago
    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`;
    };

    const handleEnrollCourse = (course) => {
        if (!user?.id) return;

        if (enrolledCourses.includes(course.id)) {
            // Already enrolled - navigate to course detail
            navigate(`/learning/course/${course.id}`);
            return;
        }

        enrollInCourse(user.id, course);
        setEnrolledCourses(prev => [...prev, course.id]);

        // Add to in-progress list
        setInProgressCourses(prev => [...prev, {
            ...course,
            progress: 0,
            lastAccessed: 'Just now'
        }]);

        setToast({ type: 'success', message: `Enrolled in "${course.title}"!` });
        setTimeout(() => setToast(null), 3000);
    };

    const radarData = skillsData.map(item => ({
        skill: item.skill.length > 10 ? item.skill.slice(0, 10) + '...' : item.skill,
        current: item.current,
        required: item.required
    }));

    return (
        <div className="learning-page">
            <div className="learning-container">
                {/* Header */}
                <motion.div
                    className="learning-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="header-content">
                        <h1>
                            <BookOpen className="header-icon" />
                            Skills & Learning Hub
                        </h1>
                        <p>AI-curated courses and learning paths tailored to your career goals</p>
                    </div>

                    <div className="header-stats">
                        <div
                            className="header-stat clickable"
                            onClick={() => setShowCompletedModal(true)}
                            style={{ cursor: 'pointer' }}
                        >
                            <Award size={20} />
                            <div>
                                <span className="stat-value">{stats.coursesCompleted}</span>
                                <span className="stat-label">Courses Completed</span>
                            </div>
                        </div>
                        <div className="header-stat">
                            <Clock size={20} />
                            <div>
                                <span className="stat-value">{stats.learningHours}h</span>
                                <span className="stat-label">Learning Time</span>
                            </div>
                        </div>
                        <div className="header-stat">
                            <Zap size={20} />
                            <div>
                                <span className="stat-value">{stats.currentStreak} day{stats.currentStreak !== 1 ? 's' : ''}</span>
                                <span className="stat-label">Streak</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {!userTargetRole ? (
                    <motion.div
                        className="no-target-role-state glass-card"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Target size={48} className="no-target-icon" />
                        <h2>Set Your Career Goal</h2>
                        <p>To get personalized course recommendations and track your skill gaps, please select your target role.</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/settings')}
                        >
                            Go to Settings <ChevronRight size={16} />
                        </button>
                    </motion.div>
                ) : (
                    <div className="learning-content">
                        {/* Left Column - Skills */}
                        <div className="skills-column">
                            {/* Skill Radar */}
                            <motion.div
                                className="skill-radar-card glass-card"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="card-header">
                                    <h2>
                                        <Target size={20} />
                                        Skill Assessment
                                    </h2>
                                    <span className="badge badge-primary">vs. {userTargetRole}</span>
                                </div>

                                <div className="radar-container">
                                    <RadarChart width={300} height={250} data={radarData}>
                                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                        <PolarAngleAxis
                                            dataKey="skill"
                                            tick={{ fill: '#9ca3af', fontSize: 11 }}
                                        />
                                        <PolarRadiusAxis
                                            angle={30}
                                            domain={[0, 100]}
                                            tick={{ fill: '#6b7280', fontSize: 10 }}
                                        />
                                        <Radar
                                            name="Required"
                                            dataKey="required"
                                            stroke="#6366f1"
                                            fill="#6366f1"
                                            fillOpacity={0.1}
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                        />
                                        <Radar
                                            name="Current"
                                            dataKey="current"
                                            stroke="#22d3ee"
                                            fill="#22d3ee"
                                            fillOpacity={0.3}
                                            strokeWidth={2}
                                        />
                                    </RadarChart>
                                </div>

                                <div className="radar-legend">
                                    <div className="legend-item">
                                        <span className="legend-dot current" />
                                        Your Skills
                                    </div>
                                    <div className="legend-item">
                                        <span className="legend-dot required" />
                                        Target Role
                                    </div>
                                </div>

                                <div className="skill-gaps">
                                    <h3>Top Skill Gaps</h3>
                                    {skillsData
                                        .filter(s => s.required > s.current)
                                        .sort((a, b) => (b.required - b.current) - (a.required - a.current))
                                        .slice(0, 3)
                                        .map((skill, index) => (
                                            <div key={skill.skill} className="gap-item">
                                                <div className="gap-info">
                                                    <span className="gap-name">{skill.skill}</span>
                                                    <span className="gap-diff">+{skill.required - skill.current}%</span>
                                                </div>
                                                <div className="gap-bar">
                                                    <div
                                                        className="gap-current"
                                                        style={{ width: `${skill.current}%` }}
                                                    />
                                                    <div
                                                        className="gap-target"
                                                        style={{ left: `${skill.required}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </motion.div>

                            {/* In Progress */}
                            <motion.div
                                className="in-progress-card glass-card"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="card-header">
                                    <h2>
                                        <Play size={20} />
                                        Continue Learning
                                    </h2>
                                </div>

                                <div className="progress-list">
                                    {inProgressCourses.length > 0 ? (
                                        inProgressCourses.map((course) => (
                                            <div key={course.id} className="progress-item">
                                                <div className="progress-info">
                                                    <span className="progress-title">{course.title}</span>
                                                    <span className="progress-meta">{course.lastAccessed}</span>
                                                </div>
                                                <div className="progress-bar-container">
                                                    <div className="progress-bar">
                                                        <div
                                                            className="progress-fill"
                                                            style={{ width: `${course.progress}%` }}
                                                        />
                                                    </div>
                                                    <span className="progress-percent">{course.progress}%</span>
                                                </div>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => navigate(`/learning/course/${course.id}`)}
                                                >
                                                    Resume
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-state">
                                            <BookOpen size={32} className="empty-icon" />
                                            <p>No courses in progress yet. Enroll in a course to start learning!</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Column - Courses */}
                        <div className="courses-column">
                            {/* Tabs */}
                            <div className="courses-tabs">
                                <button
                                    className={`tab ${activeTab === 'recommended' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('recommended')}
                                >
                                    <Sparkles size={16} />
                                    AI Recommended
                                </button>
                                <button
                                    className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('all')}
                                >
                                    <BookOpen size={16} />
                                    All Courses
                                </button>
                            </div>

                            {/* Recommended Courses */}
                            {activeTab === 'recommended' && (
                                <motion.div
                                    className="courses-list"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    {recommendedCourses.map((course, index) => (
                                        <motion.div
                                            key={course.id}
                                            className="course-card glass-card"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <div className="course-header">
                                                <div className="course-match-badge">
                                                    <Target size={14} />
                                                    {course.match}% match
                                                </div>
                                                <span className={`course-level level-${course.level.toLowerCase()}`}>
                                                    {course.level}
                                                </span>
                                            </div>

                                            <h3 className="course-title">{course.title}</h3>

                                            <div className="course-reason">
                                                <Sparkles size={14} />
                                                <span>{course.reason}</span>
                                            </div>

                                            <div className="course-meta">
                                                <span className="meta-item">
                                                    <Clock size={14} />
                                                    {course.duration}
                                                </span>
                                                <span className="meta-item">
                                                    <Star size={14} />
                                                    {course.rating}
                                                </span>
                                                <span className="meta-item provider">
                                                    {course.provider}
                                                </span>
                                            </div>

                                            <div className="course-actions">
                                                <button
                                                    className={`btn ${enrolledCourses.includes(course.id) ? 'btn-secondary' : 'btn-primary'}`}
                                                    onClick={() => handleEnrollCourse(course)}
                                                >
                                                    {enrolledCourses.includes(course.id) ? (
                                                        <><Check size={16} /> Enrolled</>
                                                    ) : (
                                                        <>Start Course <ArrowRight size={16} /></>
                                                    )}
                                                </button>
                                                <button className="btn btn-ghost">
                                                    Save for later
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}



                            {activeTab === 'all' && (
                                <motion.div
                                    className="all-courses glass-card"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <div className="filter-bar">
                                        <Filter size={18} />
                                        <select
                                            className="input"
                                            value={categoryFilter}
                                            onChange={(e) => setCategoryFilter(e.target.value)}
                                        >
                                            <option value="All">All Categories</option>
                                            <option value="Technical">Technical</option>
                                            <option value="Data">Data</option>
                                            <option value="DevOps">DevOps</option>
                                            <option value="Leadership">Leadership</option>
                                            <option value="Communication">Communication</option>
                                        </select>
                                        <select
                                            className="input"
                                            value={levelFilter}
                                            onChange={(e) => setLevelFilter(e.target.value)}
                                        >
                                            <option value="All">All Levels</option>
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                        </select>
                                    </div>

                                    <div className="all-courses-grid">
                                        {filteredCourses.map((course) => (
                                            <div key={course.id} className="all-course-card">
                                                <div className="all-course-header">
                                                    <span className={`course-level level-${course.level.toLowerCase()}`}>
                                                        {course.level}
                                                    </span>
                                                    <span className="course-category">{course.category}</span>
                                                </div>
                                                <h4 className="all-course-title">{course.title}</h4>
                                                <p className="all-course-description">{course.description}</p>
                                                <div className="all-course-meta">
                                                    <span><Clock size={14} /> {course.duration}</span>
                                                    <span><Star size={14} /> {course.rating}</span>
                                                    <span className="provider">{course.provider}</span>
                                                </div>
                                                <div className="all-course-skills">
                                                    {course.skillsAddressed.map(({ skill, points }) => (
                                                        <span key={skill} className="skill-tag">
                                                            {skill} +{points}%
                                                        </span>
                                                    ))}
                                                </div>
                                                <button
                                                    className={`btn ${enrolledCourses.includes(course.id) ? 'btn-secondary' : 'btn-primary'} btn-full`}
                                                    onClick={() => handleEnrollCourse(course)}
                                                >
                                                    {enrolledCourses.includes(course.id) ? (
                                                        <><Check size={16} /> View Course</>
                                                    ) : (
                                                        <>Enroll Now <ArrowRight size={16} /></>
                                                    )}
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {filteredCourses.length === 0 && (
                                        <div className="empty-state">
                                            <BookOpen size={32} className="empty-icon" />
                                            <p>No courses match your filters. Try adjusting your selection.</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </div>
                )}

                {/* Toast Notification */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            className={`toast toast-${toast.type}`}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                        >
                            {toast.type === 'success' ? <Check size={18} /> : <BookOpen size={18} />}
                            {toast.message}
                            <button onClick={() => setToast(null)}><X size={16} /></button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Completed Courses Modal */}
                <AnimatePresence>
                    {showCompletedModal && (
                        <div className="modal-overlay" onClick={() => setShowCompletedModal(false)}>
                            <motion.div
                                className="modal-content glass-card"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="modal-header">
                                    <div className="modal-title">
                                        <Award size={24} className="text-secondary" />
                                        <h3>Completed Courses</h3>
                                    </div>
                                    <button className="btn-icon" onClick={() => setShowCompletedModal(false)}>
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="modal-body">
                                    {completedCoursesList.length > 0 ? (
                                        <div className="completed-courses-list">
                                            {completedCoursesList.map(course => (
                                                <div key={course.id} className="completed-course-item">
                                                    <div className="completed-course-info">
                                                        <h4>{course.title}</h4>
                                                        <span className="completed-date">Completed on {course.completedFormatted}</span>
                                                    </div>
                                                    <div className="completed-course-badge">
                                                        <CheckCircle2 size={16} />
                                                        <span>Completed</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="empty-state">
                                            <BookOpen size={32} className="empty-icon" />
                                            <p>No courses completed yet. Keep learning!</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default Learning;
