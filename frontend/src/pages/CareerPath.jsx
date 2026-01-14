import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
    TrendingUp,
    Target,
    CheckCircle2,
    Circle,
    ArrowRight,
    Sparkles,
    BookOpen,
    Users,
    Award,
    Clock,
    ChevronRight
} from 'lucide-react';
import { ROLE_SKILL_REQUIREMENTS, getRoadmapTasks } from '../data/courseData';
import { getUserCourses, getRoadmapProgress, toggleRoadmapTask } from '../services/userDataService';
import './CareerPath.css';

// Generate generic path data (timelines, titles) but NOT the steps
const getCareerPathOptions = (userCurrentSkills, inProgressCourses = []) => {
    // Calculate projected skill gains from in-progress courses
    const projectedSkillGains = {};

    inProgressCourses.forEach(course => {
        if (course.skillsAddressed) {
            course.skillsAddressed.forEach(({ skill, points }) => {
                const progressFactor = (course.progress || 0) / 100;
                const earnedPoints = points * progressFactor;

                if (!projectedSkillGains[skill]) {
                    projectedSkillGains[skill] = 0;
                }
                projectedSkillGains[skill] += earnedPoints;
            });
        }
    });

    const paths = [
        {
            id: 1,
            title: 'Senior Software Engineer',
            timeline: '12-18 months',
            roleKey: 'Senior Software Engineer'
        },
        {
            id: 2,
            title: 'Tech Lead',
            timeline: '24-30 months',
            roleKey: 'Tech Lead'
        },
        {
            id: 3,
            title: 'Data Engineer',
            timeline: '18-24 months',
            roleKey: 'Data Engineer'
        },
        {
            id: 4,
            title: 'DevOps Engineer',
            timeline: '12-18 months',
            roleKey: 'DevOps Engineer'
        },
        {
            id: 'path_ai_engineer',
            title: 'AI Engineer',
            timeline: '12-18 months',
            roleKey: 'AI Engineer'
        },
        {
            id: 5,
            title: 'Full Stack Developer',
            timeline: '12-18 months',
            roleKey: 'Full Stack Developer'
        }
    ];

    return paths.map(path => {
        const requirements = ROLE_SKILL_REQUIREMENTS[path.roleKey]?.skills || {};

        // Calculate skills with gaps, including projected gains
        const skills = Object.entries(requirements).map(([skillName, required]) => {
            const baseCurrent = userCurrentSkills?.[skillName] || 0;
            const projectedGain = projectedSkillGains[skillName] || 0;
            const effectiveCurrent = Math.min(100, Math.round(baseCurrent + projectedGain));

            const gap = Math.max(0, required - effectiveCurrent);

            return {
                name: skillName,
                current: effectiveCurrent,
                baseCurrent,
                projectedGain: Math.round(projectedGain),
                required,
                gap
            };
        });

        // Calculate readiness percentage
        const totalRequired = skills.reduce((sum, s) => sum + s.required, 0);
        const totalCurrent = skills.reduce((sum, s) => sum + Math.min(s.current, s.required), 0);
        const readiness = totalRequired > 0 ? Math.round((totalCurrent / totalRequired) * 100) : 0;

        return {
            ...path,
            readiness,
            skills: skills.sort((a, b) => b.gap - a.gap)
        };
    });
};

function CareerPath() {
    const { user } = useAuth();
    const [inProgressCourses, setInProgressCourses] = useState([]);

    useEffect(() => {
        if (user?.id) {
            const courses = getUserCourses(user.id);
            setInProgressCourses(courses.inProgress || []);
        }
    }, [user?.id]);

    // Generate dynamic career paths based on user data
    const [completedTaskIds, setCompletedTaskIds] = useState([]);
    const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
    const [completedCourseIds, setCompletedCourseIds] = useState([]);

    // Load completed tasks and enrolled courses
    useEffect(() => {
        if (user?.id) {
            try {
                const progress = getRoadmapProgress(user.id);
                setCompletedTaskIds(progress.completedTasks || []);

                const userCourses = getUserCourses(user.id);

                // Enrolled IDs
                const enrolled = userCourses.enrolled || [];
                const eIds = enrolled.map(c => typeof c === 'object' ? c.id : c);
                setEnrolledCourseIds(eIds);

                // Completed IDs
                const completed = userCourses.completed || [];
                const cIds = completed.map(c => typeof c === 'object' ? c.id : c);
                setCompletedCourseIds(cIds);

            } catch (err) {
                console.error("Failed to load roadmap data", err);
            }
        }
    }, [user?.id]);

    // Generate path options
    const careerPaths = useMemo(() => {
        return getCareerPathOptions(user?.currentSkills || {}, inProgressCourses);
    }, [user?.currentSkills, inProgressCourses]);

    // Find and select the path matching user's target role, or first path
    const initialPath = useMemo(() => {
        const userTargetPath = careerPaths.find(p => p.roleKey === user?.targetRole);
        return userTargetPath || careerPaths[0];
    }, [careerPaths, user?.targetRole]);

    const [selectedPath, setSelectedPath] = useState(null);

    useEffect(() => {
        if (initialPath && !selectedPath) {
            setSelectedPath(initialPath);
        }
    }, [initialPath, selectedPath]);

    const currentPath = selectedPath || initialPath;

    // Generate dynamic roadmap steps for the selected path
    const roadmapSteps = useMemo(() => {
        if (!currentPath?.roleKey) return [];
        return getRoadmapTasks(currentPath.roleKey, user?.currentSkills, completedTaskIds, enrolledCourseIds, completedCourseIds);
    }, [currentPath?.roleKey, user?.currentSkills, completedTaskIds, enrolledCourseIds, completedCourseIds]);

    const handleTaskToggle = (taskId) => {
        if (!user?.id) return;
        const newCompleted = toggleRoadmapTask(user.id, taskId);
        setCompletedTaskIds([...newCompleted]);
    };

    return (
        <div className="career-page">
            <div className="career-container">
                {/* Header */}
                <motion.div
                    className="career-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="header-content">
                        <h1>
                            <TrendingUp className="header-icon" />
                            Career Path Explorer
                        </h1>
                        <p>Visualize and plan your career trajectory with AI-powered recommendations</p>
                    </div>

                    <div className="current-role glass-card">
                        <div className="role-label">Current Role</div>
                        <div className="role-title">{user?.title || 'Software Engineer'}</div>
                        <div className="role-tenure">
                            <Clock size={14} />
                            {user?.joinDate ? `Since ${new Date(user.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : '1 year'}
                        </div>
                    </div>
                </motion.div>

                <div className="career-content">
                    {/* Path Selection */}
                    <motion.div
                        className="paths-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h2>Potential Career Paths</h2>

                        <div className="paths-grid">
                            {careerPaths.map((path) => (
                                <div
                                    key={path.id}
                                    className={`path-card glass-card ${currentPath?.id === path.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedPath(path)}
                                >
                                    <div className="path-header">
                                        <h3>{path.title}</h3>
                                        <div className="path-readiness">
                                            <div className="readiness-circle">
                                                <svg viewBox="0 0 36 36">
                                                    <path
                                                        className="readiness-bg"
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    />
                                                    <path
                                                        className="readiness-fill"
                                                        strokeDasharray={`${path.readiness}, 100`}
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    />
                                                </svg>
                                                <span>{path.readiness}%</span>
                                            </div>
                                            <span className="readiness-label">Ready</span>
                                        </div>
                                    </div>
                                    <div className="path-timeline">
                                        <Clock size={14} />
                                        {path.timeline}
                                    </div>
                                    <div className="path-skills-preview">
                                        {path.skills.slice(0, 2).map((skill) => (
                                            <div key={skill.name} className="skill-preview">
                                                <span>{skill.name}</span>
                                                <span className="skill-gap">+{skill.gap}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Selected Path Details */}
                    <motion.div
                        className="path-details"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        key={currentPath?.id}
                    >
                        <div className="details-header">
                            <div>
                                <h2>{currentPath?.title}</h2>
                                <p>Your personalized roadmap based on current skills and goals</p>
                            </div>
                            <div className="ai-badge">
                                <Sparkles size={16} />
                                AI-Generated Roadmap
                            </div>
                        </div>

                        <div className="details-grid">
                            {/* Skill Gaps */}
                            <div className="skill-gaps-card glass-card">
                                <h3>
                                    <Target size={18} />
                                    Skill Gaps to Address
                                </h3>
                                <div className="skill-gaps">
                                    {currentPath?.skills?.map((skill) => (
                                        <div key={skill.name} className="skill-gap-item">
                                            <div className="gap-header">
                                                <span className="gap-name">{skill.name}</span>
                                                <span className="gap-value">+{skill.gap}% needed</span>
                                            </div>
                                            <div className="gap-bar">
                                                <div
                                                    className="gap-current"
                                                    style={{ width: `${skill.current}%` }}
                                                />
                                                <div
                                                    className="gap-required"
                                                    style={{ left: `${skill.required}%` }}
                                                />
                                            </div>
                                            <div className="gap-labels">
                                                <span>Current: {skill.current}%</span>
                                                <span>Required: {skill.required}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Milestones Tracker */}
                            <div className="roadmap-card glass-card">
                                <h3>
                                    <Award size={18} />
                                    Development Milestones
                                </h3>
                                <div className="roadmap-steps-list">
                                    {roadmapSteps.map((step, index) => (
                                        <div key={step.id} className={`milestone-item status-${step.status}`}>
                                            <div className="milestone-checkbox">
                                                {step.type === 'activity' ? (
                                                    <label className="checkbox-container">
                                                        <input
                                                            type="checkbox"
                                                            checked={step.status === 'completed'}
                                                            onChange={() => handleTaskToggle(step.id)}
                                                        />
                                                        <span className="checkmark round"></span>
                                                    </label>
                                                ) : (
                                                    <div className={`status-indicator ${step.status}`}>
                                                        {step.status === 'completed' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="milestone-content">
                                                <div className="milestone-header">
                                                    <span className={`milestone-title ${step.status === 'completed' ? 'completed-text' : ''}`}>
                                                        {step.title}
                                                    </span>
                                                    <span className={`milestone-type type-${step.type}`}>
                                                        {step.type === 'course' ? 'Learning' : 'Activity'}
                                                    </span>
                                                </div>

                                                {step.type === 'course' && step.status !== 'completed' && (
                                                    <Link to={`/learning/course/${step.courseId}`} className="btn btn-primary btn-sm mt-2">
                                                        Start Learning <ArrowRight size={14} />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div className="recommendations glass-card">
                            <h3>
                                <Sparkles size={18} />
                                Recommended Actions
                            </h3>
                            <div className="rec-grid">
                                <Link to="/learning" className="rec-item">
                                    <BookOpen size={20} />
                                    <div>
                                        <span className="rec-title">Browse Learning Courses</span>
                                        <span className="rec-desc">Address your skill gaps with targeted courses</span>
                                    </div>
                                    <ChevronRight size={18} />
                                </Link>
                                <Link to="/mentorship" className="rec-item">
                                    <Users size={20} />
                                    <div>
                                        <span className="rec-title">Find a {currentPath?.title || 'Senior'} Mentor</span>
                                        <span className="rec-desc">Learn from someone in your target role</span>
                                    </div>
                                    <ChevronRight size={18} />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default CareerPath;
