import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
    ArrowLeft,
    Clock,
    Star,
    CheckCircle2,
    Circle,
    PlayCircle,
    BookOpen,
    Award,
    ChevronRight,
    Lock
} from 'lucide-react';
import { getCourseById } from '../data/courseData';
import { getCourseProgress, updateModuleProgress, getUserCourses } from '../services/userDataService';
import './CourseDetail.css';

function CourseDetail() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [course, setCourse] = useState(null);
    const [moduleProgress, setModuleProgress] = useState({});
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [showCompletionModal, setShowCompletionModal] = useState(false);

    useEffect(() => {
        const courseData = getCourseById(parseInt(courseId));
        if (courseData) {
            setCourse(courseData);
        }

        if (user?.id) {
            const courseProgress = getCourseProgress(user.id, parseInt(courseId));
            if (courseProgress) {
                setModuleProgress(courseProgress.moduleProgress || {});
            }

            const userCourses = getUserCourses(user.id);
            setIsEnrolled(userCourses.enrolled.some(c => c.id === parseInt(courseId)));
        }
    }, [courseId, user?.id]);

    // Memoize progress calculations to prevent unnecessary re-renders
    const { completedModules, totalModules, overallProgress, currentModuleIndex } = useMemo(() => {
        const modules = course?.modules || [];
        const completed = modules.filter(m => moduleProgress[m.id]).length;
        const total = modules.length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Calculate current module index (first incomplete module)
        const firstIncompleteIndex = modules.findIndex(m => !moduleProgress[m.id]);
        const currentIndex = firstIncompleteIndex >= 0 ? firstIncompleteIndex : modules.length - 1;

        return {
            completedModules: completed,
            totalModules: total,
            overallProgress: progress,
            currentModuleIndex: currentIndex
        };
    }, [course?.modules, moduleProgress]);

    const handleModuleComplete = useCallback((moduleId) => {
        if (!user?.id || !course) return;

        const isCompleted = moduleProgress[moduleId] || false;
        const result = updateModuleProgress(user.id, course.id, moduleId, !isCompleted);

        // Update local state with new module progress
        setModuleProgress(prev => ({
            ...prev,
            [moduleId]: !isCompleted
        }));

        if (result.courseCompleted) {
            setShowCompletionModal(true);
        }
    }, [user?.id, course, moduleProgress]);

    if (!course) {
        return (
            <div className="course-detail-page">
                <div className="course-not-found">
                    <BookOpen size={48} />
                    <h2>Course not found</h2>
                    <p>The course you're looking for doesn't exist.</p>
                    <Link to="/learning" className="btn btn-primary">
                        Back to Learning Hub
                    </Link>
                </div>
            </div>
        );
    }


    return (
        <div className="course-detail-page">
            <div className="course-detail-container">
                {/* Header */}
                <motion.div
                    className="course-header-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <button
                        className="back-button"
                        onClick={() => navigate('/learning')}
                    >
                        <ArrowLeft size={20} />
                        Back to Learning Hub
                    </button>

                    <div className="course-header-content">
                        <div className="course-header-info">
                            <span className={`course-level level-${course.level.toLowerCase()}`}>
                                {course.level}
                            </span>
                            <h1>{course.title}</h1>
                            <p className="course-description">{course.description}</p>

                            <div className="course-meta-row">
                                <span className="meta-item">
                                    <Clock size={16} />
                                    {course.duration}
                                </span>
                                <span className="meta-item">
                                    <Star size={16} />
                                    {course.rating}
                                </span>
                                <span className="meta-item">
                                    <BookOpen size={16} />
                                    {totalModules} modules
                                </span>
                                <span className="meta-item provider">
                                    {course.provider}
                                </span>
                            </div>
                        </div>

                        {isEnrolled && (
                            <div className="course-progress-card glass-card">
                                <div className="progress-header">
                                    <span className="progress-label">Your Progress</span>
                                    <span className="progress-value">{overallProgress}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${overallProgress}%` }}
                                    />
                                </div>
                                <div className="progress-stats">
                                    <span>{completedModules} of {totalModules} modules completed</span>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Skills Section */}
                <motion.div
                    className="skills-gained-section glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h3><Award size={20} /> Skills You'll Gain</h3>
                    <div className="skills-list">
                        {course.skillsAddressed?.map(({ skill, points }) => (
                            <div key={skill} className="skill-item">
                                <span className="skill-name">{skill}</span>
                                <span className="skill-points">+{points}%</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Course Roadmap */}
                <motion.div
                    className="course-roadmap-section glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3><BookOpen size={20} /> Course Roadmap</h3>

                    <div className="modules-list">
                        {course.modules?.map((module, index) => {
                            const isCompleted = moduleProgress[module.id] || false;
                            const isLocked = !isEnrolled;
                            const isCurrent = isEnrolled && !isCompleted &&
                                index === currentModuleIndex;

                            return (
                                <div
                                    key={module.id}
                                    className={`module-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}`}
                                >
                                    <div className="module-connector">
                                        <div className="module-dot">
                                            {isLocked ? (
                                                <Lock size={14} />
                                            ) : isCompleted ? (
                                                <CheckCircle2 size={18} />
                                            ) : isCurrent ? (
                                                <PlayCircle size={18} />
                                            ) : (
                                                <Circle size={18} />
                                            )}
                                        </div>
                                        {index < course.modules.length - 1 && (
                                            <div className={`module-line ${isCompleted ? 'completed' : ''}`} />
                                        )}
                                    </div>

                                    <div className="module-content">
                                        <div className="module-header">
                                            <span className={`module-type type-${module.type}`}>
                                                {module.type}
                                            </span>
                                            <span className="module-duration">{module.duration}</span>
                                        </div>
                                        <h4 className="module-title">{module.title}</h4>

                                        {isEnrolled && !isLocked && (
                                            <button
                                                className={`module-action-btn ${isCompleted ? 'completed' : 'primary'}`}
                                                onClick={() => handleModuleComplete(module.id)}
                                            >
                                                {isCompleted ? (
                                                    <>
                                                        <CheckCircle2 size={14} />
                                                        Completed
                                                    </>
                                                ) : (
                                                    <>
                                                        Mark Complete
                                                        <ChevronRight size={14} />
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Completion Modal */}
                {showCompletionModal && (
                    <div className="completion-modal-overlay" onClick={() => setShowCompletionModal(false)}>
                        <motion.div
                            className="completion-modal glass-card"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="completion-icon">
                                <Award size={48} />
                            </div>
                            <h2>🎉 Course Completed!</h2>
                            <p>Congratulations! You've completed <strong>{course.title}</strong></p>
                            <div className="skills-earned">
                                <h4>Skills Improved:</h4>
                                {course.skillsAddressed?.map(({ skill, points }) => (
                                    <span key={skill} className="skill-badge">
                                        {skill} +{points}%
                                    </span>
                                ))}
                            </div>
                            <div className="modal-actions">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate('/learning')}
                                >
                                    Back to Learning Hub
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CourseDetail;
