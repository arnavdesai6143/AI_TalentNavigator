import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
    Sparkles,
    BookOpen,
    TrendingUp,
    Target,
    Clock,
    CheckCircle2,
    ArrowRight,
    Flame,
    Award,
    Zap,
    Calendar,
    MessageSquare,
    Users,
    Briefcase,
    ChevronRight,
    PlayCircle
} from 'lucide-react';
import {
    getUserStats,
    getIncompleteTasks,
    getUserCourses,
    getUserFeedback,
    getUserCareerPath,
    initializeUserData
} from '../services/userDataService';
import { ROLE_SKILL_REQUIREMENTS, getRecommendedCourses } from '../data/courseData';
import './Dashboard.css';


function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        skillsMastered: 0,
        learningHours: 0,
        coursesCompleted: 0,
        currentStreak: 0,
        totalSkills: 20
    });
    const [todayTasks, setTodayTasks] = useState([]);
    const [recentFeedback, setRecentFeedback] = useState([]);
    const [careerPath, setCareerPath] = useState(null);
    const [inProgressCourses, setInProgressCourses] = useState([]);
    const [completedCoursesList, setCompletedCoursesList] = useState([]);
    const [showCompletedModal, setShowCompletedModal] = useState(false);

    // Load user data on mount
    useEffect(() => {
        if (user?.id) {
            initializeUserData(user.id);

            // Load stats
            const userStats = getUserStats(user.id);
            setStats(userStats);

            // Load incomplete tasks
            const tasks = getIncompleteTasks(user.id);
            setTodayTasks(tasks.map(task => ({
                ...task,
                dueIn: task.phase === 'Day 1' ? '2 hours' : task.phase === 'Week 1' ? '1 week' : '1 month',
                priority: task.phase === 'Day 1' ? 'high' : task.phase === 'Week 1' ? 'medium' : 'low'
            })));

            // Load feedback
            const feedback = getUserFeedback(user.id);
            setRecentFeedback(feedback.received.slice(0, 3));

            // Load career path
            const career = getUserCareerPath(user.id);
            setCareerPath(career);

            // Load in-progress courses
            const courses = getUserCourses(user.id);
            setInProgressCourses(courses.inProgress || []);

            // Load completed courses
            const completed = (courses.completed || []).map(course => ({
                ...course,
                completedFormatted: course.completedAt ? new Date(course.completedAt).toLocaleDateString() : 'Recently'
            }));
            setCompletedCoursesList(completed);
        }
    }, [user?.id]);

    // Calculate skill gaps dynamically
    const userCurrentSkills = user?.currentSkills || {};
    const userTargetRole = user?.targetRole || 'Senior Software Engineer';
    const targetRoleRequirements = ROLE_SKILL_REQUIREMENTS[userTargetRole]?.skills || {};

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

    // Get dynamic course recommendations
    const recommendedCourses = useMemo(() => {
        const enrolledIds = inProgressCourses.map(c => c.id);
        return getRecommendedCourses(skillGaps, enrolledIds, targetRoleRequirements).slice(0, 3);
    }, [skillGaps, inProgressCourses, targetRoleRequirements]);

    const statsDisplay = [
        { label: 'Skills Mastered', value: stats.skillsMastered, total: stats.totalSkills, icon: Award, color: '#818cf8' },
        { label: 'Learning Hours', value: stats.learningHours, unit: 'hrs', icon: Clock, color: '#22d3ee' },
        { label: 'Courses Completed', value: stats.coursesCompleted, icon: CheckCircle2, color: '#10b981' },
        { label: 'Current Streak', value: stats.currentStreak, unit: 'days', icon: Flame, color: '#f59e0b' }
    ];

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">
                {/* Welcome Section */}
                <motion.section
                    className="welcome-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="welcome-content">
                        <div className="welcome-greeting">
                            <span className="greeting-time">Good {getTimeOfDay()}</span>
                            <h1 className="welcome-name">{user?.name || 'User'} 👋</h1>
                        </div>
                        <p className="welcome-subtitle">
                            {user?.careerGoal
                                ? `Working towards: ${user.careerGoal}`
                                : 'Ready to continue your learning journey?'
                            }
                        </p>
                    </div>

                    <div className="ai-insight glass-card">
                        <div className="insight-header">
                            <Sparkles className="insight-icon" size={20} />
                            <span>AI Insight</span>
                        </div>
                        <p className="insight-text">
                            {stats.coursesCompleted > 0 ? (
                                <>Based on your goal of becoming a <strong>{user?.careerGoal || 'Senior Engineer'}</strong>,
                                    I recommend focusing on <strong>System Design</strong> this week.
                                    You've completed {stats.coursesCompleted} course{stats.coursesCompleted !== 1 ? 's' : ''} so far!</>
                            ) : (
                                <>Welcome! Start your learning journey by completing onboarding tasks and enrolling in courses.
                                    Set a <strong>career goal</strong> to get personalized recommendations.</>
                            )}
                        </p>
                        <Link to={stats.coursesCompleted > 0 ? "/learning" : "/onboarding"} className="insight-action">
                            {stats.coursesCompleted > 0 ? 'View Learning Path' : 'Start Onboarding'} <ArrowRight size={16} />
                        </Link>
                    </div>
                </motion.section>

                {/* Stats Grid */}
                <motion.section
                    className="stats-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="stats-grid">
                        {statsDisplay.map((stat, index) => (
                            <div
                                key={stat.label}
                                className={`stat-card ${stat.label === 'Courses Completed' ? 'clickable' : ''}`}
                                onClick={stat.label === 'Courses Completed' ? () => setShowCompletedModal(true) : undefined}
                                role={stat.label === 'Courses Completed' ? 'button' : undefined}
                            >
                                <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
                                    <stat.icon size={22} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-value">
                                        {stat.value}
                                        {stat.unit && <span className="stat-unit">{stat.unit}</span>}
                                    </span>
                                    <span className="stat-label">{stat.label}</span>
                                </div>
                                {stat.total && (
                                    <div className="stat-progress">
                                        <div
                                            className="stat-progress-fill"
                                            style={{
                                                width: `${(stat.value / stat.total) * 100}%`,
                                                background: stat.color
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* Main Content Grid */}
                <div className="dashboard-grid">
                    {/* Today's Tasks */}
                    <motion.section
                        className="tasks-section glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="section-header">
                            <div className="section-title">
                                <Calendar size={20} />
                                <h2>Today's Tasks</h2>
                            </div>
                            <Link to="/onboarding" className="see-all">
                                See all <ChevronRight size={16} />
                            </Link>
                        </div>

                        <div className="tasks-list">
                            {todayTasks.length > 0 ? (
                                todayTasks.map((task) => (
                                    <div key={task.id} className="task-item">
                                        <div className={`task-priority priority-${task.priority}`} />
                                        <div className="task-info">
                                            <span className="task-title">{task.title}</span>
                                            <span className="task-meta">
                                                <span className={`task-type type-${task.type}`}>{task.type}</span>
                                                <span className="task-due">Due in {task.dueIn}</span>
                                            </span>
                                        </div>
                                        <Link
                                            to="/onboarding"
                                            className="task-action btn btn-ghost btn-sm"
                                        >
                                            Start
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <CheckCircle2 size={32} className="empty-icon" />
                                    <p>All caught up! No pending tasks.</p>
                                    <Link to="/learning" className="btn btn-primary btn-sm">
                                        Explore Courses
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.section>

                    {/* Recommended Learning */}
                    <motion.section
                        className="learning-section glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="section-header">
                            <div className="section-title">
                                <BookOpen size={20} />
                                <h2>Recommended for You</h2>
                            </div>
                            <Link to="/learning" className="see-all">
                                See all <ChevronRight size={16} />
                            </Link>
                        </div>

                        <div className="courses-list">
                            {recommendedCourses.length > 0 ? (
                                recommendedCourses.map((course) => (
                                    <Link to="/learning" key={course.id} className="course-item">
                                        <div className="course-info">
                                            <span className="course-title">{course.title}</span>
                                            <span className="course-meta">
                                                <Clock size={14} /> {course.duration}
                                                <span className="course-skill">
                                                    {course.skillsAddressed?.[0]?.skill || 'Skills'}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="course-match">
                                            <span className="match-value">{course.match}%</span>
                                            <span className="match-label">match</span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <BookOpen size={24} className="empty-icon" />
                                    <p>Set your skills and target role to get personalized recommendations!</p>
                                </div>
                            )}
                        </div>
                    </motion.section>

                    {/* Career Progress */}
                    <motion.section
                        className="career-section glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="section-header">
                            <div className="section-title">
                                <TrendingUp size={20} />
                                <h2>Career Progress</h2>
                            </div>
                            <Link to="/career-path" className="see-all">
                                Explore <ChevronRight size={16} />
                            </Link>
                        </div>

                        <div className="career-path-visual">
                            <div className="career-node current">
                                <div className="node-dot" />
                                <div className="node-info">
                                    <span className="node-title">{user?.title || 'Software Engineer'}</span>
                                    <span className="node-status">Current Role</span>
                                </div>
                            </div>
                            <div className="career-connector">
                                <div className="connector-progress" style={{ width: '65%' }} />
                            </div>
                            <div className="career-node target">
                                <div className="node-dot" />
                                <div className="node-info">
                                    <span className="node-title">{user?.careerGoal || 'Senior Engineer'}</span>
                                    <span className="node-status">Target Role</span>
                                </div>
                            </div>
                        </div>

                        <div className="career-stats">
                            <div className="career-stat">
                                <span className="stat-number">{Math.min(Math.round((stats.skillsMastered / stats.totalSkills) * 100), 100)}%</span>
                                <span className="stat-text">Ready for promotion</span>
                            </div>
                            <div className="career-stat">
                                <span className="stat-number">{stats.totalSkills - stats.skillsMastered}</span>
                                <span className="stat-text">Skills to develop</span>
                            </div>
                        </div>
                    </motion.section>


                </div>

                {/* Quick Actions */}
                <motion.section
                    className="quick-actions"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Link to="/opportunities" className="quick-action-card">
                        <Briefcase size={24} />
                        <span>Find Projects</span>
                    </Link>
                    <Link to="/mentorship" className="quick-action-card">
                        <Users size={24} />
                        <span>Find Mentor</span>
                    </Link>
                    <Link to="/agents" className="quick-action-card">
                        <Zap size={24} />
                        <span>AI Agents</span>
                    </Link>
                </motion.section>
            </div>

            {/* Completed Courses Modal */}
            {showCompletedModal && (
                <div className="modal-overlay" onClick={() => setShowCompletedModal(false)}>
                    <div
                        className="modal-content glass-card"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <div className="modal-title">
                                <CheckCircle2 size={24} className="text-secondary" />
                                <h3>Completed Courses</h3>
                            </div>
                            <button className="btn-icon" onClick={() => setShowCompletedModal(false)}>
                                <span size={20}>✕</span>
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
                    </div>
                </div>
            )}
        </div>
    );
}

function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
}

export default Dashboard;
